import React from 'react';
import { ShieldCheck, AlertOctagon, Activity, Cpu, Percent } from 'lucide-react';
import { DetectionResult } from '../../types/detection';

interface StatsCardsProps {
  history: DetectionResult[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ history }) => {
  const total = history.length;
  const realCount = history.filter((h) => h.verdict === 'REAL').length;
  const fakeCount = history.filter((h) => h.verdict === 'FAKE').length;
  const avgConfidence = total > 0
    ? (history.reduce((acc, curr) => acc + curr.confidence, 0) / total).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Analyses */}
      <div className="p-5 rounded-3xl glass-panel border border-white shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-guard-muted uppercase tracking-wider block">
            Total Analyses
          </span>
          <span className="text-2xl sm:text-3xl font-black text-guard-navy font-sans mt-1 block">
            {total}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            ↑ 12% this week
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-pastel-cyan/60 flex items-center justify-center text-guard-navy">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* Authentic Detected */}
      <div className="p-5 rounded-3xl glass-panel border border-white shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-guard-muted uppercase tracking-wider block">
            Authentic (REAL)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-detect-real font-sans mt-1 block">
            {realCount}
          </span>
          <span className="text-[11px] text-guard-muted mt-1 block">
            {total > 0 ? Math.round((realCount / total) * 100) : 0}% of all media
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-detect-real-bg flex items-center justify-center text-detect-real">
          <ShieldCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Manipulated Detected */}
      <div className="p-5 rounded-3xl glass-panel border border-white shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-guard-muted uppercase tracking-wider block">
            Manipulated (FAKE)
          </span>
          <span className="text-2xl sm:text-3xl font-black text-detect-fake font-sans mt-1 block">
            {fakeCount}
          </span>
          <span className="text-[11px] text-guard-muted mt-1 block">
            {total > 0 ? Math.round((fakeCount / total) * 100) : 0}% flagged content
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-detect-fake-bg flex items-center justify-center text-detect-fake">
          <AlertOctagon className="w-6 h-6" />
        </div>
      </div>

      {/* Average Confidence */}
      <div className="p-5 rounded-3xl glass-panel border border-white shadow-soft flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-guard-muted uppercase tracking-wider block">
            Average Confidence
          </span>
          <span className="text-2xl sm:text-3xl font-black text-guard-navy font-sans mt-1 block">
            {avgConfidence}%
          </span>
          <span className="text-[11px] text-guard-muted mt-1 block font-mono">
            ViT-B/16 Self-Attention
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-pastel-yellow/50 flex items-center justify-center text-guard-navy">
          <Percent className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
