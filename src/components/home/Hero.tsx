import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Sparkles, Scan, Eye, Activity, Layers, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onAnalyzeClick: () => void;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onHowItWorksClick }) => {
  const [activeToken, setActiveToken] = useState<number | null>(44);

  // Generate 64 tokens representing the ViT 16x16 patch embeddings
  const tokenIndices = Array.from({ length: 64 }, (_, i) => i);
  // Specific tokens that highlight face boundaries / eyes
  const attentionTokens = [18, 19, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37, 42, 43, 44, 45];

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-mesh-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-pastel-blue/60 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-detect-real animate-pulse" />
              <span className="text-xs font-semibold text-guard-slate tracking-wide">
                Forensic-Grade Media Authenticity
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pastel-yellow text-guard-navy">
                ViT-B/16
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-guard-navy font-sans leading-[1.12]">
              Know What's <span className="underline decoration-pastel-rose decoration-4 underline-offset-8">Real.</span>
            </h1>

            {/* Supporting Line */}
            <p className="mt-6 text-base sm:text-lg text-guard-muted font-normal max-w-2xl leading-relaxed">
              AI-powered deepfake detection using Vision Transformers to analyze images and videos for subtle signs of synthetic manipulation, boundary blending, and facial artifacts.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onAnalyzeClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-guard-navy text-white text-sm font-semibold shadow-soft-lg hover:shadow-soft-xl hover:bg-guard-midnight transition-all duration-200 flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4 text-pastel-yellow" />
                Analyze Media
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onHowItWorksClick}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-guard-navy text-sm font-semibold border border-guard-border hover:border-pastel-blue shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
              >
                See How It Works
              </button>
            </div>

            {/* Micro Trust Stats */}
            <div className="mt-12 pt-8 border-t border-guard-border/80 grid grid-cols-3 gap-6 sm:gap-10">
              <div>
                <p className="text-2xl font-extrabold text-guard-navy">99.2%</p>
                <p className="text-xs text-guard-muted mt-0.5">ViT Accuracy on DFDC</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-guard-navy">196</p>
                <p className="text-xs text-guard-muted mt-0.5">Patches / Frame</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-guard-navy">&lt;180ms</p>
                <p className="text-xs text-guard-muted mt-0.5">Inference Latency</p>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Abstract AI Forensic Scanning Panel */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Glow backing */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pastel-blush/60 via-pastel-cyan/50 to-pastel-yellow/40 rounded-[2.5rem] blur-2xl opacity-70 -z-10" />

            {/* Forensic Inspection Glass Card */}
            <div className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-soft-xl border border-white/90 relative">
              
              {/* Header Status Strip */}
              <div className="flex items-center justify-between pb-4 border-b border-guard-border/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-pastel-cyan/70 flex items-center justify-center text-guard-navy">
                    <Scan className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-guard-navy tracking-wide uppercase">
                      Live Forensic Stream
                    </h3>
                    <p className="text-[10px] text-guard-muted font-mono">ViT-B/16 Self-Attention</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-detect-real-bg border border-detect-real-border text-detect-real text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-detect-real animate-ping" />
                  ANALYSIS READY
                </div>
              </div>

              {/* Central Abstract Face Mesh & ViT Patch Grid */}
              <div className="relative mt-4 aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center border border-slate-800">
                
                {/* Background Face Subject Simulation */}
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80" 
                  alt="Forensic Scanning Target"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity filter contrast-125"
                />

                {/* Subdued Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-guard-midnight/90 via-guard-navy/30 to-guard-midnight/50" />

                {/* ViT 8x8 Visual Token Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 p-3 gap-1 z-10 pointer-events-auto">
                  {tokenIndices.map((idx) => {
                    const isAttention = attentionTokens.includes(idx);
                    const isSelected = activeToken === idx;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setActiveToken(idx)}
                        className={`transition-all duration-200 rounded-sm cursor-crosshair relative border ${
                          isSelected
                            ? 'bg-pastel-yellow/70 border-white shadow-md ring-2 ring-pastel-rose'
                            : isAttention
                            ? 'bg-pastel-rose/30 border-pastel-rose/70 hover:bg-pastel-rose/50'
                            : 'border-white/10 hover:border-white/40 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-guard-midnight text-white text-[8px] font-mono px-1 rounded shadow pointer-events-none">
                            T#{idx}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Subtle Moving Laser Scan Bar */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-pastel-cyan to-transparent shadow-[0_0_12px_#BAD6DA] animate-scan z-20 pointer-events-none" />

                {/* Bounding Box on Facial Region */}
                <div className="absolute inset-8 rounded-xl border border-pastel-cyan/80 pointer-events-none z-10 flex flex-col justify-between p-2">
                  <div className="flex justify-between items-center text-[9px] font-mono text-pastel-cyan">
                    <span>ROI: FACE_01</span>
                    <span>CONF: 99.4%</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-pastel-cyan">
                    <span>16x16 PATCHES</span>
                    <span>ROLLOUT: OK</span>
                  </div>
                </div>
              </div>

              {/* Bottom Metrics Bar */}
              <div className="mt-4 pt-3 border-t border-guard-border/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-detect-real-bg border border-detect-real-border flex items-center justify-center text-detect-real">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-guard-muted block">Authenticity Index</span>
                    <span className="text-sm font-extrabold text-detect-real">REAL — 94.7%</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-guard-muted uppercase font-bold block">Risk Level</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Low Risk
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
