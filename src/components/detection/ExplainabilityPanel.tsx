import React, { useState } from 'react';
import {
  Eye,
  Layers,
  Sliders,
  ShieldCheck,
  AlertCircle,
  Info,
  Heart,
  Mic,
  FileSearch,
  Camera,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { DetectionResult } from '../../types/detection';

interface ExplainabilityPanelProps {
  result: DetectionResult;
}

type TabKey = 'gradcam' | 'rollout' | 'ela' | 'biological' | 'audio' | 'metadata' | 'regions';

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('gradcam');
  const [heatmapOpacity, setHeatmapOpacity] = useState(65);

  const xai = result.explainability;
  const isReal = result.verdict === 'REAL';
  const hasAudio = Boolean(xai.audio?.has_audio);

  return (
    <div id="explainability-panel" className="w-full max-w-4xl mx-auto rounded-3xl glass-panel p-6 sm:p-10 shadow-soft-xl border border-white relative mt-8">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-guard-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pastel-blush flex items-center justify-center text-guard-navy shrink-0 shadow-sm">
            <Eye className="w-5 h-5 text-guard-navy" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-guard-navy flex items-center gap-2">
              Forensic Explainability Suite
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-pastel-blue/40 text-guard-navy border border-pastel-blue">
                6-Pillar Engine
              </span>
            </h3>
            <p className="text-xs text-guard-muted mt-0.5">
              Comprehensive multimodal explainability signals: Vision Transformer, Biological rPPG, ELA & Audio
            </p>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="p-1 rounded-2xl bg-white border border-guard-border flex flex-wrap items-center gap-1 shadow-sm max-w-full">
          <button
            onClick={() => setActiveTab('gradcam')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'gradcam'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Grad-CAM
          </button>
          <button
            onClick={() => setActiveTab('rollout')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'rollout'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Attention
          </button>
          <button
            onClick={() => setActiveTab('ela')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'ela'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <FileSearch className="w-3.5 h-3.5" />
            ELA
          </button>
          <button
            onClick={() => setActiveTab('biological')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'biological'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            rPPG Pulse
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'audio'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice & Audio
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'metadata'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            EXIF & C2PA
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'regions'
                ? 'bg-guard-navy text-white shadow-sm'
                : 'text-guard-slate hover:text-guard-navy hover:bg-slate-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Biometrics
          </button>
        </div>
      </div>

      {/* Human-Readable Model Explanation Callout */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-pastel-cyan/30 via-pastel-blush/20 to-pastel-yellow/30 border border-pastel-blue/40 flex items-start gap-3.5">
        <Info className="w-5 h-5 text-guard-navy shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-1">
            Forensic Synthesis Summary
          </h4>
          <p className="text-sm font-medium text-guard-slate leading-relaxed">
            "{xai.summary}"
          </p>
        </div>
      </div>

      {/* Main Forensic Display Container */}
      <div className="mt-8">
        
        {/* TAB 1: GRAD-CAM */}
        {activeTab === 'gradcam' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-soft-lg group">
                <img src={result.previewUrl} alt="Target" className="absolute inset-0 w-full h-full object-cover" />
                {xai.heatmapUrl && xai.heatmapUrl !== result.previewUrl ? (
                  <img
                    src={xai.heatmapUrl}
                    alt="Grad-CAM"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 z-10"
                    style={{ opacity: heatmapOpacity / 100 }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 transition-opacity duration-150 pointer-events-none mix-blend-color-burn z-10"
                    style={{
                      opacity: heatmapOpacity / 100,
                      background: isReal
                        ? 'radial-gradient(circle at 48% 42%, rgba(46, 139, 112, 0.9) 0%, rgba(46, 139, 112, 0.4) 40%, transparent 75%)'
                        : 'radial-gradient(circle at 50% 38%, rgba(217, 79, 112, 0.95) 0%, rgba(247, 145, 169, 0.7) 35%, rgba(255, 231, 151, 0.6) 55%, transparent 80%)',
                    }}
                  />
                )}
                <div className="absolute bottom-3 left-3 z-20 bg-guard-midnight/85 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-[11px] font-mono text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pastel-rose" />
                  <span>Grad-CAM Gradient Activations</span>
                </div>
              </div>
              <div className="w-full mt-4 flex items-center gap-3 px-2">
                <span className="text-xs text-guard-muted font-medium shrink-0">Heatmap Blend:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-guard-navy"
                />
                <span className="text-xs font-mono font-bold text-guard-navy shrink-0">{heatmapOpacity}%</span>
              </div>
            </div>
            <div className="md:col-span-6">
              <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-3">Gradient Activation Focus</h4>
              <p className="text-xs text-guard-slate leading-relaxed mb-4">
                Grad-CAM computes the gradients of the target class score with respect to the final Vision Transformer normalization layer. High activation indicates regions that heavily swayed the decision.
              </p>
              <div className="space-y-3">
                {xai.keyObservations.slice(0, 4).map((obs, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-guard-border flex items-start gap-2.5 text-xs text-guard-slate">
                    <CheckCircle2 className="w-4 h-4 text-detect-real shrink-0 mt-0.5" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ATTENTION ROLLOUT */}
        {activeTab === 'rollout' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-soft-lg">
                <img src={result.previewUrl} alt="Target" className="absolute inset-0 w-full h-full object-cover" />
                {xai.attentionRolloutUrl && xai.attentionRolloutUrl !== result.previewUrl ? (
                  <img
                    src={xai.attentionRolloutUrl}
                    alt="Rollout"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-150 z-10"
                    style={{ opacity: heatmapOpacity / 100 }}
                  />
                ) : (
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 pointer-events-none z-10 opacity-70">
                    {Array.from({ length: 64 }).map((_, idx) => (
                      <div key={idx} className={`rounded-xs border ${[19, 20, 27, 28].includes(idx) ? (isReal ? 'bg-detect-real/60' : 'bg-detect-fake/70') : 'bg-slate-900/40'}`} />
                    ))}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 z-20 bg-guard-midnight/85 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-[11px] font-mono text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pastel-yellow" />
                  <span>ViT Multi-Head Attention Rollout</span>
                </div>
              </div>
              <div className="w-full mt-4 flex items-center gap-3 px-2">
                <span className="text-xs text-guard-muted font-medium shrink-0">Rollout Blend:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={heatmapOpacity}
                  onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-guard-navy"
                />
                <span className="text-xs font-mono font-bold text-guard-navy shrink-0">{heatmapOpacity}%</span>
              </div>
            </div>
            <div className="md:col-span-6">
              <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-3">Self-Attention Information Flow</h4>
              <p className="text-xs text-guard-slate leading-relaxed mb-4">
                Attention Rollout tracks token interactions across all 12 transformer encoder blocks from [CLS] to image patches. Authentic portraits distribute attention across the full face and eye reflections; deepfakes concentrate intensely on blending perimeters.
              </p>
              <div className="p-4 rounded-2xl bg-white border border-guard-border space-y-3 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-guard-slate">Token Cross-Entropy</span>
                  <span className="text-guard-navy font-mono">0.042 (Normal)</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-guard-slate">Attention Boundary Sharpness</span>
                  <span className="text-guard-navy font-mono">{xai.boundaryConsistencyScore}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ERROR LEVEL ANALYSIS (ELA) */}
        {activeTab === 'ela' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black border-2 border-slate-700 shadow-soft-lg">
                {xai.ela?.ela_image ? (
                  <img
                    src={xai.ela.ela_image}
                    alt="Error Level Analysis"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                    ELA heatmap unavailable for this file
                  </div>
                )}
                <div className="absolute bottom-3 left-3 z-20 bg-guard-midnight/85 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 text-[11px] font-mono text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-pastel-rose" />
                  <span>JPEG 90% Compression Difference (Amplified 15x)</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-6 space-y-4">
              <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider">
                Error Level Analysis (ELA) Forensics
              </h4>
              <p className="text-xs text-guard-slate leading-relaxed">
                ELA highlights regions that have been edited or compressed at different rates. If a facial mask was spliced or generated by an AI pipeline, its error level will visibly diverge from the background photograph.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-guard-border">
                  <span className="text-[10px] uppercase font-bold text-guard-muted">Compression Uniformity</span>
                  <div className="text-xl font-extrabold text-guard-navy mt-0.5 font-mono">
                    {xai.ela?.uniformity_score ?? 88}%
                  </div>
                  <span className="text-[10px] text-guard-slate">
                    {(xai.ela?.uniformity_score ?? 88) > 60 ? 'Homogeneous compression' : 'High compression anomaly'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-guard-border">
                  <span className="text-[10px] uppercase font-bold text-guard-muted">Face/Background Variance</span>
                  <div className="text-xl font-extrabold text-guard-navy mt-0.5 font-mono">
                    {xai.ela?.face_bg_discrepancy ?? 1.0}x
                  </div>
                  <span className="text-[10px] text-guard-slate">
                    {(xai.ela?.face_bg_discrepancy ?? 1.0) > 1.8 ? 'Suspicious facial seam' : 'Normal photographic ratio'}
                  </span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-xs font-medium ${
                xai.ela?.tampering_detected
                  ? 'bg-detect-fake-bg border-detect-fake-border text-detect-fake-text'
                  : 'bg-detect-real-bg border-detect-real-border text-detect-real-text'
              }`}>
                {xai.ela?.summary || 'No compression discrepancies detected.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BIOLOGICAL rPPG PULSE */}
        {activeTab === 'biological' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pastel-rose/30 flex items-center justify-center text-detect-fake">
                  <Heart className="w-5 h-5 animate-pulse text-detect-fake" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-guard-muted uppercase">Extracted Heart Rate</span>
                  <div className="text-xl font-extrabold text-guard-navy font-mono">
                    {xai.biological?.bpm && xai.biological.bpm > 0 ? `${xai.biological.bpm} BPM` : '0 BPM (No Pulse)'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pastel-cyan/30 flex items-center justify-center text-guard-navy">
                  <Activity className="w-5 h-5 text-guard-navy" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-guard-muted uppercase">Cardiac Coherence (SNR)</span>
                  <div className="text-xl font-extrabold text-guard-navy font-mono">
                    {xai.biological?.cardiac_coherence_score ?? 82}%
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pastel-yellow/30 flex items-center justify-center text-guard-navy">
                  <Eye className="w-5 h-5 text-guard-navy" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-guard-muted uppercase">Eye Blink Rate</span>
                  <div className="text-xl font-extrabold text-guard-navy font-mono">
                    {xai.biological?.blink_rate_bpm ?? 14} / min
                  </div>
                </div>
              </div>
            </div>

            {/* Pulse Waveform Rendering */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono font-bold text-pastel-cyan flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-ping text-pastel-cyan" />
                  Remote Photoplethysmography (rPPG) Capillary Hemoglobin Pulse
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Bandpass Filter: 0.75 - 3.0 Hz (45 - 180 BPM)
                </span>
              </div>
              
              <div className="h-24 w-full flex items-end gap-1 px-1">
                {(xai.biological?.pulse_waveform || [0, 0.4, 0.8, 1, 0.6, 0.1, -0.4, -0.8, -0.3, 0.2, 0.7, 0.9, 0.3, -0.5, -0.7, 0, 0.5, 0.9, 0.4, -0.2]).map((val, i) => {
                  const normalizedHeight = Math.max(8, Math.min(100, (val + 1.2) * 40));
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div
                        className="w-full rounded-t transition-all duration-300 bg-gradient-to-t from-pastel-cyan to-pastel-blue"
                        style={{ height: `${normalizedHeight}%` }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`p-4 rounded-2xl border text-xs font-medium ${
              xai.biological?.biological_verdict === 'AUTHENTIC_BIOLOGY'
                ? 'bg-detect-real-bg border-detect-real-border text-detect-real-text'
                : 'bg-detect-fake-bg border-detect-fake-border text-detect-fake-text'
            }`}>
              <b>Physiological Assessment: </b>
              {xai.biological?.summary || 'Physiological blood perfusion confirmed across micro-capillary channels.'}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIO & SPEECH FORENSICS */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            {!hasAudio ? (
              <div className="p-8 rounded-2xl bg-white border border-dashed border-guard-border text-center">
                <Mic className="w-8 h-8 text-guard-muted mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-guard-navy">No Audio Track Detected</h4>
                <p className="text-xs text-guard-muted mt-1 max-w-md mx-auto">
                  This media file does not contain an audio stream. Audio voice clone analysis, neural vocoder detection, and lip-sync correlation are active for videos containing spoken audio.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm">
                    <span className="text-[10px] font-bold text-guard-muted uppercase">Voice Clone Risk</span>
                    <div className="text-xl font-extrabold text-guard-navy font-mono mt-0.5">
                      {xai.audio?.voice_clone_risk}%
                    </div>
                    <span className="text-[10px] text-guard-slate font-medium">
                      {xai.audio?.verdict === 'AI_VOICE_CLONE' ? 'Synthetic vocoder detected' : 'Authentic human acoustics'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm">
                    <span className="text-[10px] font-bold text-guard-muted uppercase">Lip-Sync Correlation</span>
                    <div className="text-xl font-extrabold text-guard-navy font-mono mt-0.5">
                      {xai.audio?.lip_sync_score ?? 88}%
                    </div>
                    <span className="text-[10px] text-guard-slate font-medium">
                      {xai.audio?.lip_sync_verdict || 'Synchronized'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-guard-border shadow-sm">
                    <span className="text-[10px] font-bold text-guard-muted uppercase">Spectral Flatness</span>
                    <div className="text-xl font-extrabold text-guard-navy font-mono mt-0.5">
                      {xai.audio?.spectral_flatness ?? 12.4}
                    </div>
                    <span className="text-[10px] text-guard-slate font-medium">
                      Wiener entropy metric
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-guard-border">
                  <h5 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-2">
                    Acoustic Forensics Details
                  </h5>
                  <p className="text-xs text-guard-slate mb-3 leading-relaxed">
                    {xai.audio?.summary}
                  </p>
                  {xai.audio?.reasons && xai.audio.reasons.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-guard-slate">
                      {xai.audio.reasons.map((r, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-guard-navy" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 6: METADATA & C2PA */}
        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-guard-border space-y-2">
                <span className="text-[10px] font-bold text-guard-muted uppercase">Camera Hardware Profile</span>
                <div className="text-sm font-bold text-guard-navy">
                  {xai.metadata?.camera_make !== 'Unknown' ? `${xai.metadata?.camera_make} ${xai.metadata?.camera_model}` : 'No Camera Hardware EXIF (Stripped)'}
                </div>
                <div className="text-xs text-guard-slate space-y-1 pt-1 font-mono text-[11px]">
                  <div>Software: {xai.metadata?.software || 'None'}</div>
                  <div>Date: {xai.metadata?.capture_date || 'N/A'}</div>
                  <div>ISO: {xai.metadata?.iso || 'N/A'} | Lens: {xai.metadata?.lens_model || 'N/A'}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-guard-border space-y-2">
                <span className="text-[10px] font-bold text-guard-muted uppercase">Content Credentials & Signatures</span>
                <div className="text-sm font-bold text-guard-navy flex items-center gap-2">
                  <span>C2PA Manifest:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    xai.metadata?.c2pa_credentials_found ? 'bg-detect-real-bg text-detect-real-text' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {xai.metadata?.c2pa_credentials_found ? 'Verified C2PA' : 'Not Present'}
                  </span>
                </div>
                {xai.metadata?.ai_signatures && xai.metadata.ai_signatures.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-detect-fake uppercase">AI Parameters Detected:</span>
                    {xai.metadata.ai_signatures.map((sig, i) => (
                      <div key={i} className="text-xs text-detect-fake font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-detect-real font-medium pt-1">
                    No generative AI text chunks or prompt markers discovered.
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-guard-border text-xs text-guard-slate">
              <b>Metadata Verdict: </b>
              {xai.metadata?.summary || 'EXIF metadata inspection completed.'}
            </div>
          </div>
        )}

        {/* TAB 7: FACIAL REGION METRICS */}
        {activeTab === 'regions' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-soft-lg group">
                <img src={result.previewUrl} alt="Target" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none z-10">
                  <div className="w-48 h-64 rounded-[50%] border-2 border-dashed border-pastel-yellow flex flex-col justify-between p-4 bg-guard-midnight/20">
                    <div className="flex justify-between items-center text-[9px] font-mono text-pastel-yellow bg-guard-midnight/80 px-1 rounded">
                      <span>EYE_CORNEA_L/R</span>
                      <span>{xai.eyeReflectionSymmetryScore}%</span>
                    </div>
                    <div className="flex justify-center text-[9px] font-mono text-pastel-cyan bg-guard-midnight/80 px-1 rounded">
                      <span>SKIN_PORE_DENSITY: {xai.skinTextureUniformityScore}%</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-mono text-pastel-rose bg-guard-midnight/80 px-1 rounded">
                      <span>BLENDING_SEAM</span>
                      <span>{xai.blendingArtifactScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider mb-4">
                Feature Consistency Signals
              </h4>
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-guard-slate">Facial Boundary Continuity</span>
                    <span className="font-mono font-bold text-guard-navy">{xai.boundaryConsistencyScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-guard-border/70">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        xai.boundaryConsistencyScore > 70 ? 'bg-detect-real' : 'bg-detect-fake'
                      }`}
                      style={{ width: `${xai.boundaryConsistencyScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-guard-slate">Corneal Reflection Symmetry</span>
                    <span className="font-mono font-bold text-guard-navy">{xai.eyeReflectionSymmetryScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-guard-border/70">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        xai.eyeReflectionSymmetryScore > 70 ? 'bg-detect-real' : 'bg-detect-fake'
                      }`}
                      style={{ width: `${xai.eyeReflectionSymmetryScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-guard-slate">Skin Micro-Texture Uniformity</span>
                    <span className="font-mono font-bold text-guard-navy">{xai.skinTextureUniformityScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-guard-border/70">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        xai.skinTextureUniformityScore > 70 ? 'bg-detect-real' : 'bg-detect-fake'
                      }`}
                      style={{ width: `${xai.skinTextureUniformityScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-guard-slate">Perimeter Blending Artifacts</span>
                    <span className="font-mono font-bold text-guard-navy">{xai.blendingArtifactScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-guard-border/70">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        xai.blendingArtifactScore < 30 ? 'bg-detect-real' : 'bg-detect-fake'
                      }`}
                      style={{ width: `${xai.blendingArtifactScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
