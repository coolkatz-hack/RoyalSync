import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Users, 
  User, 
  Building2, 
  Plus, 
  ExternalLink,
  ShieldCheck,
  Award
} from 'lucide-react';
import { AutomatedReminder } from '../types';
import { formatDate } from '../utils/formatters';

interface RemindersViewProps {
  reminders: AutomatedReminder[];
  onCompleteReminder: (id: string) => void;
  onAddReminder: (newReminder: AutomatedReminder) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onCompleteReminder,
  onAddReminder
}) => {
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'client' | 'both' | 'us'>('all');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedReminder, setSelectedReminder] = useState<AutomatedReminder | null>(null);

  // New reminder form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDueDate, setNewDueDate] = useState('2026-11-30');
  const [newFreq, setNewFreq] = useState('Annual');
  const [newRecipient, setNewRecipient] = useState<'client' | 'us' | 'both'>('both');
  const [newSeverity, setNewSeverity] = useState<'urgent' | 'warning' | 'info'>('info');

  // Valuation upload simulation state
  const [valuationItem, setValuationItem] = useState('Santam Specified Jewellery & Artwork');
  const [valuationAmount, setValuationAmount] = useState('R 280,000');
  const [valuationFileUploaded, setValuationFileUploaded] = useState(false);

  const filteredReminders = reminders.filter(r => {
    if (recipientFilter === 'all') return true;
    return r.targetRecipient === recipientFilter;
  });

  const handleOpenAction = (reminder: AutomatedReminder) => {
    setSelectedReminder(reminder);
    if (reminder.actionType === 'upload_valuation') {
      setActiveModal('valuation');
    } else if (reminder.actionType === 'dltc_guide') {
      setActiveModal('dltc');
    } else if (reminder.actionType === 'book_review') {
      setActiveModal('review');
    } else if (reminder.actionType === 'view_fees') {
      setActiveModal('fees');
    } else {
      onCompleteReminder(reminder.id);
    }
  };

  const handleSaveValuation = () => {
    setValuationFileUploaded(true);
    setTimeout(() => {
      if (selectedReminder) {
        onCompleteReminder(selectedReminder.id);
      }
      setActiveModal(null);
      setValuationFileUploaded(false);
    }, 800);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AutomatedReminder = {
      id: 'rem-' + Date.now(),
      type: 'custom' as any,
      title: newTitle,
      description: newDesc,
      dueDate: newDueDate,
      frequency: newFreq,
      targetRecipient: newRecipient,
      severity: newSeverity,
      status: 'pending',
      actionLabel: 'Mark Complete'
    };
    onAddReminder(created);
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div id="reminders-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Bell className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Automated Compliance & Review Reminders</h2>
              <p className="text-xs text-slate-500">
                &ldquo;For tasks, documents, renewals and reviews — sent to us, to the client, or to both.&rdquo;
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Recipient Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setRecipientFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${recipientFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              All
            </button>
            <button
              onClick={() => setRecipientFilter('client')}
              className={`px-3 py-1.5 rounded-lg transition-all ${recipientFilter === 'client' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              To Client
            </button>
            <button
              onClick={() => setRecipientFilter('both')}
              className={`px-3 py-1.5 rounded-lg transition-all ${recipientFilter === 'both' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              To Both
            </button>
            <button
              onClick={() => setRecipientFilter('us')}
              className={`px-3 py-1.5 rounded-lg transition-all ${recipientFilter === 'us' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              To Broker (Us)
            </button>
          </div>

          <button
            type="button"
            id="add-custom-reminder-btn"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReminders.map((reminder) => {
          const isDone = reminder.status === 'completed';
          const recipientBadge =
            reminder.targetRecipient === 'both'
              ? { label: 'Sent to Both (You & Us)', class: 'bg-purple-100 text-purple-800' }
              : reminder.targetRecipient === 'client'
              ? { label: 'Sent to Client (You)', class: 'bg-blue-100 text-blue-800' }
              : { label: 'Sent to Us (Royal Square)', class: 'bg-amber-100 text-amber-800' };

          return (
            <div
              key={reminder.id}
              id={`reminder-full-card-${reminder.id}`}
              className={`bg-white rounded-2xl p-5 border transition-all ${
                isDone 
                  ? 'border-slate-200 opacity-60 bg-slate-50/50' 
                  : reminder.severity === 'urgent'
                  ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${recipientBadge.class}`}>
                      {recipientBadge.label}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Frequency: {reminder.frequency}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {reminder.title}
                  </h3>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Due: {formatDate(reminder.dueDate)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {reminder.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {isDone ? 'Completed' : 'Requires client / adviser verification'}
                </span>

                {!isDone ? (
                  <div className="flex items-center gap-2">
                    {reminder.actionLabel && (
                      <button
                        type="button"
                        onClick={() => handleOpenAction(reminder)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-xs transition-colors"
                      >
                        {reminder.actionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onCompleteReminder(reminder.id)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onCompleteReminder(reminder.id)}
                    className="text-slate-500 hover:underline text-[11px]"
                  >
                    Re-open reminder
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: VALUATION CERTIFICATE UPLOAD (Every 2 years -> us and the client) */}
      {activeModal === 'valuation' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Upload 2-Year Valuation Certificate</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 text-base font-bold">✕</button>
            </div>

            <p className="text-slate-600">
              Santam requires updated valuation certificates every 24 months for specified jewellery, watches (e.g. Rolex), fine art, and electronics to guarantee full replacement without average deductions.
            </p>

            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Specified on Santam Schedule</label>
                <input
                  type="text"
                  value={valuationItem}
                  onChange={(e) => setValuationItem(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Valuation Amount (ZAR)</label>
                <input
                  type="text"
                  value={valuationAmount}
                  onChange={(e) => setValuationAmount(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            {/* Upload Zone */}
            <div className="p-4 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/50 text-center space-y-2">
              <UploadCloud className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="font-semibold text-slate-800">Attach Jeweller / Assessor Certificate</p>
              <p className="text-[11px] text-slate-500">PDF, JPG, or PNG under 15MB</p>
              <button
                type="button"
                onClick={() => alert('Simulated File Selected: Valuation_Cert_Santam_2026.pdf')}
                className="px-3 py-1 bg-white rounded-lg border border-amber-300 text-amber-800 font-semibold shadow-2xs text-[11px]"
              >
                Select Valuation File
              </button>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveValuation}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                {valuationFileUploaded ? 'Transmitting to Santam...' : 'Submit to Broker & Santam'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DRIVING LICENCE DLTC BOOKING GUIDE */}
      {activeModal === 'dltc' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Driving Licence Renewal Protocol</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 text-base font-bold">✕</button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
              <strong className="block">Why this matters for your motor insurance:</strong>
              <p className="text-[11px] leading-relaxed">
                If you are in a motor collision while holding an expired licence card without valid booking receipts or a temporary licence, Santam and other South African insurers may dispute or repudiate claim payouts.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800">Checklist for Gauteng DLTC / Natis Booking:</h4>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4 text-[11px]">
                <li>Book slot on online.natis.gov.za (Sandton, Waterfall, or Midrand DLTC)</li>
                <li>Original South African green barcoded ID or Smart ID Card</li>
                <li>4x black & white ID photos</li>
                <li>Proof of residential address (not older than 3 months)</li>
                <li>Prescribed renewal fee (approx. R228 in Gauteng)</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Expiring in 45 days</span>
              <button
                type="button"
                onClick={() => {
                  if (selectedReminder) onCompleteReminder(selectedReminder.id);
                  setActiveModal(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                I Have Booked / Renewed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ANNUAL REVIEW BOOKING WITH QINISO NTULI */}
      {activeModal === 'review' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Annual Financial Review</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 text-base font-bold">✕</button>
            </div>

            <p className="text-slate-600">
              Meet with your designated adviser, <strong>Qiniso Ntuli (FSP: 29370)</strong>, to conduct your annual FAIS advice record review, rebalance Allan Gray and Sanlam portfolios, and check risk cover levels.
            </p>

            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Preferred Meeting Date</label>
                <input type="date" defaultValue="2026-10-15" className="w-full p-2 rounded-lg border border-slate-300 bg-white" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Format</label>
                <select className="w-full p-2 rounded-lg border border-slate-300 bg-white">
                  <option>Virtual (Microsoft Teams / Google Meet)</option>
                  <option>In-Person: Royal Square Office (4 Pritchard St, JHB)</option>
                  <option>Client Office / Sandton</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedReminder) onCompleteReminder(selectedReminder.id);
                  setActiveModal(null);
                  alert('Annual review meeting request scheduled with Qiniso Ntuli.');
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold"
              >
                Confirm Review Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RETIREMENT FEE BENCHMARK REPORT */}
      {activeModal === 'fees' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Retirement Fee & Expense Benchmark</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 text-base font-bold">✕</button>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>Allan Gray Balanced TER:</span>
                <strong className="text-slate-900">1.12% p.a. (Below industry average 1.75%)</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>Sanlam Glacier Platform Fee:</span>
                <strong className="text-slate-900">0.45% sliding tier</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <span>Royal Square Advisory Fee:</span>
                <strong className="text-emerald-700">0.50% p.a. ongoing</strong>
              </div>
            </div>

            <p className="text-slate-500 text-[11px]">
              Annual fee compliance check satisfies FSCA Conduct of Financial Institutions Act mandates.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (selectedReminder) onCompleteReminder(selectedReminder.id);
                  setActiveModal(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold"
              >
                Acknowledge Fee Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ADD NEW REMINDER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Configure Automated Reminder</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 text-base font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Fire Extinguisher & Geyser Inspection"
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details for compliance or renewal..."
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
                  <select
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Every 2 years">Every 2 years</option>
                    <option value="Every 5 years">Every 5 years</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Once-off">Once-off</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Recipient</label>
                  <select
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value as 'client' | 'us' | 'both')}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="both">Sent to Both (You & Us)</option>
                    <option value="client">Sent to Client</option>
                    <option value="us">Sent to Us (Royal Square)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as 'urgent' | 'warning' | 'info')}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
