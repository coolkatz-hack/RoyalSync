import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Download, 
  Save,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { ClientProfile, LiabilityItem, PolicyAsset } from '../types';
import { formatZAR } from '../utils/formatters';

interface ProfileViewProps {
  profile: ClientProfile;
  policies: PolicyAsset[];
  liabilities: LiabilityItem[];
  onUpdateProfile: (updated: Partial<ClientProfile>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  policies,
  liabilities,
  onUpdateProfile
}) => {
  const [isEditingFinancials, setIsEditingFinancials] = useState(false);
  
  // Local state for income statement
  const [monthlyGrossIncome, setMonthlyGrossIncome] = useState(profile.monthlyGrossIncome);
  const [monthlyExpenses, setMonthlyExpenses] = useState(profile.monthlyExpenses);
  const [employer, setEmployer] = useState(profile.employer);
  const [occupation, setOccupation] = useState(profile.occupation);

  // Aggregates
  const totalAssets = policies.reduce((acc, p) => acc + p.currentValue, 0);
  const totalLiabilities = liabilities.reduce((acc, l) => acc + l.totalBalance, 0);
  const netWorth = totalAssets - totalLiabilities;
  const netMonthlySurplus = monthlyGrossIncome - monthlyExpenses;

  const handleSaveFinancials = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      monthlyGrossIncome,
      monthlyExpenses,
      employer,
      occupation
    });
    setIsEditingFinancials(false);
    alert('Client Financial Profile & Income Statement successfully updated and synced with Royal Square Financial.');
  };

  return (
    <div id="profile-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center font-bold text-lg">
            {profile.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{profile.fullName}</h2>
              <span className="text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                FICA Verified
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ID: <strong className="font-mono text-slate-700">{profile.idNumber}</strong> • Tax Ref: <strong className="font-mono text-slate-700">{profile.taxNumber}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingFinancials(!isEditingFinancials)}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            {isEditingFinancials ? 'Cancel Editing' : 'Edit Income & Statement'}
          </button>
          <button
            type="button"
            onClick={() => alert('Exporting full Client Balance Sheet & FAIS Compliance Portfolio PDF...')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Balance Sheet</span>
          </button>
        </div>
      </div>

      {/* Grid: Balance Sheet & Income Statement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Sheet (Col 1 & 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Sheet Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Personal Balance Sheet</h3>
                <p className="text-xs text-slate-500">
                  Comprehensive audit of verified assets vs. liabilities for financial advisory
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Net Worth</span>
                <span className="text-lg font-black text-emerald-700">{formatZAR(netWorth)}</span>
              </div>
            </div>

            {/* Assets Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-lg">
                <span>ASSETS (Investments, Property & Vehicles)</span>
                <span>{formatZAR(totalAssets)}</span>
              </div>

              <div className="space-y-1.5 pl-2 text-xs">
                {policies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <div>
                      <strong className="text-slate-800">{p.name}</strong>
                      <span className="text-[11px] text-slate-400 block">{p.provider} • {p.policyNumber}</span>
                    </div>
                    <span className="font-semibold text-slate-900">
                      {formatZAR(p.currentValue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities Table */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 bg-rose-50/70 p-2.5 rounded-lg border border-rose-100">
                <span className="text-rose-900">LIABILITIES (Home Loan & Vehicle Finance)</span>
                <span className="text-rose-700 font-bold">{formatZAR(totalLiabilities)}</span>
              </div>

              <div className="space-y-1.5 pl-2 text-xs">
                {liabilities.map((l) => (
                  <div key={l.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 text-slate-600">
                    <div>
                      <strong className="text-slate-800">{l.name}</strong>
                      <span className="text-[11px] text-slate-400 block">
                        {l.institution} • Prime {l.interestRate}% • Repayment: {formatZAR(l.monthlyRepayment)}/mo
                      </span>
                    </div>
                    <span className="font-semibold text-rose-700">
                      {formatZAR(l.totalBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Income Statement Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Income & Cash Flow Statement</h3>
                <p className="text-xs text-slate-500">
                  Required for Reg 28 affordability and risk underwriting
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Free Cash Flow</span>
                <span className="text-base font-bold text-emerald-700">{formatZAR(netMonthlySurplus)}/mo</span>
              </div>
            </div>

            {isEditingFinancials ? (
              <form onSubmit={handleSaveFinancials} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Monthly Gross Remuneration (ZAR)</label>
                    <input
                      type="number"
                      value={monthlyGrossIncome}
                      onChange={(e) => setMonthlyGrossIncome(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Monthly Household Expenses (ZAR)</label>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Employer / Company</label>
                    <input
                      type="text"
                      value={employer}
                      onChange={(e) => setEmployer(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Occupation / Title</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingFinancials(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Gross Monthly Income</span>
                  <span className="text-base font-bold text-slate-900">{formatZAR(monthlyGrossIncome)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{occupation} at {employer}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Total Living Expenses & Outflows</span>
                  <span className="text-base font-bold text-slate-900">{formatZAR(monthlyExpenses)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Includes bond repayments & utility bills</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FICA & Brokerage Details (Col 3) */}
        <div className="space-y-6">
          {/* FICA Compliance Status Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">FICA Compliance File</h3>
            </div>
            <p className="text-xs text-slate-500">
              Financial Intelligence Centre Act (Act 38 of 2001) verified identity profile.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-medium">Smart ID Card</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-medium">Proof of Address (Utility)</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Current
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-medium">Proof of Banking Account</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-medium">FATCA / CRS Self-Certification</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Compliant
                </span>
              </div>
            </div>
          </div>

          {/* Brokerage & Advisory Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                RS
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Royal Square Financial</h4>
                <p className="text-xs text-amber-400">Authorised FSP No: 29370</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>4 Pritchard Street, Johannesburg, South Africa</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+27 11 492 1566</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>info@royalsquare.co.za</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Direct Financial Adviser:</span>
              <strong className="text-white">Qiniso Ntuli</strong>
              <p className="text-[11px] text-amber-400 mt-0.5">Key Individual & Certified FSP Principal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
