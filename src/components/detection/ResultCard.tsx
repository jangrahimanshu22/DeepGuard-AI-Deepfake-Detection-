import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  RotateCcw,
  Download,
  Eye,
  FileText,
  Users,
  CheckCircle2,
  Lock,
  Hash,
  Award
} from 'lucide-react';
import { DetectionResult } from '../../types/detection';
import { ConfidenceMeter } from './ConfidenceMeter';
import { getVerdictTheme, getRiskBadgeColor, formatDate } from '../../utils/formatters';

interface ResultCardProps {
  result: DetectionResult;
  onReset: () => void;
  onScrollToExplain: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, onScrollToExplain }) => {
  const [selectedFaceId, setSelectedFaceId] = useState<number | null>(null);
  const theme = getVerdictTheme(result.verdict);
  const isReal = result.verdict === 'REAL';
  const isFake = result.verdict === 'FAKE';
  const hasMultipleFaces = (result.faces && result.faces.length > 1);

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deepguard_forensic_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadPDF = () => {
    window.open(`http://127.0.0.1:8000/api/report/${result.id}`, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel p-6 sm:p-10 shadow-soft-xl border border-white relative animate-fade-in">
      
      {/* Top Bar with Filename, Timestamp, & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-guard-border/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-guard-muted">
              Scan ID: {result.id}
            </span>
            <span className="text-xs text-guard-border">•</span>
            <span className="text-xs text-guard-muted">{formatDate(result.timestamp)}</span>
            {result.mediaHash && (
              <>
                <span className="text-xs text-guard-border">•</span>
                <span className="text-[11px] font-mono text-guard-slate flex items-center gap-1">
                  <Hash className="w-3 h-3 text-guard-muted" />
                  {result.mediaHash.slice(0, 8)}...
                </span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-guard-navy mt-1 truncate max-w-md">
            {result.filename}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 rounded-xl bg-pastel-blush hover:bg-pastel-rose text-xs font-bold text-guard-navy flex items-center gap-1.5 transition-all shadow-sm border border-pastel-rose/50"
            title="Download Official PDF Certificate with QR Code and SHA-256 fingerprint"
          >
            <Award className="w-4 h-4 text-pastel-rose" />
            Signed Certificate
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-white border border-guard-border hover:border-pastel-blue text-xs font-semibold text-guard-slate hover:text-guard-navy flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            JSON
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-guard-navy hover:bg-guard-slate text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Analyze Another
          </button>
        </div>
      </div>

      {/* Hero Result Section (Verdict + Confidence Meter) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-8">
        
        {/* Left Verdict Banner */}
        <div className="md:col-span-7 flex flex-col items-start w-full">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
            {/* Analyzed Target Preview Thumbnail */}
            {result.previewUrl && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-guard-border shrink-0 shadow-sm bg-slate-900 group">
                <img
                  src={result.previewUrl}
                  alt="Analyzed target"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className={`absolute bottom-1 right-1 text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                  isReal ? 'bg-detect-real text-white' : 'bg-detect-fake text-white'
                }`}>
                  {result.verdict}
                </div>
              </div>
            )}

            <div className="flex-1">
              {/* Main Verdict Indicator */}
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`px-5 py-2 rounded-2xl text-2xl sm:text-3xl font-black font-sans tracking-wide shadow-sm flex items-center gap-2.5 ${
                    isReal
                      ? 'bg-[#2E8B70] text-white ring-4 ring-detect-real/20'
                      : isFake
                      ? 'bg-[#D94F70] text-white ring-4 ring-detect-fake/20'
                      : 'bg-[#C58B2B] text-white ring-4 ring-detect-warning/20'
                  }`}
                >
                  {isReal && <ShieldCheck className="w-7 h-7 stroke-[2.5]" />}
                  {isFake && <AlertOctagon className="w-7 h-7 stroke-[2.5]" />}
                  {!isReal && !isFake && <AlertTriangle className="w-7 h-7 stroke-[2.5]" />}
                  {result.verdict}
                </div>

                <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${getRiskBadgeColor(result.riskLevel)}`}>
                  Risk: {result.riskLevel}
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base font-medium text-guard-slate mt-2 leading-relaxed">
                {theme.description}
              </p>
            </div>
          </div>

          {/* Real vs Fake Comparative Probability Bar */}
          <div className="w-full mt-5 p-3.5 rounded-2xl bg-white/80 border border-guard-border/70 shadow-xs">
            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
              <span className="text-detect-real flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-detect-real inline-block shadow-xs" />
                Authentic (Real): {((result.rawOutput.probabilities?.REAL ?? (isReal ? result.confidence / 100 : (100 - result.confidence) / 100)) * 100).toFixed(1)}%
              </span>
              <span className="text-detect-fake flex items-center gap-1.5">
                Synthetic (Fake): {((result.rawOutput.probabilities?.FAKE ?? (isFake ? result.confidence / 100 : (100 - result.confidence) / 100)) * 100).toFixed(1)}%
                <span className="w-2.5 h-2.5 rounded-full bg-detect-fake inline-block shadow-xs" />
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
              <div 
                style={{ width: `${(result.rawOutput.probabilities?.REAL ?? (isReal ? result.confidence / 100 : (100 - result.confidence) / 100)) * 100}%` }} 
                className="h-full bg-detect-real transition-all duration-500" 
              />
              <div 
                style={{ width: `${(result.rawOutput.probabilities?.FAKE ?? (isFake ? result.confidence / 100 : (100 - result.confidence) / 100)) * 100}%` }} 
                className="h-full bg-detect-fake transition-all duration-500" 
              />
            </div>
          </div>

          {/* Multi-Face Crowd Inspection Section (Pillar 5) */}
          {hasMultipleFaces && (
            <div className="w-full mt-4 p-4 rounded-2xl bg-white/90 border border-guard-border shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-guard-navy flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-pastel-blue" />
                  Multi-Face Crowd Inspection ({result.faces!.length} faces detected)
                </span>
                <span className="text-[11px] text-guard-muted">Click face to highlight</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {result.faces!.map((face) => {
                  const faceIsReal = face.prediction === 'REAL';
                  const isSelected = selectedFaceId === face.face_id;
                  return (
                    <button
                      key={face.face_id}
                      onClick={() => setSelectedFaceId(isSelected ? null : face.face_id)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-guard-navy bg-pastel-cyan/20 ring-2 ring-guard-navy/20'
                          : 'border-guard-border bg-slate-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-guard-navy">Face #{face.face_id}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                          faceIsReal ? 'bg-detect-real-bg text-detect-real-text' : 'bg-detect-fake-bg text-detect-fake-text'
                        }`}>
                          {face.prediction}
                        </span>
                      </div>
                      <div className="text-[10px] text-guard-slate mt-0.5">
                        Confidence: {face.confidence}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metric Details Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mt-4 pt-4 border-t border-guard-border/80">
            <div className="p-3 rounded-2xl bg-guard-softbg border border-guard-border/60">
              <span className="text-[10px] uppercase font-bold text-guard-muted block">Prediction</span>
              <span className={`text-sm font-black ${theme.text} mt-0.5 block`}>{result.verdict}</span>
            </div>

            <div className="p-3 rounded-2xl bg-guard-softbg border border-guard-border/60">
              <span className="text-[10px] uppercase font-bold text-guard-muted block">Engine</span>
              <span className="text-xs font-bold text-guard-navy mt-0.5 block truncate">Dual-Stream ViT</span>
            </div>

            <div className="p-3 rounded-2xl bg-guard-softbg border border-guard-border/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-guard-muted block">Coverage</span>
              <span className="text-xs font-bold font-mono text-guard-navy mt-0.5 block">
                {result.framesAnalyzed} {result.mediaType === 'video' ? 'Frames' : 'Frame'} • {result.faces?.length || 1} Face(s)
              </span>
            </div>
          </div>

          {/* Secondary "Why this result?" trigger */}
          <button
            onClick={onScrollToExplain}
            className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-pastel-rose hover:text-guard-navy transition-colors group"
          >
            <Eye className="w-4 h-4" />
            <span>Why did the model make this prediction? Jump to 6-pillar explainability</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Right Large Circular Confidence Meter */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/70 border border-guard-border/70 shadow-sm">
          <ConfidenceMeter
            confidence={result.confidence}
            verdict={result.verdict}
            size={190}
            strokeWidth={16}
          />
          <div className="mt-3 text-center">
            <span className="text-xs text-guard-muted font-medium block">
              Posterior Probability: {(result.confidence / 100).toFixed(4)}
            </span>
            <span className="text-[11px] font-mono text-guard-slate mt-0.5 block">
              Classification: {result.verdict} ({result.riskLevel} Risk)
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
