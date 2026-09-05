export const API_BASE_URL = 'https://jgct3kds91.execute-api.af-south-1.amazonaws.com';

export interface AWSUserSession {
  customerId: string;
  fullName: string;
  clientNumber: string;
  email: string;
  idNumber?: string;
  phone?: string;
  vehicle: {
    registration: string;
    make: string;
    model: string;
    year: number;
  };
}

export interface AWSClaimDocument {
  docId: string;
  fileName: string;
  docType: string; // 'DAMAGE_PHOTO' | 'SCENE_PHOTO' | 'THIRD_PARTY_PHOTO' | 'POLICE_REPORT'
  uploadedAt: string;
  s3Key?: string;
  fileUrl?: string;
  dataUrl?: string;
  fileSize?: number;
  fileType?: string;
}

export interface AWSClaim {
  claimId: string;
  insurer: string;
  status: string;
  dateReceived?: string;
  estimatedPayout?: number;
  insurerReference?: string;
  brokerApproved?: boolean;
  incident: {
    date: string;
    location: string;
    summary: string;
    policeReference: string;
    drivable?: boolean;
    thirdPartyInvolved?: boolean;
  };
  policy?: {
    policyNumber: string;
    coverage: string;
    sumInsured: number;
    excess: number;
  };
  vehicle: {
    make: string;
    model: string;
    registration: string;
    year?: number;
  };
  documents?: AWSClaimDocument[];
}

export interface AWSGoal {
  goalId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  targetDate: string;
}

export interface AWSReminder {
  reminderId: string;
  title?: string;
  message: string;
  dueDate: string;
  status: string;
  audience?: string;
  type?: string;
}

export interface AWSCustomerResponse {
  total: number;
  items: Array<any>;
}

// Local memory & persistent cache to store and retrieve high-res image dataUrls locally
// so users can inspect full photos in the browser, while DynamoDB stores clean S3 metadata
const documentImageCache: Record<string, string> = {};

export function cacheDocumentDataUrl(keyOrId: string, dataUrl: string) {
  if (keyOrId && dataUrl) {
    documentImageCache[keyOrId] = dataUrl;
    try {
      sessionStorage.setItem(`RS_IMG_${keyOrId}`, dataUrl);
    } catch {
      // ignore storage quota limits
    }
  }
}

export function getCachedDocumentDataUrl(keyOrId?: string): string | undefined {
  if (!keyOrId) return undefined;
  if (documentImageCache[keyOrId]) return documentImageCache[keyOrId];
  try {
    const stored = sessionStorage.getItem(`RS_IMG_${keyOrId}`);
    if (stored) {
      documentImageCache[keyOrId] = stored;
      return stored;
    }
  } catch {
    // ignore
  }
  return undefined;
}

// 1. Authenticate against AWS API Gateway
export async function loginWithAWS(clientNumber: string, email: string): Promise<{ success: boolean; user?: AWSUserSession; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOGIN',
        clientNumber: clientNumber.trim(),
        email: email.trim(),
      }),
    });

    const data = await res.json();
    if (res.ok && data.authenticated) {
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || 'Invalid credentials. Please verify your client number and email.' };
  } catch (err: any) {
    console.error('AWS login error:', err);
    return { success: false, message: err.message || 'Network error connecting to AWS database.' };
  }
}

// 2. Fetch Customer Items from AWS DynamoDB
export async function fetchCustomerDataFromAWS(customerId: string): Promise<{
  claims: AWSClaim[];
  profile?: any;
  goals: AWSGoal[];
  reminders: AWSReminder[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/?view=customer&customerId=${encodeURIComponent(customerId)}`);
    if (!res.ok) {
      throw new Error(`AWS fetch error: HTTP ${res.status}`);
    }
    const data: AWSCustomerResponse = await res.json();
    const items = data.items || [];

    const claims: AWSClaim[] = items
      .filter((it) => it.entityType === 'CLAIM')
      .map((claim: AWSClaim) => {
        const enrichedDocuments = (claim.documents || []).map((doc) => ({
          ...doc,
          dataUrl: doc.dataUrl || getCachedDocumentDataUrl(doc.s3Key) || getCachedDocumentDataUrl(doc.docId),
        }));
        return {
          ...claim,
          documents: enrichedDocuments,
        };
      });

    const profile = items.find((it) => it.entityType === 'CUSTOMER');
    const goals: AWSGoal[] = items.filter((it) => it.entityType === 'GOAL');
    const reminders: AWSReminder[] = items.filter((it) => it.entityType === 'REMINDER');

    return { claims, profile, goals, reminders };
  } catch (err) {
    console.error('Failed to load customer data from AWS:', err);
    return { claims: [], goals: [], reminders: [] };
  }
}

// 3. Lodge a new claim directly to AWS DynamoDB
export async function logClaimToAWS(payload: {
  customerId: string;
  customerName: string;
  insurer: string;
  incidentDate: string;
  location: string;
  summary: string;
  policeReference?: string;
  drivable: boolean;
  thirdPartyInvolved: boolean;
  vehicle: {
    registration: string;
    make: string;
    model: string;
    year: number;
  };
  documents?: AWSClaimDocument[];
}): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    // Sanitize documents for AWS DynamoDB (DynamoDB has a 400KB item limit).
    // Store S3 metadata, and cache dataUrls locally for browser preview.
    const sanitizedDocuments = (payload.documents || []).map((doc, idx) => {
      const cleanFileName = (doc.fileName || `evidence_${idx + 1}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_');
      const s3Key = doc.s3Key || `claims/${payload.customerId}/${Date.now()}_${cleanFileName}`;
      const fileUrl = doc.fileUrl || `https://royalsync-s3.s3.af-south-1.amazonaws.com/${s3Key}`;
      const docId = doc.docId || `doc_${Date.now()}_${idx}`;

      if (doc.dataUrl) {
        cacheDocumentDataUrl(s3Key, doc.dataUrl);
        cacheDocumentDataUrl(docId, doc.dataUrl);
      }

      // Small SVGs or tiny thumbnails can be kept inline in DynamoDB (< 4KB)
      const isSmall = doc.dataUrl && doc.dataUrl.length < 4096;

      return {
        docId,
        fileName: doc.fileName || cleanFileName,
        docType: doc.docType || 'DAMAGE_PHOTO',
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        s3Key,
        fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        ...(isSmall ? { dataUrl: doc.dataUrl } : {}),
      };
    });

    const res = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'LOG_CLAIM',
        customerId: payload.customerId,
        customerName: payload.customerName,
        insurer: payload.insurer,
        incidentDate: payload.incidentDate,
        location: payload.location,
        summary: payload.summary,
        policeReference: payload.policeReference || 'PENDING',
        drivable: payload.drivable,
        thirdPartyInvolved: payload.thirdPartyInvolved,
        vehicle: payload.vehicle,
        documents: sanitizedDocuments,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errMsg = data.error || data.message || `Failed to lodge claim to AWS database (HTTP ${res.status})`;
      throw new Error(errMsg);
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('AWS claim log error:', err.message || err);
    return { success: false, message: err.message || 'Error submitting claim to AWS database.' };
  }
}
