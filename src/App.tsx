import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Car, 
  Target, 
  Bell, 
  FileText, 
  User, 
  PhoneCall, 
  AlertTriangle, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  Database,
  LogOut
} from 'lucide-react';
import { 
  mockClientProfile, 
  mockPolicies, 
  mockLiabilities, 
  mockReminders, 
  mockGoals, 
  mockActiveClaim, 
  mockAccidentChecklist, 
  mockServiceRequests 
} from './mockData';
import { 
  ClientProfile, 
  PolicyAsset, 
  LiabilityItem, 
  AutomatedReminder, 
  FinancialGoal, 
  MotorClaim, 
  AccidentChecklistItem, 
  ServiceRequest 
} from './types';
import { DashboardView } from './components/DashboardView';
import { ClaimsView } from './components/ClaimsView';
import { GoalsView } from './components/GoalsView';
import { RemindersView } from './components/RemindersView';
import { ServicesView } from './components/ServicesView';
import { ProfileView } from './components/ProfileView';
import { 
  AWSUserSession, 
  AWSClaim, 
  AWSClaimDocument,
  fetchCustomerDataFromAWS, 
  logClaimToAWS 
} from './services/awsApi';
import { AwsLoginScreen } from './components/AwsLoginScreen';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'claims' | 'goals' | 'reminders' | 'services' | 'profile'
  >('dashboard');
  const [claimsInitialMode, setClaimsInitialMode] = useState<'checklist' | 'register' | 'tracker' | 'aws_list'>('aws_list');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AWS Backend State (Connected to af-south-1 API Gateway & DynamoDB)
  const [awsUser, setAwsUser] = useState<AWSUserSession | null>({
    customerId: 'cust_001',
    fullName: 'Sipho Ndlovu',
    clientNumber: 'RC-4421',
    email: 'sipho@testmail.co.za',
    idNumber: '9102145028087',
    phone: '+27821234567',
    vehicle: {
      registration: 'CA123456',
      make: 'Toyota',
      model: 'Corolla Cross',
      year: 2023
    }
  });
  const [awsClaims, setAwsClaims] = useState<AWSClaim[]>([]);
  const [awsLoading, setAwsLoading] = useState<boolean>(false);

  // Core Application Data State (Mock Data initialized, fully reactive)
  const [profile, setProfile] = useState<ClientProfile>(mockClientProfile);
  const [policies, setPolicies] = useState<PolicyAsset[]>(mockPolicies);
  const [liabilities, setLiabilities] = useState<LiabilityItem[]>(mockLiabilities);
  const [reminders, setReminders] = useState<AutomatedReminder[]>(mockReminders);
  const [goals, setGoals] = useState<FinancialGoal[]>(mockGoals);
  const [activeClaim, setActiveClaim] = useState<MotorClaim | undefined>(mockActiveClaim);
  const [sceneChecklist, setSceneChecklist] = useState<AccidentChecklistItem[]>(mockAccidentChecklist);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(mockServiceRequests);

  // Load real AWS DynamoDB data for the authenticated customer
  const loadAwsCustomerData = async (customerId: string) => {
    setAwsLoading(true);
    try {
      const data = await fetchCustomerDataFromAWS(customerId);
      if (data.claims && data.claims.length > 0) {
        setAwsClaims(data.claims);
      }
    } catch (err) {
      console.error('Failed to fetch AWS data:', err);
    } finally {
      setAwsLoading(false);
    }
  };

  useEffect(() => {
    if (awsUser?.customerId) {
      loadAwsCustomerData(awsUser.customerId);
    }
  }, [awsUser?.customerId]);

  const handleLodgeClaimToAws = async (payload: {
    insurer: string;
    incidentDate: string;
    location: string;
    summary: string;
    policeReference: string;
    drivable: boolean;
    thirdPartyInvolved: boolean;
    documents?: AWSClaimDocument[];
  }): Promise<boolean> => {
    if (!awsUser) return false;
    try {
      const res = await logClaimToAWS({
        customerId: awsUser.customerId,
        customerName: awsUser.fullName,
        insurer: payload.insurer,
        incidentDate: payload.incidentDate,
        location: payload.location,
        summary: payload.summary,
        policeReference: payload.policeReference,
        drivable: payload.drivable,
        thirdPartyInvolved: payload.thirdPartyInvolved,
        vehicle: awsUser.vehicle,
        documents: payload.documents,
      });

      if (res.success) {
        await loadAwsCustomerData(awsUser.customerId);
        return true;
      } else {
        console.warn('AWS claim lodging response notice:', res.message);
        return false;
      }
    } catch (err: any) {
      console.warn('AWS claim submission notice:', err?.message || err);
      return false;
    }
  };

  const handleSignOut = () => {
    setAwsUser(null);
    setAwsClaims([]);
  };

  // If user signed out, display AWS Login Screen
  if (!awsUser) {
    return (
      <AwsLoginScreen
        onLoginSuccess={(user) => {
          setAwsUser(user);
          loadAwsCustomerData(user.customerId);
        }}
      />
    );
  }

  // Handlers
  const handleToggleChecklistItem = (id: string) => {
    setSceneChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    );
  };

  const handleUpdateChecklistNotes = (id: string, notes: string) => {
    setSceneChecklist(prev =>
      prev.map(item => item.id === id ? { ...item, notes } : item)
    );
  };

  const handleAdvanceClaimStep = (claimId: string, nextStepIndex: number, notes?: string) => {
    if (!activeClaim) return;
    const updatedSteps = activeClaim.steps.map((step, idx) => {
      if (idx < nextStepIndex) {
        return { ...step, status: 'completed' as const };
      }
      if (idx === nextStepIndex) {
        return { 
          ...step, 
          status: 'current' as const, 
          date: new Date().toLocaleDateString('en-ZA'),
          notes: notes || step.notes 
        };
      }
      return { ...step, status: 'upcoming' as const };
    });

    setActiveClaim({
      ...activeClaim,
      currentStepIndex: nextStepIndex,
      steps: updatedSteps
    });
  };

  const handleCreateNewClaim = (newClaim: MotorClaim) => {
    setActiveClaim(newClaim);
    setActiveTab('claims');
    setClaimsInitialMode('tracker');
  };

  const handleAddGoal = (newGoal: FinancialGoal) => {
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleUpdateGoalContribution = (goalId: string, newAmount: number) => {
    setGoals(prev =>
      prev.map(g => g.id === goalId ? { ...g, monthlyContribution: newAmount } : g)
    );
  };

  const handleCompleteReminder = (reminderId: string) => {
    setReminders(prev =>
      prev.map(r => r.id === reminderId ? { ...r, status: r.status === 'completed' ? 'pending' : 'completed' } : r)
    );
  };

  const handleAddReminder = (newReminder: AutomatedReminder) => {
    setReminders(prev => [newReminder, ...prev]);
  };

  const handleSubmitServiceRequest = (newReq: ServiceRequest) => {
    setServiceRequests(prev => [newReq, ...prev]);
  };

  const handleUpdateProfile = (updated: Partial<ClientProfile>) => {
    setProfile(prev => ({ ...prev, ...updated }));
  };

  const pendingRemindersCount = reminders.filter(r => r.status !== 'completed' && r.status !== 'dismissed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Advisory Bar */}
      <header className="bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-serif font-bold text-white text-base shadow-xs">
                  RS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-base tracking-tight text-slate-900">
                      ROYAL SQUARE
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      FSP 29370
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block tracking-wider uppercase font-medium">
                    Financial (Pty) Ltd • Client Portal
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Emergency Assist Dial & Profile */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-600">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono">AWS af-south-1</span>
              </div>

              <button
                type="button"
                id="emergency-top-btn"
                onClick={() => {
                  setActiveTab('claims');
                  setClaimsInitialMode('checklist');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-slate-600" />
                <span>At Accident Scene?</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold text-xs">
                  {awsUser?.fullName ? awsUser.fullName.split(' ').map(n => n[0]).join('') : 'SN'}
                </div>
                <div className="hidden md:block">
                  <span className="text-xs font-bold text-slate-900 block">
                    {awsUser?.fullName || profile.fullName}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {awsUser?.clientNumber || 'RC-4421'} • {awsUser?.vehicle ? `${awsUser.vehicle.make} ${awsUser.vehicle.model}` : 'Insured'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                title="Switch client / Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="sm:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Primary Tab Navigation */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="hidden sm:flex space-x-1 py-1.5 overflow-x-auto text-xs font-medium">
              <button
                type="button"
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Net Worth & Dashboard</span>
              </button>

              <button
                type="button"
                id="nav-tab-claims"
                onClick={() => {
                  setActiveTab('claims');
                  setClaimsInitialMode('tracker');
                }}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'claims'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Accident & Claims</span>
                {activeClaim && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                    activeTab === 'claims' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    Step {activeClaim.currentStepIndex + 1}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="nav-tab-goals"
                onClick={() => setActiveTab('goals')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'goals'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Goal Tracking</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  activeTab === 'goals' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {goals.length}
                </span>
              </button>

              <button
                type="button"
                id="nav-tab-reminders"
                onClick={() => setActiveTab('reminders')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'reminders'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Automated Reminders</span>
                {pendingRemindersCount > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === 'reminders' ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {pendingRemindersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                id="nav-tab-services"
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'services'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Service Requests & Border Letter</span>
              </button>

              <button
                type="button"
                id="nav-tab-profile"
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Financial Profile & Balance Sheet</span>
              </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="sm:hidden py-2 space-y-1 text-xs border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    activeTab === 'dashboard' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Net Worth & Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('claims'); setClaimsInitialMode('tracker'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    activeTab === 'claims' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Accident & Claims</span>
                  {activeClaim && (
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      Step {activeClaim.currentStepIndex + 1}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('goals'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    activeTab === 'goals' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Goal Tracking</span>
                  <span className="text-slate-500 font-medium">{goals.length}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('reminders'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                    activeTab === 'reminders' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Automated Reminders</span>
                  <span className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {pendingRemindersCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeTab === 'services' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Service Requests & Border Letter
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeTab === 'profile' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Financial Profile & Balance Sheet
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main App Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            policies={policies}
            liabilities={liabilities}
            reminders={reminders}
            goals={goals}
            activeClaim={activeClaim}
            onNavigate={(tab) => {
              setActiveTab(tab);
              if (tab === 'claims') setClaimsInitialMode('tracker');
            }}
            onOpenSceneChecklist={() => {
              setActiveTab('claims');
              setClaimsInitialMode('checklist');
            }}
            onRegisterClaim={() => {
              setActiveTab('claims');
              setClaimsInitialMode('register');
            }}
            onOpenReminderAction={(reminder) => {
              setActiveTab('reminders');
            }}
          />
        )}

        {activeTab === 'claims' && (
          <ClaimsView
            activeClaim={activeClaim}
            sceneChecklist={sceneChecklist}
            onToggleChecklistItem={handleToggleChecklistItem}
            onUpdateChecklistNotes={handleUpdateChecklistNotes}
            onAdvanceClaimStep={handleAdvanceClaimStep}
            onCreateNewClaim={handleCreateNewClaim}
            initialMode={claimsInitialMode}
            awsClaims={awsClaims}
            awsLoading={awsLoading}
            awsUser={awsUser}
            onRefreshAwsClaims={() => {
              if (awsUser?.customerId) loadAwsCustomerData(awsUser.customerId);
            }}
            onLodgeClaimToAws={handleLodgeClaimToAws}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoalContribution={handleUpdateGoalContribution}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onCompleteReminder={handleCompleteReminder}
            onAddReminder={handleAddReminder}
          />
        )}

        {activeTab === 'services' && (
          <ServicesView
            policies={policies}
            serviceRequests={serviceRequests}
            onSubmitServiceRequest={handleSubmitServiceRequest}
            onNavigateToProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            policies={policies}
            liabilities={liabilities}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* Footer & Regulatory Disclosures */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-12 py-8 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-white text-sm">
                Royal Square Financial (Pty) Ltd
              </span>
              <span>•</span>
              <span>Authorised FSP No: 29370</span>
              <span>•</span>
              <span>Director: Qiniso Ntuli</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>Santam</span>
              <span>•</span>
              <span>Allan Gray</span>
              <span>•</span>
              <span>Sanlam</span>
              <span>•</span>
              <span>Discovery</span>
              <span>•</span>
              <span>Liberty</span>
              <span>•</span>
              <span>Momentum</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-4">
            Royal Square Financial (Pty) Ltd is an authorised Financial Services Provider licensed by the Financial Sector Conduct Authority (FSCA) in terms of the Financial Advisory and Intermediary Services Act (FAIS Act 37 of 2002). 
            Registered Office: 4 Pritchard Street, Johannesburg, South Africa. This client portal connects directly to product provider integration endpoints for short-term motor claims, valuations, tax certificates, and portfolio monitoring.
          </p>
        </div>
      </footer>
    </div>
  );
}
