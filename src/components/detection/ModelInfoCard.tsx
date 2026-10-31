import React from 'react';
import { Cpu, Layers, Sparkles, Binary, CheckCircle2 } from 'lucide-react';
import { DetectionResult } from '../../types/detection';

interface ModelInfoCardProps {
  result: DetectionResult;
}

export const ModelInfoCard: React.FC<ModelInfoCardProps> = ({ result }) => {
  return (
    <div className="rounded-3xl glass-card p-6 border border-guard-border shadow-soft">
      <div className="flex items-center justify-between pb-4 border-b border-guard-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-pastel-cyan/70 flex items-center justify-center text-guard-navy">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider">
              Forensic Model Information
            </h4>
            <p className="text-[11px] text-guard-muted">Architecture & inference specifications</p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          Pretrained Checkpoint
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
        <div className="p-3.5 rounded-2xl bg-guard-softbg border border-guard-border/60">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Model</span>
          <span className="text-xs font-bold text-guard-navy mt-1 block">Vision Transformer (ViT)</span>
          <span className="text-[10px] text-guard-muted block font-mono">ViT-Base / 16x16</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-guard-softbg border border-guard-border/60">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Framework</span>
          <span className="text-xs font-bold text-guard-navy mt-1 block">{result.modelInfo.framework}</span>
          <span className="text-[10px] text-guard-muted block font-mono">Hugging Face ViT</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-guard-softbg border border-guard-border/60">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Detection Type</span>
          <span className="text-xs font-bold text-guard-navy mt-1 block">Deepfake Classification</span>
          <span className="text-[10px] text-guard-muted block font-mono">Patch-Level Features</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-guard-softbg border border-guard-border/60">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Explainability</span>
          <span className="text-xs font-bold text-guard-navy mt-1 block">Attention Rollout + Grad-CAM</span>
          <span className="text-[10px] text-guard-muted block font-mono">12 Multi-Head Attention</span>
        </div>
      </div>
    </div>
  );
};
