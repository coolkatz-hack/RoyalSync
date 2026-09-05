export type TabType = 
  | 'dashboard' 
  | 'claims' 
  | 'goals' 
  | 'reminders' 
  | 'services' 
  | 'profile';

export interface ClientProfile {
  id: string;
  fullName: string;
  idNumber: string;
  clientNumber: string;
  email: string;
  phone: string;
  address: string;
  employment: string;
  employer: string;
  occupation?: string;
  monthlyGrossIncome: number;
  monthlyExpenses: number;
  taxNumber: string;
  adviser: {
    name: string;
    fspNumber: string;
    director: string;
    office: string;
    phone: string;
    email: string;
    address: string;
  };
}

export type AssetCategory = 'investments' | 'life_insurance' | 'short_term' | 'medical' | 'property';

export interface PolicyAsset {
  id: string;
  category: AssetCategory;
  provider: 'Santam' | 'Sanlam' | 'Old Mutual' | 'Liberty' | 'Momentum' | 'Discovery' | 'Allan Gray' | 'Standard Bank' | 'Other';
  name: string;
  policyNumber: string;
  currentValue: number; // In ZAR
  monthlyPremium: number;
  coverAmount?: number;
  status: 'Active' | 'Under Review' | 'In Claim' | 'Paid Up';
  renewalDate?: string;
  description: string;
  details?: { [key: string]: string };
}

export interface LiabilityItem {
  id: string;
  provider?: string;
  institution?: string;
  name: string;
  accountNumber: string;
  totalBalance: number;
  monthlyPayment: number;
  monthlyRepayment?: number;
  interestRate: string;
}

export interface AutomatedReminder {
  id: string;
  type: 
    | 'valuation_certificate' 
    | 'driving_licence' 
    | 'annual_review' 
    | 'retirement_fee' 
    | 'birthday_anniversary' 
    | 'police_report' 
    | 'compliance_fica';
  title: string;
  description: string;
  dueDate: string;
  frequency: string; // e.g. "Every 2 years", "Annual", "Within 48 hours"
  targetRecipient: 'client' | 'us' | 'both'; // "sent to us, to the client, or to both"
  severity: 'urgent' | 'warning' | 'info';
  status: 'pending' | 'action_required' | 'completed' | 'dismissed';
  actionLabel?: string;
  actionType?: string;
  lastCompletedDate?: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: 'retirement' | 'education' | 'offshore' | 'emergency' | 'wealth' | 'property';
  targetAmount: number;
  currentAmount: number;
  currency: 'ZAR' | 'USD';
  targetYear: number;
  monthlyContribution: number;
  progressPercent: number;
  ownership: 'individual' | 'shared';
  sharedWith?: string;
  adviserNote: string;
  status: 'on_track' | 'attention_needed' | 'completed';
}

export interface AccidentChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  notes?: string;
  photoCount?: number;
  voiceNoteAttached?: boolean;
}

export interface MotorClaimStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
  notes?: string;
  actionRequired?: boolean;
  actionPrompt?: string;
  metadata?: { [key: string]: string | number };
}

export interface MotorClaim {
  id: string;
  claimReference: string;
  insurer: 'Santam' | 'Sanlam' | 'OUTsurance' | 'Discovery Insure' | 'Momentum' | 'Old Mutual Insure' | 'Hollard' | string;
  policyNumber: string;
  incidentDate: string;
  incidentTime: string;
  incidentLocation: string;
  incidentDescription: string;
  
  // Police report
  policeNotified: boolean;
  policeCaseNumber?: string;
  policeStation?: string;
  policeReportDeadline?: string;
  
  // Driver & vehicle
  driverName: string;
  driverLicenceNumber: string;
  driverUsageType: 'personal' | 'business';
  vehicleModel: string;
  vehicleRegistration: string;
  
  // Third party
  thirdPartyInvolved: boolean;
  thirdPartyDetails?: {
    name: string;
    phone: string;
    vehicleReg: string;
    insurer: string;
    policyNumber: string;
  };

  // Witnesses
  witnessDetails?: string;
  hasWitnessStatement?: boolean;

  // Cloud uploads summary
  photosCount: number;
  hasSketch: boolean;
  hasLicenceDiscPhoto: boolean;
  documents?: Array<{
    docId: string;
    fileName: string;
    docType: string;
    uploadedAt: string;
    s3Key?: string;
    dataUrl?: string;
    fileUrl?: string;
    fileSize?: number;
  }>;

  // 10 Steps progress
  currentStepIndex: number;
  steps: MotorClaimStep[];
  handlerName?: string;
  handlerContact?: string;
  authorisedAmount?: number;
  excessPayable?: number;
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  type: 
    | 'change_address' 
    | 'change_bank' 
    | 'request_policy_doc' 
    | 'request_border_letter' 
    | 'request_tax_cert' 
    | 'request_consultation' 
    | 'balance_sheet_update';
  title: string;
  description?: string;
  referenceNumber?: string;
  status: 'Processing' | 'Approved & Synced' | 'Pending Documents' | 'Requires Review' | 'submitted' | 'completed' | 'in_progress';
  submittedDate?: string;
  dateSubmitted?: string;
  details?: { [key: string]: string };
  documentUrl?: string;
  notes?: string;
}
