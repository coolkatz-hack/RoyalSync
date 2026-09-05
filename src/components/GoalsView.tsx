import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Users, 
  User, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  DollarSign, 
  Sparkles 
} from 'lucide-react';
import { FinancialGoal } from '../types';
import { formatZAR } from '../utils/formatters';

interface GoalsViewProps {
  goals: FinancialGoal[];
  onAddGoal: (newGoal: FinancialGoal) => void;
  onUpdateGoalContribution: (goalId: string, newAmount: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalContribution
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'individual' | 'shared'>('all');

  // New goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<'retirement' | 'education' | 'offshore' | 'emergency' | 'wealth' | 'property'>('retirement');
  const [targetAmount, setTargetAmount] = useState<number>(1000000);
  const [currentAmount, setCurrentAmount] = useState<number>(150000);
  const [targetYear, setTargetYear] = useState<number>(2035);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);
  const [ownership, setOwnership] = useState<'individual' | 'shared'>('individual');
  const [sharedWith, setSharedWith] = useState('Zanele Dlamini (Spouse)');
  const [adviserNote, setAdviserNote] = useState('Planned portfolio allocation reviewed with Qiniso Ntuli for long-term real capital preservation.');

  const filteredGoals = goals.filter(g => {
    if (filter === 'individual') return g.ownership === 'individual';
    if (filter === 'shared') return g.ownership === 'shared';
    return true;
  });

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalAccumulated = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallProgress = Math.round((totalAccumulated / totalTarget) * 100) || 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const progress = Math.min(100, Math.round((currentAmount / targetAmount) * 100));

    const newGoal: FinancialGoal = {
      id: 'goal-' + Date.now(),
      title: goalTitle,
      category: goalCategory,
      targetAmount,
      currentAmount,
      currency: 'ZAR',
      targetYear,
      monthlyContribution,
      progressPercent: progress,
      ownership,
      sharedWith: ownership === 'shared' ? sharedWith : undefined,
      adviserNote,
      status: progress >= 100 ? 'completed' : 'on_track'
    };

    onAddGoal(newGoal);
    setShowAddModal(false);
    setGoalTitle('');
  };

  return (
    <div id="goals-view" className="space-y-6">
      {/* Header & Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500 text-white">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Goal Tracking & Wealth Horizon</h2>
              <p className="text-xs text-slate-500">
                &ldquo;Advisers load goals for a client — individual or shared — showing visually how far along each one is.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              All ({goals.length})
            </button>
            <button
              onClick={() => setFilter('individual')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'individual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Individual
            </button>
            <button
              onClick={() => setFilter('shared')}
              className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'shared' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Shared
            </button>
          </div>

          <button
            type="button"
            id="add-goal-btn"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Load New Goal</span>
          </button>
        </div>
      </div>

      {/* Aggregate Goal Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Cumulative Target</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatZAR(totalTarget)}</div>
          <span className="text-xs text-slate-500 mt-1 block">Across {goals.length} defined wealth milestones</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Capital Accumulated</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatZAR(totalAccumulated)}</div>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            {overallProgress}% of overall wealth target reached
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Investment Pace</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatZAR(goals.reduce((a, b) => a + b.monthlyContribution, 0))}
            <span className="text-xs font-normal text-slate-500">/mo</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Via Allan Gray, Sanlam & Glacier debit orders</span>
        </div>
      </div>

      {/* Goals Visual Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map((goal) => {
          const isCompleted = goal.progressPercent >= 100;
          return (
            <div
              key={goal.id}
              id={`goal-card-${goal.id}`}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                isCompleted 
                  ? 'border-emerald-300 ring-1 ring-emerald-500/20 shadow-xs' 
                  : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      goal.ownership === 'shared' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {goal.ownership === 'shared' ? 'Shared Goal' : 'Individual Goal'}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      Target: {goal.targetYear}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{goal.title}</h3>
                  {goal.ownership === 'shared' && goal.sharedWith && (
                    <span className="text-xs text-purple-700 flex items-center gap-1 mt-0.5 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      Shared with: {goal.sharedWith}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xl font-black text-slate-900">{goal.progressPercent}%</div>
                  <span className="text-[10px] text-slate-500">Progress</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : goal.progressPercent >= 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{formatZAR(goal.currentAmount)}</span>
                  <span className="text-slate-500">Target: {formatZAR(goal.targetAmount)}</span>
                </div>
              </div>

              {/* Adviser Note Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Adviser Note (Qiniso Ntuli, FSP 29370):</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {goal.adviserNote}
                </p>
              </div>

              {/* Footer details & contribution tweak */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Debit Order: <strong className="text-slate-800">{formatZAR(goal.monthlyContribution)}/mo</strong>
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const extra = prompt('Enter new monthly contribution amount in Rands:', goal.monthlyContribution.toString());
                    if (extra && !isNaN(Number(extra))) {
                      onUpdateGoalContribution(goal.id, Number(extra));
                    }
                  }}
                  className="font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 hover:underline"
                >
                  Adjust Debit Order <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Load Client Financial Goal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Holiday Home in Hermanus / Secondary Property"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Amount (ZAR)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Current Capital</label>
                  <input
                    type="number"
                    required
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Horizon Year</label>
                  <input
                    type="number"
                    required
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Contribution (ZAR)</label>
                  <input
                    type="number"
                    required
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ownership Type</label>
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value as 'individual' | 'shared')}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="individual">Individual Client</option>
                    <option value="shared">Shared Goal (Spouse/Family)</option>
                  </select>
                </div>
                {ownership === 'shared' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Shared With</label>
                    <input
                      type="text"
                      value={sharedWith}
                      onChange={(e) => setSharedWith(e.target.value)}
                      placeholder="e.g. Zanele Dlamini (Spouse)"
                      className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Adviser Notes & Strategy</label>
                <textarea
                  rows={2}
                  value={adviserNote}
                  onChange={(e) => setAdviserNote(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
