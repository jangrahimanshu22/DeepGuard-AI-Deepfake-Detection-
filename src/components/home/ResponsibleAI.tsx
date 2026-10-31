import React from 'react';
import { ShieldCheck, UserCheck, Eye, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const ResponsibleAI: React.FC = () => {
  const principles = [
    {
      icon: Lock,
      title: 'Ephemeral Memory Processing',
      desc: 'All analyzed media is processed in isolated volatile memory and immediately purged post-inference. We do not build biometric face databases.',
    },
    {
      icon: Eye,
      title: 'Explainable AI by Design',
      desc: 'Predictions are never a black box. DeepGuard AI surfaces Grad-CAM gradients and ViT Attention Rollout maps so analysts can verify where the model looked.',
    },
    {
      icon: ShieldCheck,
      title: 'Probabilistic Confidence Scoring',
      desc: 'Instead of binary overconfidence, results provide explicit confidence percentages, posterior probabilities, and flagged frame counts.',
    },
    {
      icon: UserCheck,
      title: 'Human-in-the-Loop Safeguards',
      desc: 'Automated forensic detection should support human judgment, not replace it. We recommend secondary forensic verification for high-impact legal or journalistic decisions.',
    },
  ];

  return (
    <section className="py-16 bg-white/60 border-t border-guard-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-guard-muted uppercase tracking-wider block mb-2">
            Safety & Ethical Commitment
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-guard-navy tracking-tight">
            Built for Responsible Media Verification
          </h2>
          <p className="text-sm text-guard-muted mt-2">
            Providing transparent, explainable forensic intelligence to counter media manipulation with rigorous scientific ethics.
          </p>
        </div>

        {/* 4 Trust Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {principles.map((pr, idx) => {
            const Icon = pr.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl glass-panel border border-guard-border/80 shadow-xs flex items-start gap-4 hover:border-pastel-blue transition-colors"
              >
                <div className="w-11 h-11 rounded-2xl bg-guard-softbg border border-guard-border flex items-center justify-center text-guard-navy shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-guard-navy mb-1">{pr.title}</h3>
                  <p className="text-xs text-guard-muted leading-relaxed">{pr.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scientific Humility & Disclaimer Note */}
        <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-guard-softbg border border-guard-border max-w-4xl mx-auto flex items-center gap-3.5 text-xs text-guard-slate">
          <AlertTriangle className="w-5 h-5 text-pastel-rose shrink-0" />
          <p className="leading-relaxed">
            <span className="font-bold text-guard-navy">Advisory Notice:</span> Deepfake synthesis models and diffusion architectures evolve continuously. DeepGuard AI reports probabilistic attention patterns and should be evaluated alongside contextual provenance and cryptographic watermarking.
          </p>
        </div>

      </div>
    </section>
  );
};
