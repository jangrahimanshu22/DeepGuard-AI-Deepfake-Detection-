import React from 'react';
import { Lock, Cpu, Video, Network } from 'lucide-react';

export const TrustStrip: React.FC = () => {
  const trustFeatures = [
    {
      icon: Lock,
      title: 'Private Analysis',
      subtitle: 'Zero permanent media retention & secure memory processing',
      color: 'bg-pastel-blush/60 text-guard-navy',
      borderColor: 'border-pastel-rose/40',
    },
    {
      icon: Cpu,
      title: 'AI-Powered Detection',
      subtitle: 'Vision Transformer (ViT-B/16) attention architecture',
      color: 'bg-pastel-cyan/70 text-guard-navy',
      borderColor: 'border-pastel-blue/50',
    },
    {
      icon: Video,
      title: 'Image + Video Support',
      subtitle: 'Single image inspection & spatiotemporal multi-frame tracking',
      color: 'bg-pastel-yellow/50 text-guard-navy',
      borderColor: 'border-pastel-yellow',
    },
    {
      icon: Network,
      title: 'Explainable Results',
      subtitle: 'Grad-CAM heatmaps and patch Attention Rollout maps',
      color: 'bg-pastel-lime/40 text-guard-navy',
      borderColor: 'border-pastel-lime',
    },
  ];

  return (
    <section className="py-8 border-y border-guard-border/80 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {trustFeatures.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/80 transition-colors group"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${feat.color} border ${feat.borderColor} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-guard-navy tracking-tight">{feat.title}</h4>
                  <p className="text-xs text-guard-muted leading-tight mt-0.5">{feat.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
