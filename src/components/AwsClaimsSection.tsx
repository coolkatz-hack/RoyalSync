import React, { useState } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  Calendar, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight,
  Image as ImageIcon,
  Camera,
  Maximize2
} from 'lucide-react';
import { AWSClaim, AWSUserSession, AWSClaimDocument } from '../services/awsApi';
import { formatZAR } from '../utils/formatters';
import { ClaimPhotoUploader, AttachedPhotoItem } from './ClaimPhotoUploader';

interface AwsClaimsSectionProps {
  claims: AWSClaim[];
  loading: boolean;
  user: AWSUserSession | null;
  onRefresh: () => void;
  onSelectClaimForTracker: (claim: AWSClaim) => void;
  onLodgeNewClaim: (payload: {
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

export const AwsClaimsSection: React.FC<AwsClaimsSectionProps> = ({
  claims,
  loading,
  user,
  onRefresh,
  onSelectClaimForTracker,
  onLodgeNewClaim
}) => {
  // Incident Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insurer, setInsurer] = useState<'Sanlam' | 'OUTsurance'>('Sanlam');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [policeReference, setPoliceReference] = useState('');
  const [drivable, setDrivable] = useState(true);
  const [thirdPartyInvolved, setThirdPartyInvolved] = useState(false);
  const [attachedPhotos, setAttachedPhotos] = useState<AttachedPhotoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Lightbox viewer for inspecting existing claim documents
  const [previewDoc, setPreviewDoc] = useState<{
    fileName: string;
    docType: string;
    url?: string;
    s3Key?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const ok = await onLodgeNewClaim({
        insurer,
        incidentDate,
        location,
        summary,
        policeReference: policeReference || 'PENDING',
        drivable,
        thirdPartyInvolved,
        documents: attachedPhotos
      });

      if (ok) {
        setFormSuccess('Claim & evidence photos successfully stored in AWS!');
        setTimeout(() => {
          setIsModalOpen(false);
          setLocation('');
          setSummary('');
          setPoliceReference('');
          setAttachedPhotos([]);
          setFormSuccess(null);
        }, 1200);
      } else {
        setFormError('Could not lodge claim. Please check connection.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Error submitting claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AWS Connection Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AWS DynamoDB • af-south-1 (Cape Town)
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Logged Insurance Claims
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized with insurer backend for {user?.fullName || 'Client'} ({user?.clientNumber || 'RC-4421'})
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-slate-500' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh AWS'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Report Incident</span>
          </button>
        </div>
      </div>

      {/* Claims List */}
      {loading && claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Connecting to AWS API Gateway...</p>
          <p className="text-xs text-slate-400 mt-1">Fetching claims from DynamoDB table</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <Car className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Logged Claims Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            No incident reports have been submitted to the database yet. Click below to lodge a new claim.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {claims.map((claim) => {
            const isSubmitted = claim.status === 'SUBMITTED';
            return (
              <div 
                key={claim.claimId}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {claim.insurer}
                        </span>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {claim.claimId}
                        </span>
                      </div>
                      {claim.insurerReference && (
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Insurer Ref: <strong className="font-semibold text-slate-700">{claim.insurerReference}</strong>
                        </span>
                      )}
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSubmitted 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="py-3 space-y-2">
                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {claim.incident?.summary || 'No incident summary available.'}
                    </p>

                    <div className="space-y-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{claim.incident?.location || 'Location pending'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {claim.incident?.date 
                            ? new Date(claim.incident.date).toLocaleDateString('en-ZA', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Date not set'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>SAPS Case: <strong className="text-slate-700 font-medium">{claim.incident?.policeReference || 'Pending'}</strong></span>
                      </div>
                    </div>

                    {/* Insured Vehicle */}
                    {claim.vehicle && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs flex items-center justify-between text-slate-600">
                        <span>
                          {claim.vehicle.year || ''} {claim.vehicle.make} {claim.vehicle.model}
                        </span>
                        <span className="font-mono font-semibold text-slate-800">
                          {claim.vehicle.registration}
                        </span>
                      </div>
                    )}

                    {/* S3 Documents attached */}
                    {claim.documents && claim.documents.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center justify-between">
                          <span>Attached Evidence & Pictures ({claim.documents.length}):</span>
                          <span className="text-[10px] text-slate-400 font-mono">AWS DynamoDB / S3</span>
                        </span>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                          {claim.documents.map((doc: any) => {
                            const isImage = doc.dataUrl || doc.fileUrl || doc.fileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
                            const previewSrc = doc.dataUrl || doc.fileUrl;
                            
                            return (
                              <button
                                key={doc.docId}
                                type="button"
                                onClick={() => setPreviewDoc({
                                  fileName: doc.fileName,
                                  docType: doc.docType || 'DAMAGE_PHOTO',
                                  url: previewSrc,
                                  s3Key: doc.s3Key
                                })}
                                className="group relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 hover:border-slate-400 transition-all text-left aspect-video flex flex-col justify-between"
                                title={`Click to view: ${doc.fileName}`}
                              >
                                {previewSrc ? (
                                  <img 
                                    src={previewSrc} 
                                    alt={doc.fileName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-1 text-slate-400 bg-slate-100">
                                    <Camera className="w-4 h-4 mb-0.5 text-slate-500" />
                                    <span className="text-[9px] font-bold text-slate-600 truncate max-w-full px-1">
                                      {doc.docType === 'POLICE_REPORT' ? 'SAPS REPORT' : 'DAMAGE PIC'}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow" />
                                </div>

                                <span className="absolute bottom-0 inset-x-0 bg-slate-900/75 backdrop-blur-2xs text-white text-[9px] px-1 py-0.5 truncate text-center">
                                  {doc.fileName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {claim.estimatedPayout ? `Est: ${formatZAR(claim.estimatedPayout)}` : 'Excess: Standard'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectClaimForTracker(claim)}
                    className="text-xs font-semibold text-slate-900 hover:text-slate-700 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    <span>Track in 10-Step Lifecycle</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incident Modal matching user's backend schema */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Report Incident to AWS Database</h3>
                <p className="text-xs text-slate-500 mt-0.5">Direct API Gateway submission to af-south-1</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Policy / Insurer</label>
                <select
                  value={insurer}
                  onChange={(e) => setInsurer(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                >
                  <option value="Sanlam">Sanlam (SAN-POL-9921)</option>
                  <option value="OUTsurance">OUTsurance (OUT-POL-304)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date & Time of Incident</label>
                <input
                  type="datetime-local"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location of Incident</label>
                <input
                  type="text"
                  placeholder="e.g. Rivonia Rd & Sandton Dr, Sandton"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">What happened? (Summary)</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of how the damage occurred..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SAPS Case Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SAPS-SAND-104/09"
                  value={policeReference}
                  onChange={(e) => setPoliceReference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Photo & Picture Attachments stored to AWS */}
              <div className="pt-1">
                <ClaimPhotoUploader 
                  photos={attachedPhotos}
                  onChange={setAttachedPhotos}
                  disabled={submitting}
                  maxPhotos={6}
                />
              </div>

              {/* Insured Vehicle Preview */}
              {user?.vehicle && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600">
                  <span className="font-semibold block text-slate-700">Vehicle on Record:</span>
                  <span>{user.vehicle.year} {user.vehicle.make} {user.vehicle.model} ({user.vehicle.registration})</span>
                </div>
              )}

              <div className="flex items-center gap-5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={drivable}
                    onChange={(e) => setDrivable(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span>Vehicle is drivable</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={thirdPartyInvolved}
                    onChange={(e) => setThirdPartyInvolved(e.target.checked)}
                    className="rounded text-slate-900 focus:ring-0"
                  />
                  <span>Third party involved</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Storing to AWS...' : `Lodge Claim (${attachedPhotos.length} Photo${attachedPhotos.length === 1 ? '' : 's'})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for inspecting stored AWS Claim Pictures */}
      {previewDoc && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-60 p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-200 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{previewDoc.fileName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  {previewDoc.s3Key || 'Stored in AWS S3'} • {previewDoc.docType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs font-semibold"
              >
                ✕ Close
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[65vh]">
              {previewDoc.url ? (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.fileName}
                  className="max-h-[65vh] w-auto object-contain"
                />
              ) : (
                <div className="p-12 text-slate-300 text-center space-y-2">
                  <Camera className="w-12 h-12 mx-auto text-slate-400" />
                  <p className="text-sm font-medium">Stored in S3 Bucket</p>
                  <p className="text-xs text-slate-500 font-mono">{previewDoc.s3Key || previewDoc.fileName}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {previewDoc.docType === 'POLICE_REPORT' ? 'SAPS Accident Report' : 'Vehicle Damage Photo'}
              </span>
              <span className="text-[11px] text-slate-400">AWS af-south-1 verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
