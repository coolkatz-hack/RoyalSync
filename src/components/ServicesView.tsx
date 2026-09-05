import React, { useState } from 'react';
import { 
  FileText, 
  MapPin, 
  CreditCard, 
  Globe, 
  Receipt, 
  Calendar, 
  CheckCircle2, 
  UploadCloud, 
  Download, 
  Send, 
  Building2, 
  ShieldCheck, 
  Car, 
  Printer, 
  Clock, 
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { ServiceRequest, PolicyAsset } from '../types';
import { formatDate } from '../utils/formatters';

interface ServicesViewProps {
  policies: PolicyAsset[];
  serviceRequests: ServiceRequest[];
  onSubmitServiceRequest: (newReq: ServiceRequest) => void;
  onNavigateToProfile: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  policies,
  serviceRequests,
  onSubmitServiceRequest,
  onNavigateToProfile
}) => {
  const [activeTab, setActiveTab] = useState<
    'address' | 'bank' | 'policy_doc' | 'border_letter' | 'tax_cert' | 'consultation' | 'history'
  >('border_letter');

  // Success message state
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form 1: Change of Address
  const [newStreetAddress, setNewStreetAddress] = useState('14 West Road South, Morningside, Sandton, 2196');
  const [newPostalAddress, setNewPostalAddress] = useState('Postnet Suite 402, Private Bag X9, Benmore, 2010');
  const [addressProofFile, setAddressProofFile] = useState('Ekurhuleni_Rates_July2026.pdf');
  const [syncAllProviders, setSyncAllProviders] = useState(true);

  // Form 2: Change of Bank Details
  const [bankName, setBankName] = useState('Investec Bank');
  const [accountNumber, setAccountNumber] = useState('10012938471');
  const [branchCode, setBranchCode] = useState('580105');
  const [accountType, setAccountType] = useState('Current / Cheque');
  const [debitDay, setDebitDay] = useState('1st of the month');
  const [bankProofFile, setBankProofFile] = useState('Investec_Bank_Confirmation_Letter.pdf');

  // Form 3: Request Policy Document
  const [selectedPolicyDocId, setSelectedPolicyDocId] = useState(policies[0]?.id || '');
  const [requestedDocType, setRequestedDocType] = useState('Official Policy Schedule');

  // Form 4: Border Letter (Very common & essential in South Africa)
  const [borderCountry, setBorderCountry] = useState('Mozambique (Kosi Bay / Ponta do Ouro)');
  const [borderVehicle, setBorderVehicle] = useState('2023 BMW 320d M Sport - HG 44 DF GP (Santam Policy)');
  const [borderTravelStart, setBorderTravelStart] = useState('2026-09-24');
  const [borderTravelEnd, setBorderTravelEnd] = useState('2026-10-02');
  const [driverName, setDriverName] = useState('Sipho Dlamini');
  const [generatedLetter, setGeneratedLetter] = useState(false);

  // Form 5: Tax Certificates (IT3b, IT3c, IRP5)
  const [taxCompany, setTaxCompany] = useState('Allan Gray Balanced Fund');
  const [taxYear, setTaxYear] = useState('2025/2026 Tax Assessment Year');
  const [taxDocType, setTaxDocType] = useState('IT3(b) & IT3(c) Consolidated Statement');

  // Form 6: Consultation / Review
  const [consultTopic, setConsultTopic] = useState('Estate Planning, Will Review & Trust Structuring');
  const [consultFormat, setConsultFormat] = useState('Virtual Microsoft Teams');
  const [consultDate, setConsultDate] = useState('2026-09-18');
  const [consultTime, setConsultTime] = useState('10:00 AM');
  const [consultNotes, setConsultNotes] = useState('Wish to review offshore allocation and update nomination of beneficiaries.');

  const triggerSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4500);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: ServiceRequest = {
      id: 'req-' + Date.now(),
      type: 'change_address',
      title: 'Change of Residential & Postal Address',
      description: `New Address: ${newStreetAddress}. Syncing to Santam, Allan Gray, Sanlam, Discovery.`,
      status: 'submitted',
      dateSubmitted: new Date().toISOString().split('T')[0],
      referenceNumber: 'ADDR-' + Math.floor(10000 + Math.random() * 90000)
    };
    onSubmitServiceRequest(req);
    triggerSuccess('Change of address submitted to Royal Square Financial operations. FICA verification initiated.');
    setActiveTab('history');
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: ServiceRequest = {
      id: 'req-' + Date.now(),
      type: 'change_bank',
      title: 'Change of Debit Order Banking Details',
      description: `${bankName} (Acc ending ${accountNumber.slice(-4)}). Debit day: ${debitDay}.`,
      status: 'submitted',
      dateSubmitted: new Date().toISOString().split('T')[0],
      referenceNumber: 'BANK-' + Math.floor(10000 + Math.random() * 90000)
    };
    onSubmitServiceRequest(req);
    triggerSuccess('Banking details change logged with verified bank letter attached. Processing with product providers.');
    setActiveTab('history');
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pol = policies.find(p => p.id === selectedPolicyDocId);
    const req: ServiceRequest = {
      id: 'req-' + Date.now(),
      type: 'request_policy_doc',
      title: `Policy Document: ${requestedDocType}`,
      description: `${pol?.provider || 'Insurer'} - ${pol?.name || 'Policy'} (#${pol?.policyNumber || '000'})`,
      status: 'completed',
      dateSubmitted: new Date().toISOString().split('T')[0],
      referenceNumber: 'DOC-' + Math.floor(10000 + Math.random() * 90000),
      notes: 'Generated and dispatched to client email: sipho.dlamini@investcorp.co.za'
    };
    onSubmitServiceRequest(req);
    triggerSuccess('Policy schedule prepared and dispatched to your email address.');
    setActiveTab('history');
  };

  const handleBorderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratedLetter(true);
    const req: ServiceRequest = {
      id: 'req-' + Date.now(),
      type: 'request_border_letter',
      title: `Cross-Border Insurance Letter: ${borderCountry}`,
      description: `${borderVehicle}. Travel dates: ${borderTravelStart} to ${borderTravelEnd}. Driver: ${driverName}.`,
      status: 'completed',
      dateSubmitted: new Date().toISOString().split('T')[0],
      referenceNumber: 'BORD-' + Math.floor(10000 + Math.random() * 90000),
      notes: 'Official Santam & Royal Square Financial border clearance letter issued.'
    };
    onSubmitServiceRequest(req);
    triggerSuccess('Cross-border letter generated with broker endorsement! Ready to print for border officials.');
  };

  const handleTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: ServiceRequest = {
      id: 'req-' + Date.now(),
      type: 'request_tax_cert',
      title: `Tax Certificate: ${taxDocType}`,
      description: `${taxCompany} for ${taxYear} (SARS eFiling submission)`,
      status: 'completed',
      dateSubmitted: new Date().toISOString().split('T')[0],
      referenceNumber: 'TAX-' + Math.floor(10000 + Math.random() * 90000),
      notes: 'Verified IT3(b) certificate retrieved from investment platform.'
    };
    onSubmitServiceRequest(req);
    triggerSuccess('Tax certificate retrieved successfully and ready for SARS submission.');
    setActiveTab('history');
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req: ServiceRequest = {
      id: 'req-' + Date.now(),
      type: 'request_consultation',
      title: `Consultation: ${consultTopic}`,
      description: `${consultFormat} on ${consultDate} at ${consultTime}. Adviser: Qiniso Ntuli.`,
      status: 'in_progress',
      dateSubmitted: new Date().toISOString().split('T')[0],
      referenceNumber: 'ADVISE-' + Math.floor(10000 + Math.random() * 90000)
    };
    onSubmitServiceRequest(req);
    triggerSuccess('Consultation request forwarded directly to Qiniso Ntuli. Calendar invite sent.');
    setActiveTab('history');
  };

  return (
    <div id="services-view-container" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Client Service Requests & Tasks</h2>
              <p className="text-xs text-slate-500">
                &ldquo;Other tasks the app should handle: Change of address, Change of bank details, Request a policy document, Request a border letter, Request an IRP5 or IT3(b)/(c), Request consultation, Balance sheet & income statement&rdquo;
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToProfile}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4" />
          <span>Update Balance Sheet / FICA</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('border_letter')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'border_letter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-600" />
          <span>Border Letter</span>
        </button>

        <button
          onClick={() => setActiveTab('address')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'address' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>Change of Address</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'bank' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Change Bank Details</span>
        </button>

        <button
          onClick={() => setActiveTab('policy_doc')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'policy_doc' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          <span>Request Policy Doc</span>
        </button>

        <button
          onClick={() => setActiveTab('tax_cert')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'tax_cert' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4 text-rose-600" />
          <span>IT3(b) / Tax Certificate</span>
        </button>

        <button
          onClick={() => setActiveTab('consultation')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'consultation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Consultation / Review</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-slate-600" />
          <span>Request Tracker ({serviceRequests.length})</span>
        </button>
      </div>

      {/* TAB 1: BORDER LETTER (High Priority in SA) */}
      {activeTab === 'border_letter' && (
        <div className="space-y-6">
          <form onSubmit={handleBorderSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cross-Border Travel Clearance Letter</h3>
                <p className="text-slate-500 mt-0.5">
                  South African customs and border control (SADC borders) mandate a formal letter from your insurer confirming territorial comprehensive cover.
                </p>
              </div>
              <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">
                Santam Endorsed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Destination Country / Border</label>
                <select
                  value={borderCountry}
                  onChange={(e) => setBorderCountry(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                >
                  <option>Mozambique (Kosi Bay / Ponta do Ouro / Lebombo)</option>
                  <option>Botswana (Pioneer Gate / Kopfontein)</option>
                  <option>Zimbabwe (Beitbridge)</option>
                  <option>Namibia (Nakop / Vioolsdrift)</option>
                  <option>Eswatini (Oshoek)</option>
                  <option>Lesotho (Maseru Bridge / Ficksburg)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle Insured on Policy</label>
                <select
                  value={borderVehicle}
                  onChange={(e) => setBorderVehicle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                >
                  <option>2023 BMW 320d M Sport - HG 44 DF GP (Santam Policy)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Departure Date</label>
                <input
                  type="date"
                  value={borderTravelStart}
                  onChange={(e) => setBorderTravelStart(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Return Date</label>
                <input
                  type="date"
                  value={borderTravelEnd}
                  onChange={(e) => setBorderTravelEnd(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Driver Name (as per Passport/ID)</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Financed Vehicle Permission</label>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600">
                  <span>WesBank Finance letter automatically bundled with Santam confirmation.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500">Includes 24/7 cross-border emergency towing assist</span>
              <button
                type="submit"
                id="generate-border-letter-btn"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Generate Official Border Letter</span>
              </button>
            </div>
          </form>

          {/* Generated Printable Border Letter Preview */}
          {generatedLetter && (
            <div id="printable-border-letter" className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-md space-y-6 text-slate-800 font-serif">
              {/* Header Letterhead */}
              <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                    ROYAL SQUARE FINANCIAL (PTY) LTD
                  </h2>
                  <p className="text-xs font-sans text-slate-600">
                    Authorised Financial Services Provider • FSP No: 29370
                  </p>
                  <p className="text-[11px] font-sans text-slate-500">
                    4 Pritchard Street, Johannesburg, South Africa • Tel: +27 11 492 1566
                  </p>
                </div>
                <div className="text-right font-sans">
                  <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    BORDER CLEARANCE
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Date: {new Date().toLocaleDateString('en-ZA')}</p>
                </div>
              </div>

              {/* Letter Content */}
              <div className="space-y-4 text-xs leading-relaxed">
                <p>
                  <strong>TO WHOM IT MAY CONCERN / BORDER IMMIGRATION & CUSTOMS AUTHORITIES</strong>
                </p>
                <p>
                  <strong>RE: COMPREHENSIVE MOTOR INSURANCE & CROSS-BORDER TRAVEL PERMISSION</strong>
                </p>
                <p>
                  This letter serves to certify that the vehicle detailed below is comprehensively insured under 
                  <strong> Santam Insurance Limited (Policy No: SAN-774921-B)</strong>, administered through our brokerage, 
                  <strong> Royal Square Financial (Pty) Ltd</strong>:
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Registered Owner / Insured:</strong> Mr. Sipho Dlamini (ID: 840612 5092 083)</div>
                    <div><strong>Vehicle Description:</strong> 2023 BMW 320d M Sport Automatic</div>
                    <div><strong>Registration Number:</strong> HG 44 DF GP</div>
                    <div><strong>VIN / Chassis Number:</strong> WBA31AY00982314</div>
                    <div><strong>Engine Number:</strong> B47D20A99412</div>
                    <div><strong>Territorial Cover:</strong> Full Comprehensive ({borderCountry})</div>
                    <div><strong>Cover Period:</strong> {borderTravelStart} to {borderTravelEnd}</div>
                    <div><strong>Financier:</strong> WesBank (Permission Granted)</div>
                  </div>
                </div>

                <p>
                  The territorial scope of the above policy extends to cover the designated vehicle whilst traveling within 
                  <strong> {borderCountry} </strong> for the specified travel duration. In the event of an incident or emergency, 
                  Santam 24/7 Roadside Assist may be reached at <strong>+27 11 991 8000</strong>.
                </p>

                <div className="pt-6 flex items-center justify-between border-t border-slate-200 font-sans">
                  <div>
                    <div className="font-bold text-slate-900">Qiniso Ntuli</div>
                    <div className="text-xs text-slate-600">Director & Key Individual (FSP: 29370)</div>
                    <div className="text-[10px] text-slate-400">Royal Square Financial (Pty) Ltd</div>
                  </div>
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-500/50 flex items-center justify-center text-[10px] text-amber-700 uppercase font-bold text-center rotate-[-12deg]">
                    Official Broker Stamp
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end font-sans">
                <button
                  type="button"
                  onClick={() => alert('Border letter sent to print spooler / PDF generated.')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print Border PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHANGE OF ADDRESS */}
      {activeTab === 'address' && (
        <form onSubmit={handleAddressSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Update Residential & Postal Address</h3>
            <p className="text-slate-500 mt-0.5">
              Royal Square Financial will synchronise your updated address across all active policies: Santam, Allan Gray, Sanlam, Discovery, and Liberty.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">New Physical / Residential Address</label>
              <textarea
                rows={2}
                value={newStreetAddress}
                onChange={(e) => setNewStreetAddress(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Note: A change in home address may adjust your Santam motor risk area premium.
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Postal Address</label>
              <input
                type="text"
                value={newPostalAddress}
                onChange={(e) => setNewPostalAddress(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <label className="font-semibold text-slate-700 block">FICA Proof of Address (Mandatory by Law)</label>
              <p className="text-[11px] text-slate-500">
                Utility bill, rates account, or retail bank statement not older than 3 months reflecting your full name and new physical address.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-slate-700 font-mono bg-white px-2.5 py-1 rounded border border-slate-200">
                  {addressProofFile}
                </span>
                <button
                  type="button"
                  onClick={() => alert('File picker: Attached Ekurhuleni_Rates_July2026.pdf')}
                  className="px-3 py-1 rounded bg-amber-100 text-amber-900 font-semibold"
                >
                  Attach Document
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={syncAllProviders}
                onChange={(e) => setSyncAllProviders(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-slate-700 font-medium">
                Auto-sync this change with Santam, Allan Gray, Sanlam, Discovery, and Liberty
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Address Update & FICA</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: CHANGE OF BANK DETAILS */}
      {activeTab === 'bank' && (
        <form onSubmit={handleBankSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Change Debit Order Bank Details</h3>
            <p className="text-slate-500 mt-0.5">
              Update the account from which premiums and investment debit orders are collected.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank Name</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>Investec Bank</option>
                <option>First National Bank (FNB)</option>
                <option>Standard Bank</option>
                <option>Nedbank</option>
                <option>Absa Bank</option>
                <option>Capitec Bank</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Account Number</label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Universal Branch Code</label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Account Type</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>Current / Cheque Account</option>
                <option>Savings Account</option>
                <option>Transmission Account</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Debit Order Deduction Date</label>
              <select
                value={debitDay}
                onChange={(e) => setDebitDay(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>1st of the month</option>
                <option>15th of the month</option>
                <option>25th of the month (Salary day)</option>
                <option>Last day of the month</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bank Confirmation Letter (FICA)</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-mono bg-slate-50 p-2 rounded border border-slate-200 truncate flex-1">
                  {bankProofFile}
                </span>
                <button
                  type="button"
                  onClick={() => alert('Simulated document upload: Investec_Bank_Confirmation_Letter.pdf')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold shrink-0"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Requires 10 days notice before the next scheduled debit run.</span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Update Banking Details</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: REQUEST A POLICY DOCUMENT */}
      {activeTab === 'policy_doc' && (
        <form onSubmit={handleDocSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Request Policy Document or Schedule</h3>
            <p className="text-slate-500 mt-0.5">
              Instant retrieval of official policy schedules, wordings, or paid-up certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Select Policy</label>
              <select
                value={selectedPolicyDocId}
                onChange={(e) => setSelectedPolicyDocId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.provider} — {p.name} (#{p.policyNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Document Type Required</label>
              <select
                value={requestedDocType}
                onChange={(e) => setRequestedDocType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>Official Policy Schedule (Current)</option>
                <option>Full Policy Wording & Terms & Conditions</option>
                <option>Annual Tax Certificate</option>
                <option>Paid-Up / Surrender Value Quote</option>
                <option>Member Benefit Statement</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">Destination:</span>
              <p className="text-slate-600">sipho.dlamini@investcorp.co.za</p>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" />
              <span>Generate & Email Document</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: REQUEST IRP5 / IT3(b) / IT3(c) TAX CERTIFICATES */}
      {activeTab === 'tax_cert' && (
        <form onSubmit={handleTaxSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Request IRP5 / IT3(b) / IT3(c) Tax Certificates</h3>
            <p className="text-slate-500 mt-0.5">
              Retrieve SARS eFiling compliant certificates for investment income, capital gains, and retirement deductions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Investment Institution</label>
              <select
                value={taxCompany}
                onChange={(e) => setTaxCompany(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>Allan Gray Balanced Fund (Tax-Free & RA)</option>
                <option>Sanlam Glacier (Retirement Annuity)</option>
                <option>Momentum Wealth</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">SARS Tax Assessment Year</label>
              <select
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>2025/2026 Tax Assessment Year (Current)</option>
                <option>2024/2025 Tax Assessment Year</option>
                <option>2023/2024 Tax Assessment Year</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Certificate Type</label>
              <select
                value={taxDocType}
                onChange={(e) => setTaxDocType(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>IT3(b) & IT3(c) Consolidated Statement</option>
                <option>Section 11F Retirement Contribution Certificate</option>
                <option>IRP5 / Tax Directive Certificate</option>
                <option>Tax-Free Investment Exemption Certificate</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Automated integration with Allan Gray & Sanlam Glacier APIs</span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Receipt className="w-4 h-4" />
              <span>Download Tax Certificate</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: REQUEST CONSULTATION / ANNUAL REVIEW */}
      {activeTab === 'consultation' && (
        <form onSubmit={handleConsultSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Request Consultation or Annual Financial Review</h3>
            <p className="text-slate-500 mt-0.5">
              Directly schedule time with Qiniso Ntuli (FSP 29370) for personalized fiduciary advice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Advisory Topic</label>
              <select
                value={consultTopic}
                onChange={(e) => setConsultTopic(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>Estate Planning, Will Review & Trust Structuring</option>
                <option>Annual Comprehensive Portfolio & Risk Review</option>
                <option>Offshore Currency Diversification & Section 11F Tax Optimization</option>
                <option>Post-Claim Policy Restructuring (Santam)</option>
                <option>Business Assurance / Buy-and-Sell Agreements</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Format</label>
              <select
                value={consultFormat}
                onChange={(e) => setConsultFormat(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>Virtual Microsoft Teams Meeting</option>
                <option>In-Person: Royal Square Offices (4 Pritchard St, Johannesburg)</option>
                <option>Client Residence / Office (Sandton)</option>
                <option>Phone Consultation</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Date</label>
              <input
                type="date"
                value={consultDate}
                onChange={(e) => setConsultDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Time</label>
              <select
                value={consultTime}
                onChange={(e) => setConsultTime(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              >
                <option>09:00 AM</option>
                <option>10:00 AM</option>
                <option>11:30 AM</option>
                <option>02:00 PM</option>
                <option>03:30 PM</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Meeting Notes / Objectives</label>
              <textarea
                rows={2}
                value={consultNotes}
                onChange={(e) => setConsultNotes(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500">Adviser: Qiniso Ntuli (FSP 29370)</span>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Confirm Consultation Request</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: REQUEST TRACKER & AUDIT TRAIL */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Your Submitted Requests & Status</h3>
            <span className="text-xs text-slate-500">Live operations queue at Royal Square Financial</span>
          </div>

          <div className="space-y-3">
            {serviceRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {req.referenceNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{req.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {formatDate(req.dateSubmitted)}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      req.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : req.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  {req.description}
                </p>

                {req.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                    <strong>Broker Update:</strong> {req.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
