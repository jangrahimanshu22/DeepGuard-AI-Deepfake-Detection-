import React from 'react';
import { UploadCloud, Cpu, ShieldCheck, ArrowRight, Layers, Eye, CheckCircle2, ChevronRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      desc: 'Upload an image or video file. The system performs cryptographic hash checks and sanitizes the stream in memory.',
      icon: UploadCloud,
      color: 'bg-pastel-cyan/60 text-guard-navy',
      badge: 'Secure Ingestion',
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'The Vision Transformer (ViT-B/16) slices the facial region into 16x16 pixel patch tokens, calculating multi-head self-attention across spatial dimensions.',
      icon: Cpu,
      color: 'bg-pastel-yellow/50 text-guard-navy',
      badge: 'ViT Self-Attention',
    },
    {
      num: '03',
      title: 'Detect',
      desc: 'The system outputs an authoritative Real/Fake prediction accompanied by Grad-CAM gradient heatmaps and Attention Rollout forensic evidence.',
      icon: ShieldCheck,
      color: 'bg-pastel-blush text-guard-navy',
      badge: 'Explainable Verdict',
    },
  ];

  const pipelineNodes = [
    { label: 'Input Media', sub: 'JPG / MP4' },
    { label: 'Face Detection', sub: 'Landmarks' },
    { label: 'Preprocessing', sub: '16x16 Patches' },
    { label: 'ViT Transformer', sub: '12 Attention Heads' },
    { label: 'Classification', sub: 'Explicit Mapping' },
    { label: 'Explainability', sub: 'Grad-CAM' },
    { label: 'Authoritative Result', sub: 'REAL / FAKE' },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-yellow/60 border border-pastel-yellow text-guard-navy text-xs font-bold mb-4">
          Pipeline Architecture
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-guard-navy tracking-tight">
          How Vision Transformer Detects Deepfakes
        </h2>
        <p className="text-sm sm:text-base text-guard-muted mt-3 leading-relaxed">
          Unlike standard CNNs that only inspect local textures, Vision Transformers analyze long-range semantic relationships and patch-to-patch inconsistencies across the entire face.
        </p>
      </div>

      {/* 3 Steps Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="rounded-3xl glass-panel p-8 border border-white shadow-soft relative flex flex-col justify-between group hover:-translate-y-1 transition-transform duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black font-mono text-guard-navy/30 group-hover:text-guard-navy transition-colors">
                    {st.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white text-guard-slate border border-guard-border shadow-xs">
                    {st.badge}
                  </span>
                </div>

                <div className={`w-12 h-12 rounded-2xl ${st.color} flex items-center justify-center mb-5 shadow-xs`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-guard-navy mb-2">{st.title}</h3>
                <p className="text-xs text-guard-muted leading-relaxed">{st.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-guard-border/70 flex items-center gap-1 text-[11px] font-semibold text-guard-slate">
                <span>Phase {idx + 1} Execution</span>
                <ChevronRight className="w-3.5 h-3.5 text-pastel-rose" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture Flow Graphic */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 border border-guard-border shadow-soft">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-guard-border">
          <div>
            <h3 className="text-xs font-bold text-guard-navy uppercase tracking-wider">
              Technical Architecture Flowchart
            </h3>
            <p className="text-[11px] text-guard-muted mt-0.5">End-to-end forensic inference pipeline</p>
          </div>
          <span className="text-xs font-mono font-bold text-guard-slate bg-guard-softbg px-3 py-1 rounded-xl border border-guard-border">
            PyTorch • ViT-B/16
          </span>
        </div>

        {/* Responsive Pipeline Nodes Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 relative">
          {pipelineNodes.map((node, i) => (
            <div
              key={i}
              className="relative p-3.5 rounded-2xl bg-white border border-guard-border shadow-xs flex flex-col justify-center text-center group hover:border-pastel-blue transition-colors"
            >
              <span className="text-[10px] font-mono text-guard-muted block">0{i + 1}</span>
              <span className="text-xs font-bold text-guard-navy mt-1 block truncate">
                {node.label}
              </span>
              <span className="text-[10px] text-pastel-rose font-medium mt-0.5 block truncate">
                {node.sub}
              </span>

              {/* Arrow to next node (hidden on last) */}
              {i < pipelineNodes.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-guard-softbg border border-guard-border items-center justify-center text-guard-muted">
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
