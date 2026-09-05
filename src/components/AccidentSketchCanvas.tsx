import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Car, Compass, CheckCircle2 } from 'lucide-react';

interface AccidentSketchCanvasProps {
  onSaveSketch?: (dataUrl: string) => void;
  initialSketch?: string;
}

export const AccidentSketchCanvas: React.FC<AccidentSketchCanvasProps> = ({ onSaveSketch, initialSketch }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>('#1e293b');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set background to light slate with subtle road grid guidelines
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw faint road grid guideline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Center cross lines for intersection reference
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash

    // If initial sketch provided, draw it
    if (initialSketch) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialSketch;
    } else {
      // Draw road guides
      ctx.fillStyle = '#64748b';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Road / Intersection Layout Area', 16, 24);
      ctx.fillText('Sketch vehicles, lanes & direction of travel', 16, 40);
    }
  }, [initialSketch]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setIsSaved(false);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    triggerSave();
  };

  const triggerSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    if (onSaveSketch) {
      onSaveSketch(dataUrl);
    }
    setIsSaved(true);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Redraw faint guidelines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Road / Intersection Layout Area', 16, 24);
    ctx.fillText('Sketch vehicles, lanes & direction of travel', 16, 40);

    triggerSave();
  };

  // Stamp helper for quick vehicle markings
  const addStamp = (type: 'myCar' | 'otherCar' | 'arrow') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsSaved(false);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (type === 'myCar') {
      ctx.fillStyle = '#1e3a8a'; // Dark blue
      ctx.fillRect(centerX - 35, centerY - 20, 70, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('My Car [A]', centerX - 28, centerY + 4);
    } else if (type === 'otherCar') {
      ctx.fillStyle = '#b91c1c'; // Red
      ctx.fillRect(centerX + 15, centerY + 30, 70, 40);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Third Party [B]', centerX + 18, centerY + 54);
    } else if (type === 'arrow') {
      ctx.strokeStyle = '#d97706'; // Amber
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX - 60, centerY);
      ctx.lineTo(centerX - 10, centerY);
      ctx.lineTo(centerX - 20, centerY - 8);
      ctx.moveTo(centerX - 10, centerY);
      ctx.lineTo(centerX - 20, centerY + 8);
      ctx.stroke();
    }

    triggerSave();
  };

  return (
    <div id="accident-sketch-container" className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <PenTool className="w-4 h-4 text-slate-700" />
          <span>Accident Scene Sketch Pad</span>
          <span className="text-[11px] font-normal text-slate-500">(Required by Santam & Insurers)</span>
        </div>
        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sketch Saved
            </span>
          )}
          <button
            type="button"
            id="clear-sketch-button"
            onClick={clearCanvas}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-rose-600 px-2.5 py-1 rounded bg-slate-100 hover:bg-rose-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Canvas Tool Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 mr-1">Pen:</span>
          <button
            type="button"
            onClick={() => setSelectedColor('#1e293b')}
            className={`w-6 h-6 rounded-full bg-slate-800 border-2 transition-transform ${selectedColor === '#1e293b' ? 'scale-110 border-indigo-600' : 'border-white'}`}
            title="Road / Black"
          />
          <button
            type="button"
            onClick={() => setSelectedColor('#1d4ed8')}
            className={`w-6 h-6 rounded-full bg-blue-600 border-2 transition-transform ${selectedColor === '#1d4ed8' ? 'scale-110 border-indigo-600' : 'border-white'}`}
            title="My Car (Blue)"
          />
          <button
            type="button"
            onClick={() => setSelectedColor('#dc2626')}
            className={`w-6 h-6 rounded-full bg-red-600 border-2 transition-transform ${selectedColor === '#dc2626' ? 'scale-110 border-indigo-600' : 'border-white'}`}
            title="Other Car (Red)"
          />
          <button
            type="button"
            onClick={() => setSelectedColor('#d97706')}
            className={`w-6 h-6 rounded-full bg-amber-600 border-2 transition-transform ${selectedColor === '#d97706' ? 'scale-110 border-indigo-600' : 'border-white'}`}
            title="Arrows / Impact (Amber)"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 mr-1">Quick Stamp:</span>
          <button
            type="button"
            onClick={() => addStamp('myCar')}
            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors font-medium text-[11px]"
          >
            <Car className="w-3 h-3" />
            + My Car
          </button>
          <button
            type="button"
            onClick={() => addStamp('otherCar')}
            className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors font-medium text-[11px]"
          >
            <Car className="w-3 h-3" />
            + 3rd Party
          </button>
          <button
            type="button"
            onClick={() => addStamp('arrow')}
            className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded hover:bg-amber-200 transition-colors font-medium text-[11px]"
          >
            <Compass className="w-3 h-3" />
            + Direction
          </button>
        </div>
      </div>

      {/* Interactive Drawing Canvas */}
      <div className="relative border border-slate-300 rounded-lg overflow-hidden touch-none bg-slate-50 shadow-inner">
        <canvas
          ref={canvasRef}
          width={560}
          height={240}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair block"
        />
      </div>
      <p className="text-[11px] text-slate-500 text-center">
        Draw lanes, point of impact, street names, or use the quick stamps. This diagram will be attached to your Santam claim submission.
      </p>
    </div>
  );
};
