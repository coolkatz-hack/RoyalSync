import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Car, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  Calendar, 
  Clock, 
  FileText, 
  ChevronRight,
  UserCheck,
  HeartHandshake
} from 'lucide-react';
import { PolicyAsset, LiabilityItem, AutomatedReminder, FinancialGoal, MotorClaim } from '../types';
import { formatZAR, formatDate, getProviderBadgeColor } from '../utils/formatters';

interface DashboardViewProps {
  policies: PolicyAsset[];
  liabilities: LiabilityItem[];
  reminders: AutomatedReminder[];
  goals: FinancialGoal[];
  activeClaim: MotorClaim | undefined;
  onNavigate: (tab: 'dashboard' | 'claims' | 'goals' | 'reminders' | 'services' | 'profile') => void;
  onOpenSceneChecklist: () => void;
  onRegisterClaim: () => void;
  onOpenReminderAction: (reminder: AutomatedReminder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  policies,
  liabilities,
  reminders,
  goals,
  activeClaim,
  onNavigate,
  onOpenSceneChecklist,
  onRegisterClaim,
  onOpenReminderAction
}) => {
  // Calculations
  const totalAssets = policies.reduce((acc, pol) => acc + pol.currentValue, 0);
  const totalLiabilities = liabilities.reduce((acc, liab) => acc + liab.totalBalance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const totalMonthlyPremiums = policies.reduce((acc, pol) => acc + pol.monthlyPremium, 0);
  const totalLifeCover = policies
    .filter(p => p.category === 'life_insurance')
    .reduce((acc, pol) => acc + (pol.coverAmount || 0), 0);

  // Reminders requiring attention
  const pendingReminders = reminders.filter(r => r.status !== 'completed' && r.status !== 'dismissed');

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Incident Assist Action Banner */}
      <div 
        id="emergency-action-banner"
        className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              <AlertTriangle className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  Incident Assist
                </span>
                <span className="text-xs text-slate-500">Short-Term Motor & Household Loss</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">Involved in a Motor Accident or Suffered a Loss?</h2>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                Immediate on-scene checklist for Santam & insurers: road conditions, licence plates, driver details, and 48h police reporting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              type="button"
              id="report-accident-scene-btn"
              onClick={onOpenSceneChecklist}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Scene Checklist</span>
            </button>
            <button
              type="button"
              id="register-claim-btn"
              onClick={onRegisterClaim}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Car className="w-4 h-4" />
              <span>Register Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Net Worth & Real-Time Financial Position Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Net Worth Card */}
        <div id="net-worth-summary-card" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide">TOTAL NET WORTH</span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Verified Position
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatZAR(netWorth)}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                Assets: {formatZAR(totalAssets)}
              </span>
              <span>•</span>
              <span className="text-rose-600 font-medium">
                Liabilities: {formatZAR(totalLiabilities)}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Advised by Qiniso Ntuli (FSP 29370)</span>
            <button 
              onClick={() => onNavigate('profile')} 
              className="text-slate-700 hover:text-slate-900 font-medium flex items-center gap-0.5"
            >
              Balance Sheet <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Wealth & Investments Card */}
        <div id="investments-summary-card" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide">INVESTMENTS & RETIREMENT</span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
              Allan Gray & Sanlam
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatZAR(
                policies.filter(p => p.category === 'investments').reduce((a, b) => a + b.currentValue, 0)
              )}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Tax-Free + Retirement Annuity</span>
              <span className="text-blue-700 font-medium">R 21,500/mo invested</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Reg 28 Compliant</span>
            <button 
              onClick={() => onNavigate('goals')} 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
            >
              View Goals <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Protection & Cover Card */}
        <div id="protection-summary-card" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 tracking-wide">RISK & ASSET PROTECTION</span>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">
              Discovery, Santam, Liberty
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {formatZAR(totalLifeCover)}
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Life, Disability & Severe Illness</span>
              <span className="text-slate-600 font-medium">{formatZAR(totalMonthlyPremiums)}/mo total</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Motor: 2023 BMW 320d</span>
            <button 
              onClick={() => onNavigate('claims')} 
              className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-0.5"
            >
              Santam Policy <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Motor Claim Progress (If in flight) */}
      {activeClaim && (
        <div id="active-claim-widget" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                Santam
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Claim in Progress: {activeClaim.claimReference}</span>
                  <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    Step {activeClaim.currentStepIndex + 1} of 10
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {activeClaim.vehicleModel} • Handler: {activeClaim.handlerName || 'Assigned'}
                </p>
              </div>
            </div>

            <button
              type="button"
              id="track-claim-btn"
              onClick={() => onNavigate('claims')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Track 10-Step Timeline
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-medium">Current Action:</span>
              <span>{activeClaim.steps[activeClaim.currentStepIndex]?.title}</span>
            </div>
            <span className="text-xs text-slate-500">
              Authorised: {formatZAR(activeClaim.authorisedAmount || 0)} (Excess: {formatZAR(activeClaim.excessPayable || 0)})
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Policies by Provider & Automated Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Policies by Provider */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Brokerage Portfolio</h3>
              <p className="text-xs text-slate-500">
                Consolidated under Royal Square Financial from South Africa&apos;s leading providers
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
            >
              Request Schedule / Docs <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {policies.map((policy) => {
              const badge = getProviderBadgeColor(policy.provider);
              return (
                <div
                  key={policy.id}
                  id={`policy-item-${policy.id}`}
                  className="bg-white rounded-xl p-4 border border-slate-200/90 hover:border-slate-300 shadow-2xs transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${badge.bg} ${badge.text} border ${badge.border} shrink-0`}>
                        {policy.provider}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{policy.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span>Policy: <strong className="text-slate-700 font-mono">{policy.policyNumber}</strong></span>
                          <span>•</span>
                          <span className="capitalize">{policy.category.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      {policy.currentValue > 0 ? (
                        <div className="text-sm font-bold text-slate-900">
                          {formatZAR(policy.currentValue)}
                          <span className="block text-[11px] font-normal text-slate-500">Fund Value</span>
                        </div>
                      ) : policy.coverAmount ? (
                        <div className="text-sm font-bold text-slate-900">
                          {formatZAR(policy.coverAmount)}
                          <span className="block text-[11px] font-normal text-slate-500">Sum Insured</span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          Comprehensive
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {policy.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>Premium: <strong className="text-slate-700">{formatZAR(policy.monthlyPremium)}/mo</strong></span>
                    <button
                      type="button"
                      onClick={() => onNavigate('services')}
                      className="text-amber-700 hover:text-amber-800 font-medium hover:underline"
                    >
                      Request Border / Policy Letter
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Automated Reminders & Goal Previews */}
        <div className="space-y-6">
          {/* Automated Reminders Box (Requested in Image 1) */}
          <div id="automated-reminders-box" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Automated Reminders</h3>
              </div>
              <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {pendingReminders.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tasks, documents, renewals, and compliance reviews sent to you, us, or both.
            </p>

            <div className="space-y-2.5">
              {pendingReminders.slice(0, 4).map((reminder) => (
                <div
                  key={reminder.id}
                  id={`reminder-card-${reminder.id}`}
                  className={`p-3 rounded-xl border transition-colors ${
                    reminder.severity === 'urgent'
                      ? 'bg-rose-50/60 border-rose-200'
                      : reminder.severity === 'warning'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {reminder.title}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      reminder.targetRecipient === 'both'
                        ? 'bg-purple-100 text-purple-700'
                        : reminder.targetRecipient === 'client'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {reminder.targetRecipient === 'both' ? 'You & Us' : reminder.targetRecipient === 'client' ? 'To You' : 'To Broker'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {reminder.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Due: {formatDate(reminder.dueDate)}
                    </span>
                    {reminder.actionLabel && (
                      <button
                        type="button"
                        onClick={() => onOpenReminderAction(reminder)}
                        className="font-semibold text-amber-700 hover:text-amber-900 underline"
                      >
                        {reminder.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('reminders')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1"
            >
              <span>View All Reminders & Frequency</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Goals Mini Preview */}
          <div id="goals-preview-box" className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Financial Goals</h3>
              </div>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{goal.title}</span>
                    <span className="font-bold text-slate-900">{goal.progressPercent}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.progressPercent >= 100
                          ? 'bg-emerald-500'
                          : goal.progressPercent >= 50
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formatZAR(goal.currentAmount)}</span>
                    <span>Target: {formatZAR(goal.targetAmount)} ({goal.targetYear})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adviser Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                QN
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Qiniso Ntuli</h4>
                <p className="text-xs text-amber-400">Director & Key Individual • FSP 29370</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Royal Square Financial (Pty) Ltd. 4 Pritchard Street, Johannesburg. Direct compliance & financial advisory line:
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300">011 492 1566</span>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors"
              >
                Book Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
