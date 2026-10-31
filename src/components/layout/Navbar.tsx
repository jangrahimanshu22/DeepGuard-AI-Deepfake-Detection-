import React, { useState } from 'react';
import { Shield, Cpu, History, BarChart3, HelpCircle, Sparkles, Sliders, CheckCircle2, ChevronRight, Radio, Key } from 'lucide-react';
import { DEFAULT_VIT_CONFIG } from '../../config/modelConfig';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenLiveWebcam?: () => void;
  onOpenApiKeyModal?: () => void;
  labelMapping: Record<string, string>;
  onUpdateLabelMapping: (mapping: Record<string, string>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenUpload,
  onOpenLiveWebcam,
  onOpenApiKeyModal,
  labelMapping,
  onUpdateLabelMapping,
}) => {

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeMappingKey, setActiveMappingKey] = useState<'standard' | 'inverted'>('standard');

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'detect', label: 'Detect' },
    { id: 'history', label: 'History' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About' },
  ];

  const handleToggleMapping = (mode: 'standard' | 'inverted') => {
    setActiveMappingKey(mode);
    if (mode === 'standard') {
      onUpdateLabelMapping({ '0': 'REAL', '1': 'FAKE' });
    } else {
      // Inverted model index mapping test
      onUpdateLabelMapping({ '0': 'FAKE', '1': 'REAL' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm shadow-guard-navy/10 group-hover:scale-105 transition-transform duration-200 border border-guard-border/80 bg-white/95 flex items-center justify-center p-0.5">
              <img
                src="/logo.png"
                alt="DeepGuard AI Logo"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-guard-navy font-sans">
                  DeepGuard<span className="text-pastel-rose ml-0.5">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-pastel-cyan/60 text-guard-navy/90 border border-pastel-blue/40 tracking-wider">
                  ViT Forensic
                </span>
              </div>
              <span className="text-[11px] text-guard-muted font-medium tracking-wide">
                Vision Transformer Media Authenticity
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/60 border border-guard-border/70 shadow-sm">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-guard-navy text-white shadow-sm'
                      : 'text-guard-slate/80 hover:text-guard-navy hover:bg-slate-100/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Live Webcam Guard Button */}
            {onOpenLiveWebcam && (
              <button
                onClick={onOpenLiveWebcam}
                title="Real-time Live Webcam Deepfake Protection"
                className="px-3 py-2 rounded-xl border border-pastel-rose/60 bg-pastel-blush/40 hover:bg-pastel-blush text-guard-navy transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold"
              >
                <span className="w-2 h-2 rounded-full bg-detect-fake animate-ping" />
                <Radio className="w-3.5 h-3.5 text-pastel-rose" />
                <span className="hidden sm:inline">Live Guard</span>
              </button>
            )}

            {/* Developer API Keys */}
            {onOpenApiKeyModal && (
              <button
                onClick={onOpenApiKeyModal}
                title="Developer API Keys & SDK Integration"
                className="p-2.5 rounded-xl border border-guard-border/80 bg-white/70 hover:bg-white text-guard-slate hover:text-guard-navy hover:border-pastel-blue transition-all shadow-sm flex items-center gap-1.5 text-xs font-medium"
              >
                <Key className="w-4 h-4 text-guard-navy" />
                <span className="hidden lg:inline text-xs text-guard-muted">API Keys</span>
              </button>
            )}

            {/* Model Config & Label Mapping Indicator */}
            <button
              onClick={() => setShowSettingsModal(true)}
              title="Model Label Mapping & Framework Configuration"
              className="p-2.5 rounded-xl border border-guard-border/80 bg-white/70 hover:bg-white text-guard-slate hover:text-guard-navy hover:border-pastel-blue transition-all shadow-sm flex items-center gap-1.5 text-xs font-medium"
            >
              <Sliders className="w-4 h-4 text-guard-navy" />
              <span className="hidden sm:inline text-xs text-guard-muted">Model Config</span>
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenUpload}
              className="relative group overflow-hidden px-4 sm:px-5 py-2.5 rounded-xl bg-guard-navy text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pastel-yellow" />
                Upload Media
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-guard-navy via-guard-slate to-guard-navy opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

        </div>
      </header>

      {/* Settings / Model Mapping Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-guard-midnight/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-soft-xl border border-guard-border relative animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-guard-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pastel-cyan flex items-center justify-center text-guard-navy">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-guard-navy">Model Configuration & Mapping</h3>
                  <p className="text-xs text-guard-muted">Explicit class-index mapping & runtime specifications</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-guard-muted hover:text-guard-navy text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-guard-softbg border border-guard-border/80">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-guard-navy">Active Model</span>
                  <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-guard-border text-guard-slate">
                    {DEFAULT_VIT_CONFIG.modelName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-guard-muted mt-2">
                  <span>Architecture</span>
                  <span className="font-medium text-guard-slate">{DEFAULT_VIT_CONFIG.architecture}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-guard-muted mt-1.5">
                  <span>Patch Size / Heads</span>
                  <span className="font-medium text-guard-slate">16x16 / 12 Multi-Head Attention</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-guard-navy uppercase tracking-wider mb-2">
                  Label Normalization Guarantee
                </label>
                <p className="text-xs text-guard-muted mb-3">
                  DeepGuard AI never hardcodes class indices. Predictions are dynamically normalized using the registered mapping configuration:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleToggleMapping('standard')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      activeMappingKey === 'standard'
                        ? 'border-detect-real bg-detect-real-bg/50 ring-1 ring-detect-real'
                        : 'border-guard-border bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-guard-navy">Standard ViT</span>
                      {activeMappingKey === 'standard' && <CheckCircle2 className="w-3.5 h-3.5 text-detect-real" />}
                    </div>
                    <code className="text-[11px] block font-mono text-guard-muted">0: REAL, 1: FAKE</code>
                  </button>

                  <button
                    onClick={() => handleToggleMapping('inverted')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      activeMappingKey === 'inverted'
                        ? 'border-detect-real bg-detect-real-bg/50 ring-1 ring-detect-real'
                        : 'border-guard-border bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-guard-navy">Inverted Map</span>
                      {activeMappingKey === 'inverted' && <CheckCircle2 className="w-3.5 h-3.5 text-detect-real" />}
                    </div>
                    <code className="text-[11px] block font-mono text-guard-muted">0: FAKE, 1: REAL</code>
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-pastel-yellow/30 border border-pastel-yellow text-xs text-guard-slate">
                <span className="font-bold text-guard-navy block mb-0.5">Zero Index Assumption Active:</span>
                Predictions are translated into authoritative <span className="font-semibold text-detect-real">REAL</span> / <span className="font-semibold text-detect-fake">FAKE</span> states without risk of inverted verdicts.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-guard-navy text-white text-xs font-semibold hover:bg-guard-slate"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
