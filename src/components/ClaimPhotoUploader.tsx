import React, { useState, useRef } from 'react';
import { 
  Camera, 
  UploadCloud, 
  X, 
  Image as ImageIcon, 
  FileText, 
  Check, 
  Eye, 
  Sparkles,
  Trash2,
  Maximize2
} from 'lucide-react';
import { AWSClaimDocument } from '../services/awsApi';

export interface AttachedPhotoItem extends AWSClaimDocument {
  fileSize?: number;
  dataUrl?: string;
  fileType?: string;
}

interface ClaimPhotoUploaderProps {
  photos: AttachedPhotoItem[];
  onChange: (photos: AttachedPhotoItem[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

// Crisp sample SVG data URLs for instant one-click realistic testing
const SAMPLE_ACCIDENT_PRESETS = [
  {
    title: 'Front Bumper Dent',
    fileName: 'front_bumper_impact.jpg',
    docType: 'DAMAGE_PHOTO',
    svgColor: '#e2e8f0',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><path d="M100 240 Q 300 200 500 240 L 480 340 L 120 340 Z" fill="%23cbd5e1" stroke="%23475569" stroke-width="4"/><path d="M 240 220 Q 280 270 340 230 Q 320 280 260 270 Z" fill="%23334155" stroke="%230f172a" stroke-width="3"/><path d="M 270 235 L 310 255 M 285 240 L 295 265" stroke="%23dc2626" stroke-width="3"/><rect x="230" y="300" width="140" height="30" rx="4" fill="%23f8fafc" stroke="%230f172a" stroke-width="2"/><text x="300" y="321" font-family="monospace" font-size="14" font-weight="bold" fill="%230f172a" text-anchor="middle">CA 123-456</text><rect x="420" y="240" width="60" height="25" rx="5" fill="%23ef4444"/><rect x="120" y="240" width="60" height="25" rx="5" fill="%23ef4444"/><text x="30" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2394a3b8">FRONT BUMPER COLLISION EVIDENCE</text><text x="30" y="65" font-family="monospace" font-size="12" fill="%2364748b">GPS: -26.1075, 28.0567 | DATE: 2026-09-05</text></svg>`
  },
  {
    title: 'Rear Quarter Scuff',
    fileName: 'rear_bumper_damage.jpg',
    docType: 'DAMAGE_PHOTO',
    svgColor: '#e2e8f0',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><path d="M80 180 C 180 140, 420 140, 520 180 L 500 320 L 100 320 Z" fill="%2394a3b8" stroke="%23334155" stroke-width="4"/><path d="M 380 200 C 440 220, 480 240, 460 280 C 410 270, 390 230, 380 200 Z" fill="%231e293b" stroke="%23dc2626" stroke-width="3"/><line x1="390" y1="210" x2="450" y2="260" stroke="%23f59e0b" stroke-width="2"/><line x1="410" y1="205" x2="465" y2="245" stroke="%23f59e0b" stroke-width="2"/><circle cx="480" cy="190" r="18" fill="%23ef4444" opacity="0.8"/><text x="30" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2394a3b8">REAR PANEL &amp; LIGHT DAMAGE</text><text x="30" y="65" font-family="monospace" font-size="12" fill="%2364748b">CLAIMS ID REF: CLM-EVIDENCE-02</text></svg>`
  },
  {
    title: 'Windscreen Star Crack',
    fileName: 'windscreen_chip.jpg',
    docType: 'DAMAGE_PHOTO',
    svgColor: '#e2e8f0',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><rect x="60" y="60" width="480" height="280" rx="12" fill="%2338bdf8" fill-opacity="0.2" stroke="%2338bdf8" stroke-width="2"/><circle cx="280" cy="200" r="8" fill="%23ffffff"/><path d="M 280 200 L 220 150 M 280 200 L 350 160 M 280 200 L 320 270 M 280 200 L 230 250 M 280 200 L 290 130" stroke="%23ffffff" stroke-width="3"/><path d="M 280 200 L 250 170 M 280 200 L 310 180 M 280 200 L 300 230" stroke="%23e0f2fe" stroke-width="1.5"/><text x="30" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="%2394a3b8">WINDSCREEN GLASS CRACK</text><text x="30" y="65" font-family="monospace" font-size="12" fill="%2364748b">OUTSURANCE / SANLAM MOTOR GLASS</text></svg>`
  },
  {
    title: 'SAPS Case Stamp',
    fileName: 'saps_police_report.jpg',
    docType: 'POLICE_REPORT',
    svgColor: '#e2e8f0',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="320" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><text x="300" y="80" font-family="serif" font-size="18" font-weight="bold" fill="%230f172a" text-anchor="middle">SOUTH AFRICAN POLICE SERVICE</text><text x="300" y="105" font-family="sans-serif" font-size="13" fill="%23475569" text-anchor="middle">OFFICIAL ACCIDENT REPORT (OAR)</text><line x1="80" y1="120" x2="520" y2="120" stroke="%2394a3b8" stroke-width="1"/><text x="80" y="160" font-family="sans-serif" font-size="12" fill="%23334155">Case No: SAPS-SND-104/09</text><text x="80" y="190" font-family="sans-serif" font-size="12" fill="%23334155">Station: Sandton Police Station</text><text x="80" y="220" font-family="sans-serif" font-size="12" fill="%23334155">Investigating Officer: Sgt. D. Khumalo</text><text x="80" y="250" font-family="sans-serif" font-size="12" fill="%23334155">Driver: Sipho Ndlovu (CA 123-456)</text><circle cx="440" cy="220" r="50" fill="none" stroke="%232563eb" stroke-width="3" stroke-dasharray="6,4"/><text x="440" y="215" font-family="sans-serif" font-size="11" font-weight="bold" fill="%232563eb" text-anchor="middle">SAPS OFFICIAL</text><text x="440" y="235" font-family="sans-serif" font-size="10" font-weight="bold" fill="%232563eb" text-anchor="middle">STAMP APPROVED</text></svg>`
  }
];

export const ClaimPhotoUploader: React.FC<ClaimPhotoUploaderProps> = ({
  photos,
  onChange,
  maxPhotos = 10,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<AttachedPhotoItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from disk
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const availableSlots = maxPhotos - photos.length;
    if (availableSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, availableSlots);

    filesToProcess.forEach((file) => {
      // Validate is image
      if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif|heic|pdf)$/i)) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newPhoto: AttachedPhotoItem = {
          docId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          fileName: file.name,
          docType: file.name.toLowerCase().includes('police') ? 'POLICE_REPORT' : 'DAMAGE_PHOTO',
          fileSize: file.size,
          fileType: file.type,
          dataUrl: result,
          s3Key: `claims/uploads/${file.name}`,
          uploadedAt: new Date().toISOString()
        };

        onChange([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemovePhoto = (docId: string) => {
    onChange(photos.filter(p => p.docId !== docId));
  };

  const handleUpdateDocType = (docId: string, newType: string) => {
    onChange(photos.map(p => p.docId === docId ? { ...p, docType: newType } : p));
  };

  const handleAddPreset = (preset: typeof SAMPLE_ACCIDENT_PRESETS[0]) => {
    if (photos.length >= maxPhotos) return;

    const newPhoto: AttachedPhotoItem = {
      docId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fileName: preset.fileName,
      docType: preset.docType,
      fileSize: 184500,
      fileType: 'image/jpeg',
      dataUrl: preset.dataUrl,
      s3Key: `claims/cust_001/${preset.fileName}`,
      uploadedAt: new Date().toISOString()
    };

    onChange([...photos, newPhoto]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-slate-800">
            Incident Photographs & Evidence ({photos.length}/{maxPhotos})
          </label>
          <p className="text-[11px] text-slate-500">
            Attach vehicle damage, scene context, or SAPS case reports to store in AWS.
          </p>
        </div>

        {photos.length < maxPhotos && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <span>Quick presets:</span>
            {SAMPLE_ACCIDENT_PRESETS.slice(0, 2).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddPreset(preset)}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          isDragging 
            ? 'border-slate-800 bg-slate-100' 
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled || photos.length >= maxPhotos}
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
            <UploadCloud className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800">
              <span className="text-slate-900 underline underline-offset-2">Click to browse files</span> or drag and drop pictures here
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Supports JPG, PNG, WEBP up to 10MB each (Automatically uploaded to AWS DynamoDB / S3)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Presets Bar for Mobile or Instant Simulation */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          One-Click Test Samples:
        </span>
        {SAMPLE_ACCIDENT_PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleAddPreset(preset)}
            disabled={photos.length >= maxPhotos}
            className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-medium border border-slate-200 text-[10px] transition-colors shadow-2xs flex items-center gap-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-slate-500" />
            <span>{preset.title}</span>
          </button>
        ))}
      </div>

      {/* Grid of Attached Photos */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {photos.map((photo) => (
            <div 
              key={photo.docId}
              className="group relative bg-white rounded-xl border border-slate-200 p-2 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-100 flex items-center justify-center">
                {photo.dataUrl || photo.fileUrl ? (
                  <img 
                    src={photo.dataUrl || photo.fileUrl} 
                    alt={photo.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-2">
                    <FileText className="w-6 h-6" />
                    <span className="text-[9px] mt-1 font-mono">PDF/DOC</span>
                  </div>
                )}

                {/* Quick overlay actions */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxPhoto(photo);
                    }}
                    title="Enlarge photo"
                    className="p-1.5 rounded-md bg-white/90 text-slate-900 hover:bg-white transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(photo.docId);
                    }}
                    title="Remove photo"
                    className="p-1.5 rounded-md bg-rose-600/90 text-white hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/70 text-white text-[9px] font-mono">
                  {photo.fileSize ? `${Math.round(photo.fileSize / 1024)} KB` : 'Attached'}
                </span>
              </div>

              {/* Photo Metadata & Category */}
              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-bold text-slate-800 truncate" title={photo.fileName}>
                  {photo.fileName}
                </p>
                <select
                  value={photo.docType}
                  onChange={(e) => handleUpdateDocType(photo.docId, e.target.value)}
                  className="w-full text-[10px] py-1 px-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-slate-400"
                >
                  <option value="DAMAGE_PHOTO">Vehicle Damage</option>
                  <option value="SCENE_PHOTO">Accident Scene</option>
                  <option value="THIRD_PARTY_PHOTO">Third Party Vehicle</option>
                  <option value="POLICE_REPORT">SAPS Case Stamp</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Full-screen Image Preview Modal */}
      {lightboxPhoto && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-60 p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-200 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{lightboxPhoto.fileName}</h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  S3: {lightboxPhoto.s3Key || 'claims/uploads/' + lightboxPhoto.fileName} • {lightboxPhoto.docType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs"
              >
                ✕ Close
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[60vh]">
              {lightboxPhoto.dataUrl || lightboxPhoto.fileUrl ? (
                <img 
                  src={lightboxPhoto.dataUrl || lightboxPhoto.fileUrl} 
                  alt={lightboxPhoto.fileName}
                  className="max-h-[60vh] w-auto object-contain"
                />
              ) : (
                <div className="p-12 text-slate-400 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xs">Document stored in AWS S3</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Type: <strong>{lightboxPhoto.docType}</strong></span>
              <span>Uploaded: {new Date(lightboxPhoto.uploadedAt).toLocaleString('en-ZA')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
