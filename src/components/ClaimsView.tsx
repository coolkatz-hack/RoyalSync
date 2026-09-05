import React, { useState } from 'react';
import { 
  Car, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Camera, 
  MapPin, 
  Mic, 
  FileText, 
  UploadCloud, 
  Calendar, 
  ChevronRight, 
  User, 
  Phone, 
  AlertCircle, 
  Check, 
  Send,
  Plus,
  Star,
  Download,
  Building,
  ArrowLeft,
  Database,
  Eye,
  X,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { AccidentChecklistItem, MotorClaim, MotorClaimStep } from '../types';
import { AccidentSketchCanvas } from './AccidentSketchCanvas';
import { formatZAR, formatDate } from '../utils/formatters';
import { AWSClaim, AWSUserSession } from '../services/awsApi';
import { AwsClaimsSection } from './AwsClaimsSection';
import { ClaimPhotoUploader, AttachedPhotoItem } from './ClaimPhotoUploader';
import { AWSClaimDocument } from '../services/awsApi';

interface ClaimsViewProps {
  activeClaim: MotorClaim | undefined;
  sceneChecklist: AccidentChecklistItem[];
  onToggleChecklistItem: (id: string) => void;
  onUpdateChecklistNotes: (id: string, notes: string) => void;
  onAdvanceClaimStep: (claimId: string, nextStepIndex: number, notes?: string) => void;
  onCreateNewClaim: (newClaim: MotorClaim) => void;
  initialMode?: 'checklist' | 'register' | 'tracker' | 'aws_list';
  awsClaims: AWSClaim[];
  awsLoading: boolean;
  awsUser: AWSUserSession | null;
  onRefreshAwsClaims: () => void;
  onLodgeClaimToAws: (payload: {
    insurer: string;
    incidentDate: string;
    location: string;
    summary: string;
    policeReference: string;
    drivable: boolean;
    thirdPartyInvolved: boolean;
    documents?: AWSClaimDocument[];
  }) => Promise<boolean>;
}

export const ClaimsView: React.FC<ClaimsViewProps> = ({
  activeClaim,
  sceneChecklist,
  onToggleChecklistItem,
  onUpdateChecklistNotes,
  onAdvanceClaimStep,
  onCreateNewClaim,
  initialMode = 'aws_list',
  awsClaims = [],
  awsLoading = false,
  awsUser,
  onRefreshAwsClaims,
  onLodgeClaimToAws
}) => {
  const [currentMode, setCurrentMode] = useState<'aws_list' | 'tracker' | 'checklist' | 'register'>(initialMode);
  
  // Interactive Claim Registration Form State
  const [selectedInsurer, setSelectedInsurer] = useState<'Santam' | 'Discovery Insure' | 'Momentum' | 'Old Mutual Insure' | 'Hollard'>('Santam');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [incidentTime, setIncidentTime] = useState<string>('14:30');
  const [incidentLocation, setIncidentLocation] = useState<string>('Corner Grayston Drive & Rivonia Road, Sandton');
  const [incidentDescription, setIncidentDescription] = useState<string>('Third-party vehicle turned across oncoming lane and struck right front quarter and bumper.');
  
  // Police details
  const [policeNotified, setPoliceNotified] = useState<boolean>(true);
  const [policeCaseNumber, setPoliceCaseNumber] = useState<string>('CAS 491/09/2026');
  const [policeStation, setPoliceStation] = useState<string>('Sandton SAPS');
  
  // Driver & Vehicle
  const [driverName, setDriverName] = useState<string>('Sipho Dlamini');
  const [driverLicenceNumber, setDriverLicenceNumber] = useState<string>('DL-840612-GP');
  const [driverUsageType, setDriverUsageType] = useState<'personal' | 'business'>('personal');
  const [vehicleModel, setVehicleModel] = useState<string>('2023 BMW 320d M Sport');
  const [vehicleRegistration, setVehicleRegistration] = useState<string>('HG 44 DF GP');
  
  // Third Party
  const [thirdPartyInvolved, setThirdPartyInvolved] = useState<boolean>(true);
  const [thirdPartyName, setThirdPartyName] = useState<string>('Kagiso Moeketsi');
  const [thirdPartyPhone, setThirdPartyPhone] = useState<string>('071 892 4410');
  const [thirdPartyReg, setThirdPartyReg] = useState<string>('ND 819 203');
  const [thirdPartyInsurer, setThirdPartyInsurer] = useState<string>('Discovery Insure');
  const [thirdPartyPolicy, setThirdPartyPolicy] = useState<string>('DIS-MTR-9021');

  // Witnesses
  const [witnessDetails, setWitnessDetails] = useState<string>('Mr. Ndlovu (Grayston Shopping Centre Security) 073 119 4821');
  const [hasWitnessStatement, setHasWitnessStatement] = useState<boolean>(true);

  // Cloud uploads & attached photos for AWS storage
  const [wizardPhotos, setWizardPhotos] = useState<AttachedPhotoItem[]>([
    {
      docId: 'doc_init_1',
      fileName: 'vehicle_impact_photo.jpg',
      docType: 'DAMAGE_PHOTO',
      fileSize: 245000,
      fileType: 'image/jpeg',
      dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><path d="M100 240 Q 300 200 500 240 L 480 340 L 120 340 Z" fill="%23cbd5e1" stroke="%23475569" stroke-width="4"/><path d="M 240 220 Q 280 270 340 230 Q 320 280 260 270 Z" fill="%23334155" stroke="%230f172a" stroke-width="3"/><path d="M 270 235 L 310 255 M 285 240 L 295 265" stroke="%23dc2626" stroke-width="3"/><text x="30" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2394a3b8">VEHICLE IMPACT EVIDENCE</text></svg>`,
      s3Key: 'claims/cust_001/vehicle_impact_photo.jpg',
      uploadedAt: new Date().toISOString()
    },
    {
      docId: 'doc_init_2',
      fileName: 'saps_accident_slip.jpg',
      docType: 'POLICE_REPORT',
      fileSize: 180000,
      fileType: 'image/jpeg',
      dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="320" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="300" y="80" font-family="serif" font-size="18" font-weight="bold" fill="%230f172a" text-anchor="middle">SAPS ACCIDENT REPORT</text><text x="300" y="105" font-family="sans-serif" font-size="13" fill="%23475569" text-anchor="middle">OFFICIAL OAR SLIP</text><line x1="80" y1="120" x2="520" y2="120" stroke="%2394a3b8" stroke-width="1"/><circle cx="440" cy="220" r="45" fill="none" stroke="%232563eb" stroke-width="3" stroke-dasharray="6,4"/><text x="440" y="225" font-family="sans-serif" font-size="11" font-weight="bold" fill="%232563eb" text-anchor="middle">SAPS VERIFIED</text></svg>`,
      s3Key: 'claims/cust_001/saps_accident_slip.jpg',
      uploadedAt: new Date().toISOString()
    }
  ]);
  const [sketchData, setSketchData] = useState<string>('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState<boolean>(false);
  const [trackerPreviewDoc, setTrackerPreviewDoc] = useState<{
    fileName: string;
    docType: string;
    url?: string;
    s3Key?: string;
  } | null>(null);

  // Interactive booking date selection for Step 6
  const [selectedDropoffDate, setSelectedDropoffDate] = useState<string>('2026-09-08');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Review state for Step 10
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Exceptional assistance from Qiniso Ntuli and Royal Square Financial. Courtesy car was delivered promptly and repair quality at Renew-it is seamless.');
  const [isReviewSubmitted, setIsReviewSubmitted] = useState<boolean>(false);

  // Voice note simulation for checklist
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [hasRecordedVoice, setHasRecordedVoice] = useState<boolean>(false);

  const handleSelectAwsClaimForTracker = (claim: AWSClaim) => {
    const isSubmitted = claim.status === 'SUBMITTED';
    const steps: MotorClaimStep[] = [
      {
        stepNumber: 1,
        title: 'Insurer returns a claim number and a claims handler',
        description: `${claim.insurer} registered claim #${claim.insurerReference || claim.claimId}. Direct submission to insurer database.`,
        status: 'completed',
        date: claim.dateReceived ? new Date(claim.dateReceived).toLocaleDateString('en-ZA') : new Date().toLocaleDateString('en-ZA'),
        notes: `Recorded on AWS DynamoDB (${claim.claimId}).`
      },
      {
        stepNumber: 2,
        title: 'Client takes the vehicle for assessment',
        description: 'Take vehicle to approved drive-in assessment center or schedule mobile assessor.',
        status: isSubmitted ? 'current' : 'completed',
        actionRequired: isSubmitted,
        actionPrompt: 'Schedule drive-in inspection'
      },
      {
        stepNumber: 3,
        title: 'Assessment goes to the insurer and to us',
        description: 'Comprehensive digital damage audit and parts schedule sent to broker and insurer.',
        status: isSubmitted ? 'upcoming' : 'current'
      },
      {
        stepNumber: 4,
        title: 'Repair quotes go to the insurer',
        description: 'Manufacturer-approved panel repairer submits formal repair quotation.',
        status: 'upcoming'
      },
      {
        stepNumber: 5,
        title: 'Insurer authorises repairs',
        description: `Insurer approves repair costs and confirms client basic excess (R ${claim.policy?.excess || 3500}).`,
        status: 'upcoming'
      },
      {
        stepNumber: 6,
        title: 'Client picks a date for the vehicle to go in',
        description: 'Select your preferred vehicle drop-off date with the repairer.',
        status: 'upcoming'
      },
      {
        stepNumber: 7,
        title: 'We arrange car hire and delivery to the repairer',
        description: 'Royal Square Financial arranges courtesy car hire with Europcar/Avis delivered at drop-off.',
        status: 'upcoming'
      },
      {
        stepNumber: 8,
        title: 'Repair updates throughout the process',
        description: 'Real-time SMS & portal updates as parts arrive, panel beating proceeds, and spray painting completes.',
        status: 'upcoming'
      },
      {
        stepNumber: 9,
        title: 'Collect the vehicle, pay excess, return hire car',
        description: 'Client inspects vehicle, signs clearance certificate, settles excess, and hands back courtesy vehicle.',
        status: 'upcoming'
      },
      {
        stepNumber: 10,
        title: 'Client reviews the service and repair work',
        description: 'Final quality assurance sign-off with Royal Square Financial & Santam client survey.',
        status: 'upcoming'
      }
    ];

    const converted: MotorClaim = {
      id: claim.claimId,
      claimReference: claim.insurerReference || claim.claimId,
      insurer: claim.insurer,
      policyNumber: claim.policy?.policyNumber || (claim.insurer === 'Sanlam' ? 'SAN-POL-9921' : 'OUT-POL-304'),
      incidentDate: claim.incident?.date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      incidentTime: '12:00',
      incidentLocation: claim.incident?.location || '',
      incidentDescription: claim.incident?.summary || '',
      policeNotified: !!claim.incident?.policeReference,
      policeCaseNumber: claim.incident?.policeReference,
      policeStation: 'Sandton SAPS',
      driverName: awsUser?.fullName || 'Sipho Ndlovu',
      driverLicenceNumber: 'DL-910214-GP',
      driverUsageType: 'personal',
      vehicleModel: `${claim.vehicle?.year || 2023} ${claim.vehicle?.make || 'Toyota'} ${claim.vehicle?.model || 'Corolla Cross'}`,
      vehicleRegistration: claim.vehicle?.registration || 'CA123456',
      thirdPartyInvolved: !!claim.incident?.thirdPartyInvolved,
      photosCount: claim.documents?.length || 2,
      hasSketch: true,
      hasLicenceDiscPhoto: true,
      documents: claim.documents,
      currentStepIndex: isSubmitted ? 1 : 2,
      steps,
      authorisedAmount: claim.estimatedPayout || 25000,
      createdAt: claim.dateReceived || new Date().toISOString(),
    };

    onCreateNewClaim(converted);
    setCurrentMode('tracker');
  };

  const handleSimulateVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setTimeout(() => {
        setIsRecordingVoice(false);
        setHasRecordedVoice(true);
      }, 2000);
    }
  };

  const handleAddPhoto = () => {
    const photoNames = ['driver_licence_card_front.jpg', 'road_skid_marks.jpg', 'other_car_licence_plate.jpg', 'point_of_impact_close.jpg'];
    const nextPhoto = photoNames[wizardPhotos.length % photoNames.length];
    setWizardPhotos(prev => [
      ...prev,
      {
        docId: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fileName: nextPhoto,
        docType: nextPhoto.includes('licence') ? 'DRIVERS_LICENCE' : 'DAMAGE_PHOTO',
        uploadedAt: new Date().toISOString(),
        fileSize: 125000,
        dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><text x="300" y="200" font-family="sans-serif" font-size="18" fill="%23e2e8f0" text-anchor="middle">${nextPhoto}</text></svg>`,
      }
    ]);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClaim(true);

    const newClaimId = 'claim-' + Date.now();
    const referencePrefix = selectedInsurer.toUpperCase().substring(0, 3);
    const reference = `${referencePrefix}-${Math.floor(100000 + Math.random() * 900000)}-MTR`;

    // Automatically lodge claim & evidence pictures to AWS DynamoDB / S3
    try {
      const ok = await onLodgeClaimToAws({
        insurer: selectedInsurer,
        incidentDate: `${incidentDate}T${incidentTime}:00Z`,
        location: incidentLocation,
        summary: incidentDescription,
        policeReference: policeNotified ? policeCaseNumber : 'PENDING',
        drivable: true,
        thirdPartyInvolved,
        documents: wizardPhotos
      });
      if (!ok) {
        console.warn('Note: Claim saved in local tracker, offline sync queued for AWS.');
      }
    } catch (err: any) {
      console.warn('Note: Claim registered in local tracker:', err?.message || err);
    } finally {
      setIsSubmittingClaim(false);
    }

    const fullSteps: MotorClaimStep[] = [
      {
        stepNumber: 1,
        title: 'Insurer returns a claim number and a claims handler',
        description: `${selectedInsurer} registered claim #${reference}. Assigned handler: Thabo Molefe.`,
        status: 'completed',
        date: new Date().toLocaleDateString('en-ZA') + ' ' + new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
        notes: 'Submitted directly to product provider API via Royal Square Financial.'
      },
      {
        stepNumber: 2,
        title: 'Client takes the vehicle for assessment',
        description: 'Take vehicle to approved drive-in assessment center or schedule mobile assessor.',
        status: 'current',
        actionRequired: true,
        actionPrompt: 'Schedule drive-in inspection'
      },
      {
        stepNumber: 3,
        title: 'Assessment goes to the insurer and to us',
        description: 'Comprehensive digital damage audit and parts schedule sent to broker and insurer.',
        status: 'upcoming'
      },
      {
        stepNumber: 4,
        title: 'Repair quotes go to the insurer',
        description: 'Manufacturer-approved panel repairer submits formal repair quotation.',
        status: 'upcoming'
      },
      {
        stepNumber: 5,
        title: 'Insurer authorises repairs',
        description: 'Insurer approves repair costs and confirms client basic excess.',
        status: 'upcoming'
      },
      {
        stepNumber: 6,
        title: 'Client picks a date for the vehicle to go in',
        description: 'Select your preferred vehicle drop-off date with the repairer.',
        status: 'upcoming'
      },
      {
        stepNumber: 7,
        title: 'We arrange car hire and delivery to the repairer',
        description: 'Royal Square Financial arranges courtesy car hire with Europcar/Avis delivered at drop-off.',
        status: 'upcoming'
      },
      {
        stepNumber: 8,
        title: 'Weekly repair updates pushed to us',
        description: 'Automated repair milestone status (Strip, Panel, Paint, Assembly, Quality check).',
        status: 'upcoming'
      },
      {
        stepNumber: 9,
        title: 'We arrange collection and return of the hire car',
        description: 'Vehicle collected from repairer, quality sign-off, and hire car returned seamlessly.',
        status: 'upcoming'
      },
      {
        stepNumber: 10,
        title: 'Client writes a short review and closes the transaction',
        description: 'Confirm vehicle satisfaction and complete transaction closure.',
        status: 'upcoming'
      }
    ];

    const newClaim: MotorClaim = {
      id: newClaimId,
      claimReference: reference,
      insurer: selectedInsurer,
      policyNumber: 'SAN-774921-B',
      incidentDate,
      incidentTime,
      incidentLocation,
      incidentDescription,
      policeNotified,
      policeCaseNumber: policeNotified ? policeCaseNumber : 'Pending SAPS Report (within 48h)',
      policeStation: policeNotified ? policeStation : 'Pending SAPS Station',
      driverName,
      driverLicenceNumber,
      driverUsageType,
      vehicleModel,
      vehicleRegistration,
      thirdPartyInvolved,
      thirdPartyDetails: thirdPartyInvolved ? {
        name: thirdPartyName,
        phone: thirdPartyPhone,
        vehicleReg: thirdPartyReg,
        insurer: thirdPartyInsurer,
        policyNumber: thirdPartyPolicy
      } : undefined,
      witnessDetails,
      hasWitnessStatement,
      photosCount: wizardPhotos.length,
      hasSketch: !!sketchData,
      hasLicenceDiscPhoto: true,
      documents: wizardPhotos,
      currentStepIndex: 1, // Advance to step 2
      steps: fullSteps,
      handlerName: 'Thabo Molefe',
      handlerContact: '011 380 4000 • claims@royalsquare.co.za',
      authorisedAmount: 38500,
      excessPayable: 3500,
      createdAt: new Date().toISOString()
    };

    onCreateNewClaim(newClaim);
    setCurrentMode('tracker');
  };

  const handleConfirmDropoffBooking = () => {
    if (!activeClaim) return;
    setIsSubmittingBooking(true);
    setTimeout(() => {
      setIsSubmittingBooking(false);
      // Advance to step 7 (Index 6)
      onAdvanceClaimStep(
        activeClaim.id, 
        6, 
        `Vehicle drop-off confirmed for ${selectedDropoffDate} at Renew-it Sandton. Europcar courtesy vehicle requested.`
      );
    }, 700);
  };

  const handleSubmitReviewAndClose = () => {
    if (!activeClaim) return;
    setIsReviewSubmitted(true);
    onAdvanceClaimStep(
      activeClaim.id,
      9,
      `Client completed 5-star review: "${reviewComment}". Claim transaction successfully finalized.`
    );
  };

  return (
    <div id="claims-view-container" className="space-y-6">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Car className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Short-Term Insurance & Motor Claims</h2>
              <p className="text-xs text-slate-500">
                Direct broker assist: Santam, Discovery Insure, Momentum, Old Mutual
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            id="tab-aws-claims"
            onClick={() => setCurrentMode('aws_list')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              currentMode === 'aws_list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>AWS Claims ({awsClaims.length})</span>
          </button>

          <button
            type="button"
            id="tab-active-tracker"
            onClick={() => setCurrentMode('tracker')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              currentMode === 'tracker'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>10-Step Tracker</span>
          </button>

          <button
            type="button"
            id="tab-scene-checklist"
            onClick={() => setCurrentMode('checklist')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              currentMode === 'checklist'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Scene Checklist</span>
          </button>

          <button
            type="button"
            id="tab-register-claim"
            onClick={() => setCurrentMode('register')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              currentMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Claim</span>
          </button>
        </div>
      </div>

      {/* MODE 0: LIVE AWS CLAIMS FROM DYNAMODB */}
      {currentMode === 'aws_list' && (
        <AwsClaimsSection
          claims={awsClaims}
          loading={awsLoading}
          user={awsUser}
          onRefresh={onRefreshAwsClaims}
          onSelectClaimForTracker={handleSelectAwsClaimForTracker}
          onLodgeNewClaim={onLodgeClaimToAws}
        />
      )}

      {/* MODE 1: AT-THE-SCENE EMERGENCY CHECKLIST (Requested in Image 1 & 2) */}
      {currentMode === 'checklist' && (
        <div id="scene-checklist-panel" className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                  Immediate Action Required At Scene
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">What to gather at the scene of an accident or loss</h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                  &ldquo;Getting this right at the scene is what makes the claim go smoothly later.&rdquo; Tick off each item as you collect evidence.
                </p>
              </div>

              {/* Emergency roadside quick dial */}
              <div className="flex items-center gap-2 shrink-0 bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Santam 24hr Roadside Assist</span>
                  <a href="tel:0860505911" className="text-xs font-bold text-amber-700 hover:underline">0860 505 911</a>
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">SAPS Police Emergency</span>
                  <a href="tel:10111" className="text-xs font-bold text-rose-700 hover:underline">10111</a>
                </div>
              </div>
            </div>
          </div>

          {/* 8 Scene Checklist Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sceneChecklist.map((item, idx) => (
              <div
                key={item.id}
                id={`scene-item-${item.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  item.completed 
                    ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs' 
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleChecklistItem(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      item.completed 
                        ? 'bg-emerald-600 text-white' 
                        : 'border-2 border-slate-300 hover:border-amber-500'
                    }`}
                  >
                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold ${item.completed ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {idx + 1}. {item.label}
                      </h4>
                      {item.id === 'chk-8' && (
                        <span className="text-[10px] font-bold uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          48h Law
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Contextual actions for checklist */}
                    {item.id === 'chk-1' && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <Camera className="w-3 h-3 text-slate-500" />
                          {item.photoCount || 3} Photos Captured
                        </span>
                        <button
                          type="button"
                          onClick={() => alert('Camera simulator: Added road surface photos to cloud vault.')}
                          className="text-[11px] text-amber-700 hover:underline font-semibold"
                        >
                          + Take Photo
                        </button>
                      </div>
                    )}

                    {item.id === 'chk-2' && (
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          {item.notes || 'Sandton, Johannesburg'}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateChecklistNotes(item.id, 'Corner Grayston Dr & Rivonia Rd, Sandton (-26.1076, 28.0567)')}
                          className="text-[11px] text-amber-700 hover:underline font-semibold"
                        >
                          Detect GPS
                        </button>
                      </div>
                    )}

                    {item.id === 'chk-6' && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSimulateVoiceRecording}
                          className={`text-[11px] px-2.5 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors ${
                            isRecordingVoice
                              ? 'bg-rose-600 text-white animate-pulse'
                              : hasRecordedVoice
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          {isRecordingVoice ? 'Recording witness audio...' : hasRecordedVoice ? 'Voice Note Saved (0:48)' : 'Record Witness Voice Note'}
                        </button>
                      </div>
                    )}

                    {item.id === 'chk-8' && (
                      <div className="pt-2 bg-rose-50 p-2 rounded-lg border border-rose-100 text-[11px] text-rose-800 flex items-center justify-between">
                        <span>Legal reminder: Must report to SAPS within 48h</span>
                        <span className="font-bold">Clock Ticking</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transition CTA to Register Motor Claim */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Done gathering at the scene?</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Proceed to register the formal claim with Santam or your designated insurer.
              </p>
            </div>
            <button
              type="button"
              id="proceed-to-claim-btn"
              onClick={() => setCurrentMode('register')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow transition-all flex items-center gap-2"
            >
              <span>Proceed to Register Motor Claim</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: REGISTER A MOTOR CLAIM FORM (Requested in Image 2) */}
      {currentMode === 'register' && (
        <form onSubmit={handleSubmitClaim} id="register-motor-claim-form" className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register a Motor Claim</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The app collects incident details, third-party info, police report, and accident sketch for direct insurer transmission.
                </p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                Direct Provider Integration
              </span>
            </div>

            {/* Step 1: Select Insurer & Vehicle */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                1. Select Insurer & Insured Vehicle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(['Santam', 'Discovery Insure', 'Momentum', 'Old Mutual Insure', 'Hollard'] as const).map((ins) => (
                  <button
                    type="button"
                    key={ins}
                    onClick={() => setSelectedInsurer(ins)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedInsurer === ins
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">{ins}</span>
                    <span className="text-[11px] text-slate-500">
                      {ins === 'Santam' ? 'Policy #SAN-774921-B (Primary)' : 'Broker Direct Channel'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Vehicle Description</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Date, Time & Incident Description */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                2. Incident Date, Time & Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Date of Incident</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Time of Incident</label>
                  <input
                    type="time"
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Location / Cross Streets</label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Description of Incident</label>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Explain how collision occurred, road surface conditions, traffic lights, and speeds..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>
            </div>

            {/* Step 3: Police Notification (48h Requirement) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  3. Police Report (SAPS 48-Hour Legal Requirement)
                </h4>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-600">Police Notified?</label>
                  <input
                    type="checkbox"
                    checked={policeNotified}
                    onChange={(e) => setPoliceNotified(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>
              </div>

              {policeNotified ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">SAPS Police Station</label>
                    <input
                      type="text"
                      value={policeStation}
                      onChange={(e) => setPoliceStation(e.target.value)}
                      placeholder="e.g. Sandton SAPS"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Accident Report (AR) / CAS Case #</label>
                    <input
                      type="text"
                      value={policeCaseNumber}
                      onChange={(e) => setPoliceCaseNumber(e.target.value)}
                      placeholder="e.g. CAS 312/09/2026"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-amber-500/40"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                  <span>Pending report: Reminder will be active on your dashboard to report to police within 48h.</span>
                  <span className="font-bold text-amber-900">48h Window</span>
                </div>
              )}
            </div>

            {/* Step 4: Driver Details & Vehicle Usage */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                4. Who Was Driving & Purpose of Use
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Driver Licence Number</label>
                  <input
                    type="text"
                    value={driverLicenceNumber}
                    onChange={(e) => setDriverLicenceNumber(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Vehicle Use At Incident Time</label>
                  <select
                    value={driverUsageType}
                    onChange={(e) => setDriverUsageType(e.target.value as 'personal' | 'business')}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                  >
                    <option value="personal">Personal / Social / Domestic</option>
                    <option value="business">Business / Commercial Use</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 5: Third Party Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  5. Third Party Details (Other Vehicles Involved)
                </h4>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-600">Third Party Involved?</label>
                  <input
                    type="checkbox"
                    checked={thirdPartyInvolved}
                    onChange={(e) => setThirdPartyInvolved(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                </div>
              </div>

              {thirdPartyInvolved && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Third Party Driver Name</label>
                    <input
                      type="text"
                      value={thirdPartyName}
                      onChange={(e) => setThirdPartyName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={thirdPartyPhone}
                      onChange={(e) => setThirdPartyPhone(e.target.value)}
                      placeholder="082 000 0000"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Vehicle Registration</label>
                    <input
                      type="text"
                      value={thirdPartyReg}
                      onChange={(e) => setThirdPartyReg(e.target.value)}
                      placeholder="e.g. ND 819 203"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Their Insurer</label>
                    <input
                      type="text"
                      value={thirdPartyInsurer}
                      onChange={(e) => setThirdPartyInsurer(e.target.value)}
                      placeholder="e.g. Discovery Insure / Outsurance"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Their Policy Number</label>
                    <input
                      type="text"
                      value={thirdPartyPolicy}
                      onChange={(e) => setThirdPartyPolicy(e.target.value)}
                      placeholder="Policy # or Broker"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 6: Cloud Uploads & Interactive Accident Sketch */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                6. Cloud Uploads & Accident Sketch (Required for Assessment)
              </h4>
              <p className="text-xs text-slate-500">
                &ldquo;Uploads to AWS cloud: photos of all vehicles, damage, road surface, registration discs and licences, driver&apos;s licence and a sketch of the accident.&rdquo;
              </p>

              {/* Photo Uploads Component with Drag & Drop, Preview, and S3 metadata */}
              <div className="space-y-3">
                <ClaimPhotoUploader
                  photos={wizardPhotos}
                  onChange={setWizardPhotos}
                  maxPhotos={8}
                />
              </div>

              {/* Interactive Sketch Canvas */}
              <AccidentSketchCanvas onSaveSketch={(data) => setSketchData(data)} />
            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentMode('checklist')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Back to Checklist
              </button>
              <button
                type="submit"
                id="submit-motor-claim-btn"
                disabled={isSubmittingClaim}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-400 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingClaim ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Lodge & Upload Photos to AWS...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Motor Claim to {selectedInsurer} & Store on AWS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODE 3: ACTIVE 10-STEP CLAIM TRACKER (Requested in Image 2) */}
      {currentMode === 'tracker' && (
        <div id="active-claim-tracker-panel" className="space-y-6">
          {!activeClaim ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Active Motor Claims</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You do not have any pending claims in progress. If you were involved in an accident, tap &apos;Register Claim&apos; or use the &apos;Scene Checklist&apos;.
              </p>
              <button
                type="button"
                onClick={() => setCurrentMode('register')}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-500"
              >
                Register a Motor Claim
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Claim Overview Header Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        {activeClaim.insurer} Comprehensive
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {activeClaim.claimReference}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeClaim.vehicleModel} ({activeClaim.vehicleRegistration})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Incident: {formatDate(activeClaim.incidentDate)} at {activeClaim.incidentTime} • {activeClaim.incidentLocation}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-right">
                      <span className="text-slate-400 block text-[10px] uppercase">Authorised Repairs</span>
                      <strong className="text-slate-900">{formatZAR(activeClaim.authorisedAmount || 42850)}</strong>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-right">
                      <span className="text-slate-400 block text-[10px] uppercase">Client Excess</span>
                      <strong className="text-amber-700">{formatZAR(activeClaim.excessPayable || 3500)}</strong>
                    </div>
                  </div>
                </div>

                {/* Handler & SAPS Details */}
                <div className="mt-3 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Claims Handler</span>
                    <span className="font-semibold text-slate-800">{activeClaim.handlerName || 'Thabo Molefe (Santam)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SAPS Case / AR Number</span>
                    <span className="font-semibold font-mono text-slate-800">{activeClaim.policeCaseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Broker Oversight</span>
                    <span className="font-semibold text-slate-800">Qiniso Ntuli • Royal Square Financial</span>
                  </div>
                </div>
              </div>

              {/* Attached AWS Evidence Photos & Documents Gallery */}
              {activeClaim.documents && activeClaim.documents.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-700" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Attached Evidence & Incident Photos ({activeClaim.documents.length})
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      AWS S3 Cloud Storage
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    High-resolution accident photos, driver&apos;s licence discs, and SAPS documentation recorded for this claim.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {activeClaim.documents.map((doc, idx) => {
                      const imgSource = doc.dataUrl || doc.fileUrl;
                      return (
                        <div
                          key={doc.docId || idx}
                          onClick={() => setTrackerPreviewDoc({
                            fileName: doc.fileName,
                            docType: doc.docType,
                            url: imgSource,
                            s3Key: doc.s3Key
                          })}
                          className="group relative bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                        >
                          <div className="h-28 w-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            {imgSource ? (
                              <img
                                src={imgSource}
                                alt={doc.fileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                              <Eye className="w-4 h-4" />
                              <span className="text-[10px] font-semibold">Inspect</span>
                            </div>
                          </div>
                          <div className="p-2 space-y-1">
                            <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                              {doc.docType.replace('_', ' ')}
                            </span>
                            <p className="text-[11px] font-medium text-slate-800 truncate" title={doc.fileName}>
                              {doc.fileName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 10-Step Timeline Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">What Happens After Submission</h3>
                  <p className="text-xs text-slate-500">
                    &ldquo;This part runs over days and weeks, and the app&apos;s job is to track it and keep everyone informed&rdquo;
                  </p>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Step {activeClaim.currentStepIndex + 1} of 10
                </span>
              </div>

              {/* 10-Step Timeline List */}
              <div className="space-y-3">
                {activeClaim.steps.map((step, idx) => {
                  const isCurrent = idx === activeClaim.currentStepIndex;
                  const isDone = idx < activeClaim.currentStepIndex;
                  const isUpcoming = idx > activeClaim.currentStepIndex;

                  return (
                    <div
                      key={step.stepNumber}
                      id={`claim-step-${step.stepNumber}`}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                          : isDone
                          ? 'bg-white border-slate-200 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200/60 opacity-75'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Step Number Bubble */}
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-amber-600 text-white ring-4 ring-amber-200 animate-pulse'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.stepNumber}
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4 className={`text-xs font-bold ${isCurrent ? 'text-amber-950' : 'text-slate-900'}`}>
                              {step.stepNumber}. {step.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {step.date && (
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {step.date}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isCurrent
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {isDone ? 'Completed' : isCurrent ? 'Active Step' : 'Upcoming'}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {step.description}
                          </p>

                          {step.notes && (
                            <p className="text-[11px] text-slate-500 bg-white/60 p-1.5 rounded border border-slate-200/50 mt-1">
                              <strong>Status Note:</strong> {step.notes}
                            </p>
                          )}

                          {/* INTERACTIVE ACTIONS PER STEP */}
                          
                          {/* Step 6: Client picks a date for the vehicle to go in */}
                          {step.stepNumber === 6 && isCurrent && (
                            <div className="mt-3 p-3.5 bg-white rounded-xl border border-amber-300 space-y-3">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                                <Calendar className="w-4 h-4 text-amber-600" />
                                <span>Choose Drop-off Date for Repairs at Renew-it Sandton</span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Once confirmed, Royal Square Financial immediately activates Step 7 (arranging courtesy car hire delivery directly to the panel shop).
                              </p>
                              <div className="flex flex-wrap items-center gap-3">
                                <input
                                  type="date"
                                  value={selectedDropoffDate}
                                  onChange={(e) => setSelectedDropoffDate(e.target.value)}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                                />
                                <button
                                  type="button"
                                  id="confirm-dropoff-date-btn"
                                  onClick={handleConfirmDropoffBooking}
                                  disabled={isSubmittingBooking}
                                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                                >
                                  {isSubmittingBooking ? 'Coordinating Car Hire...' : 'Confirm Date & Request Hire Car'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Step 7: We arrange car hire and delivery to repairer */}
                          {step.stepNumber === 7 && isCurrent && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">Europcar Group B (Volkswagen Polo TSI)</span>
                                <p className="text-[11px] text-slate-500">Confirmed delivery at Renew-it Sandton on vehicle drop-off morning.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onAdvanceClaimStep(activeClaim.id, 7, 'Hire car handed over to client. Vehicle in panel beating bay.')}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
                              >
                                Advance to Step 8
                              </button>
                            </div>
                          )}

                          {/* Step 8: Weekly repair updates pushed to us */}
                          {step.stepNumber === 8 && isCurrent && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300 space-y-2 text-xs">
                              <span className="font-bold text-slate-900">Repair Bay Status: Spray Booth & Clear Coat</span>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full w-3/4" />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>Strip & Parts: Done • Primer: Done • Paint: In Progress</span>
                                <button
                                  type="button"
                                  onClick={() => onAdvanceClaimStep(activeClaim.id, 8, 'Repairs 100% completed, passed Renew-it 54-point QA inspection.')}
                                  className="font-bold text-amber-700 hover:underline"
                                >
                                  Mark Repairs Complete
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Step 9: Arrange collection & return hire car */}
                          {step.stepNumber === 9 && isCurrent && (
                            <div className="mt-3 p-3 bg-white rounded-xl border border-amber-300 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-900">Ready for Collection at Renew-it Sandton</span>
                                <p className="text-[11px] text-slate-500">Leave Europcar vehicle keys at reception. Excess settled via Santam.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onAdvanceClaimStep(activeClaim.id, 9, 'Client inspected and collected vehicle. Hire car returned.')}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                              >
                                Complete Collection
                              </button>
                            </div>
                          )}

                          {/* Step 10: Client writes short review & closes transaction */}
                          {step.stepNumber === 10 && (isCurrent || isDone) && (
                            <div className="mt-3 p-3.5 bg-white rounded-xl border border-amber-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900">Rate Royal Square Financial Broker Service</span>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                      type="button"
                                      key={s}
                                      onClick={() => setReviewRating(s)}
                                      className="text-amber-500 hover:scale-110 transition-transform"
                                    >
                                      <Star className={`w-4 h-4 ${s <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={2}
                                className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
                                placeholder="Share your experience with Qiniso Ntuli and the claims team..."
                              />

                              {!isReviewSubmitted ? (
                                <button
                                  type="button"
                                  id="close-transaction-btn"
                                  onClick={handleSubmitReviewAndClose}
                                  className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow"
                                >
                                  Submit Review & Close Claim
                                </button>
                              ) : (
                                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Review submitted. Claim transaction archived and closed.</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox / Full Evidence Viewer Modal */}
      {trackerPreviewDoc && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setTrackerPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {trackerPreviewDoc.docType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800">
                    {trackerPreviewDoc.fileName}
                  </span>
                </div>
                {trackerPreviewDoc.s3Key && (
                  <span className="text-[10px] text-slate-400 font-mono block">
                    S3 URI: s3://royalsquare-claims-storage/{trackerPreviewDoc.s3Key}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setTrackerPreviewDoc(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-hidden">
              {trackerPreviewDoc.url ? (
                <img
                  src={trackerPreviewDoc.url}
                  alt={trackerPreviewDoc.fileName}
                  className="max-h-[65vh] w-auto object-contain rounded"
                />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <FileText className="w-16 h-16 mx-auto mb-2 text-slate-500" />
                  <p className="text-xs">Document format preview unavailable.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Uploaded to AWS and synced with broker claims file
              </span>
              <button
                type="button"
                onClick={() => setTrackerPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
