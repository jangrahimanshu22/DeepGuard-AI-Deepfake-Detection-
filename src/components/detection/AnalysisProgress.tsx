import React from 'react';
import { Loader2, CheckCircle2, Cpu, Eye, Scan, FileText, Sparkles } from 'lucide-react';
import { MediaType } from '../../types/detection';

interface AnalysisProgressProps {
  currentStageId: number;
  stageName: string;
  progressPercent: number;
  frameInfo?: string;
  mediaPreviewUrl: string;
  mediaType: MediaType;
  filename: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  currentStageId,
  stageName,
  progressPercent,
  frameInfo,
  mediaPreviewUrl,
  mediaType,
  filename,
}) => {
  const stages = [
    { id: 1, name: 'Uploading', icon: FileText, desc: 'Integrity check' },
    { id: 2, name: 'Detecting Face', icon: Scan, desc: 'Facial landmarks' },
    { id: 3, name: 'Extracting Features', icon: Eye, desc: '16x16 patch tokens' },
    { id: 4, name: 'ViT Analysis', icon: Cpu, desc: 'Multi-head attention' },
    { id: 5, name: 'Generating Result', icon: Sparkles, desc: 'Forensic rollout' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel p-6 sm:p-10 shadow-soft-xl border border-white relative overflow-hidden animate-fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-guard-border/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-rose animate-ping" />
            <h3 className="text-xl font-extrabold text-guard-navy">Forensic Pipeline in Progress</h3>
          </div>
          <p className="text-xs text-guard-muted mt-1">
            Analyzing <span className="font-semibold text-guard-slate">{filename}</span> with Vision Transformer
          </p>
        </div>

        <div className="flex items-center gap-2 bg-guard-softbg px-4 py-2 rounded-2xl border border-guard-border">
          <span className="text-xs font-mono font-bold text-guard-navy">ViT-B/16</span>
          <span className="text-[10px] text-guard-muted">•</span>
          <span className="text-xs font-mono font-bold text-detect-real">PyTorch v2.3</span>
        </div>
      </div>

      {/* Main Processing View (Two Columns on Desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8 items-center">
        
        {/* Left: Media Preview with Animated Scanning Beam & Face ROI */}
        <div className="md:col-span-5 relative">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700/80 shadow-soft-lg flex items-center justify-center">
            
            {/* Media Preview (Image or Video thumbnail) */}
            <img
              src={mediaPreviewUrl}
              alt="Media scanning target"
              className="absolute inset-0 w-full h-full object-cover opacity-80 filter contrast-110"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-guard-midnight/30" />

            {/* Simulated 8x8 Patch Grid Overlay */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 pointer-events-none opacity-40">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-white/20 rounded-sm" />
              ))}
            </div>

            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-pastel-rose to-transparent shadow-[0_0_16px_#F791A9] animate-scan z-20" />

            {/* Bounding Box on Face Area */}
            <div className="absolute inset-10 rounded-2xl border-2 border-dashed border-pastel-cyan pointer-events-none z-10 flex flex-col justify-between p-2.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-pastel-cyan font-bold bg-guard-midnight/70 px-1.5 py-0.5 rounded">
                <span>FACE_DETECTION: LOCK</span>
                <span>IoU: 0.94</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-pastel-yellow font-bold bg-guard-midnight/70 px-1.5 py-0.5 rounded">
                <span>ATTENTION HEADS: 12</span>
                <span>PATCH: 16x16</span>
              </div>
            </div>

            {/* Live Status Badge */}
            <div className="absolute bottom-3 left-3 right-3 z-30 bg-guard-midnight/80 backdrop-blur-md rounded-xl p-2.5 border border-white/20 flex items-center justify-between text-xs text-white">
              <span className="font-mono text-[11px] text-pastel-cyan">
                {frameInfo || (mediaType === 'video' ? 'Analyzing frame sequence...' : 'Extracting facial patch tokens...')}
              </span>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pastel-rose" />
            </div>

          </div>
        </div>

        {/* Right: Progress Metric & 5-Step Timeline */}
        <div className="md:col-span-7 flex flex-col justify-center">
          
          {/* Progress Percent & Stage Name */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm font-bold text-guard-navy flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pastel-rose" />
                {stageName}
              </span>
              <span className="text-2xl font-black font-mono text-guard-navy">
                {progressPercent}%
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-guard-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pastel-rose via-pastel-yellow to-detect-real transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 5-Stage Vertical Timeline */}
          <div className="space-y-3.5">
            {stages.map((stg) => {
              const isCompleted = currentStageId > stg.id;
              const isCurrent = currentStageId === stg.id;
              const Icon = stg.icon;

              return (
                <div
                  key={stg.id}
                  className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-200 ${
                    isCurrent
                      ? 'bg-white border-pastel-rose/80 shadow-md ring-1 ring-pastel-rose/40'
                      : isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200 text-guard-slate'
                      : 'bg-white/40 border-slate-200/60 opacity-60'
                  }`}
                >
                  {/* Icon / Status indicator */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? 'bg-detect-real text-white'
                        : isCurrent
                        ? 'bg-pastel-blush text-guard-navy font-bold'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Icon className="w-4 h-4 text-guard-navy animate-pulse" />
                    ) : (
                      <span className="text-xs font-bold font-mono">{stg.id}</span>
                    )}
                  </div>

                  {/* Stage text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-guard-navy' : 'text-guard-slate'}`}>
                        {stg.name}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-pastel-rose bg-pastel-blush px-2 py-0.5 rounded-full">
                          Processing
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] uppercase font-bold text-detect-real">
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-guard-muted mt-0.5 truncate">{stg.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
