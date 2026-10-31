import React from 'react';
import { X, ShieldCheck, AlertOctagon, Download, Eye, Calendar, HardDrive, Cpu } from 'lucide-react';
import { DetectionResult } from '../../types/detection';
import { formatFileSize, formatDate, getVerdictTheme, getRiskBadgeColor } from '../../utils/formatters';
import { ConfidenceMeter } from '../detection/ConfidenceMeter';

interface HistoryDetailModalProps {
  result: DetectionResult | null;
  onClose: () => void;
  onLoadIntoDetector: (result: DetectionResult) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  result,
  onClose,
  onLoadIntoDetector,
}) => {
  if (!result) return null;

  const theme = getVerdictTheme(result.verdict);
  const isReal = result.verdict === 'REAL';

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `deepguard_forensic_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-guard-midnight/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-soft-xl border border-guard-border relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-guard-border">
          <div>
            <span className="text-[11px] font-mono uppercase text-guard-muted font-bold">
              Archived Analysis • {result.id}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-guard-navy truncate max-w-md">
              {result.filename}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-guard-muted hover:text-guard-navy"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          
          {/* Main Verdict Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-guard-softbg border border-guard-border gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                  isReal ? 'bg-detect-real' : 'bg-detect-fake'
                }`}
              >
                {isReal ? <ShieldCheck className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
              </div>
              <div>
                <span className={`text-xl font-black ${theme.text}`}>{result.verdict}</span>
                <p className="text-xs text-guard-muted mt-0.5">{theme.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${getRiskBadgeColor(result.riskLevel)}`}>
                {result.riskLevel} Risk
              </span>
              <span className="text-lg font-mono font-black text-guard-navy">
                {result.confidence}%
              </span>
            </div>
          </div>

          {/* Media Preview & Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700">
              <img
                src={result.previewUrl}
                alt="Scan thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-guard-midnight/80 px-2 py-0.5 rounded text-[10px] text-white font-mono uppercase">
                {result.mediaType}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-guard-border/60">
                <span className="text-guard-muted flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date</span>
                <span className="font-semibold text-guard-slate">{formatDate(result.timestamp)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-guard-border/60">
                <span className="text-guard-muted flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" /> File Size</span>
                <span className="font-semibold text-guard-slate">{formatFileSize(result.fileSizeBytes)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-guard-border/60">
                <span className="text-guard-muted flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Model</span>
                <span className="font-semibold text-guard-slate">ViT-B/16 (PyTorch)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-guard-border/60">
                <span className="text-guard-muted">Frames Evaluated</span>
                <span className="font-mono font-bold text-guard-navy">{result.framesAnalyzed}</span>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm text-xs text-guard-slate">
            <span className="font-bold text-guard-navy uppercase tracking-wider block mb-1">
              Forensic Synthesis
            </span>
            <p className="leading-relaxed">{result.explainability.summary}</p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-guard-border flex items-center justify-between">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-white border border-guard-border hover:border-pastel-blue text-xs font-semibold text-guard-slate hover:text-guard-navy flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download JSON
          </button>

          <button
            onClick={() => {
              onLoadIntoDetector(result);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-guard-navy text-white text-xs font-semibold hover:bg-guard-slate flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Open Full Forensic View
          </button>
        </div>

      </div>
    </div>
  );
};
