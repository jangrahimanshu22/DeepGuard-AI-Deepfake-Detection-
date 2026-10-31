import React from 'react';
import { Shield, Code2, FileCode2, Lock, HelpCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-white border-t border-guard-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigateTab('home')}>
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-guard-border/80 bg-white shadow-sm flex items-center justify-center shrink-0 p-0.5">
                <img src="/logo.png" alt="DeepGuard AI Logo" className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className="font-extrabold text-lg text-guard-navy font-sans tracking-tight">
                DeepGuard<span className="text-pastel-rose">AI</span>
              </span>
            </div>

            <p className="text-xs text-guard-muted mt-3 max-w-sm leading-relaxed">
              AI-assisted media authenticity analysis using Vision Transformers (ViT) with patch self-attention, Grad-CAM, and spatiotemporal sequence validation.
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-guard-muted">
              <span className="w-2 h-2 rounded-full bg-detect-real" />
              <span>Forensic Engine v2.3.1 Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-guard-slate">
              <li>
                <button onClick={() => onNavigateTab('detect')} className="hover:text-pastel-rose transition-colors">
                  Analyze Media
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('history')} className="hover:text-pastel-rose transition-colors">
                  Detection History
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-pastel-rose transition-colors">
                  Analytics Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('how-it-works')} className="hover:text-pastel-rose transition-colors">
                  ViT Architecture & XAI
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-3">
              Governance & Resources
            </h4>
            <ul className="space-y-2 text-xs text-guard-slate">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-guard-muted" />
                <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Zero-Retention Policy: Uploaded media is processed in isolated RAM and purged after inference."); }} className="hover:text-pastel-rose transition-colors">
                  Privacy & Zero-Retention
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <FileCode2 className="w-3 h-3 text-guard-muted" />
                <a href="#docs" onClick={(e) => { e.preventDefault(); onNavigateTab('how-it-works'); }} className="hover:text-pastel-rose transition-colors">
                  ViT Model Documentation
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Code2 className="w-3 h-3 text-guard-muted" />
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-pastel-rose transition-colors inline-flex items-center gap-1">
                  GitHub Repository <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-guard-muted" />
                <a href="#contact" onClick={(e) => { e.preventDefault(); alert("DeepGuard AI Research Team: Contact for enterprise ViT API integration."); }} className="hover:text-pastel-rose transition-colors">
                  Research Contact
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-guard-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-guard-muted gap-2">
          <p>© {new Date().getFullYear()} DeepGuard AI. Built for Responsible Media Verification.</p>
          <p className="font-mono text-[11px]">Powered by PyTorch & Vision Transformer (ViT-B/16)</p>
        </div>
      </div>
    </footer>
  );
};
