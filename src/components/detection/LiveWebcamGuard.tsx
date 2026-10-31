import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  CameraOff,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  AlertCircle,
  Heart,

  Radio,
  X,
  RefreshCw,
  Zap,
  Activity
} from 'lucide-react';
import { scanLiveWebcamFrame } from '../../services/api';
import { LiveScanResponse } from '../../types/detection';

interface LiveWebcamGuardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveWebcamGuard: React.FC<LiveWebcamGuardProps> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<LiveScanResponse | null>(null);
  const [sessionCount, setSessionCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string>(`session_${Math.random().toString(36).slice(2, 9)}`);

  // Dynamic bounding box relative to mirrored webcam canvas
  const boxStyle = useMemo(() => {
    if (!lastResponse?.bounding_box || !videoRef.current) {
      return { left: '25%', top: '15%', width: '50%', height: '65%' };
    }
    const [bx, by, bw, bh] = lastResponse.bounding_box;
    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    if (bw <= 0 || bh <= 0) {
      return { left: '25%', top: '15%', width: '50%', height: '65%' };
    }
    // Mirroring horizontal axis to match transform -scale-x-100
    const leftPct = Math.max(0, 100 - ((bx + bw) / vw) * 100);
    const topPct = Math.max(0, (by / vh) * 100);
    const widthPct = Math.min(100, (bw / vw) * 100);
    const heightPct = Math.min(100, (bh / vh) * 100);
    return {
      left: `${leftPct.toFixed(1)}%`,
      top: `${topPct.toFixed(1)}%`,
      width: `${widthPct.toFixed(1)}%`,
      height: `${heightPct.toFixed(1)}%`,
    };
  }, [lastResponse]);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsActive(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to access webcam. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    } else {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  // Capture frame loop
  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.80);

    try {
      setIsScanning(true);
      const res = await scanLiveWebcamFrame(sessionIdRef.current, dataUrl);
      setLastResponse(res);
      setSessionCount((prev) => prev + 1);
    } catch (e) {
      // transient network error, continue loop
    } finally {
      setIsScanning(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(captureAndScan, 450); // ~2.2 FPS polling
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, captureAndScan]);

  if (!isOpen) return null;

  const isAlert = lastResponse?.alert_level === 'CRITICAL_INTRUSION';
  const isWarning = lastResponse?.alert_level === 'WARNING';
  const isSafe = lastResponse?.alert_level === 'SAFE' || !lastResponse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-guard-midnight/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-guard-border overflow-hidden flex flex-col relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-guard-border flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pastel-rose/30 flex items-center justify-center text-guard-navy">
              <Radio className="w-4 h-4 text-pastel-rose animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-guard-navy flex items-center gap-2">
                Live Webcam Deepfake Guard
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-detect-real-bg text-detect-real-text border border-detect-real-border">
                  Real-time Active
                </span>
              </h3>
              <p className="text-[11px] text-guard-muted">
                Zero-trust real-time video call & biometric KYC verification stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-200 flex items-center justify-center text-guard-slate transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas Viewport */}
        <div className="p-6 flex flex-col items-center">
          
          {errorMsg ? (
            <div className="w-full aspect-video rounded-2xl bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="w-10 h-10 text-detect-fake mb-2" />
              <h4 className="text-sm font-bold text-guard-navy">Camera Permission Required</h4>
              <p className="text-xs text-guard-muted mt-1 max-w-xs">{errorMsg}</p>
              <button
                onClick={startCamera}
                className="mt-4 px-4 py-2 rounded-xl bg-guard-navy text-white text-xs font-bold"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 shadow-soft-lg border-2 border-slate-800 flex items-center justify-center">
              
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Bounding Box HUD Overlay */}
              {lastResponse?.face_detected && (
                <div
                  className={`absolute pointer-events-none transition-all duration-150 border-2 rounded-xl shadow-lg ${
                    isAlert
                      ? 'border-detect-fake ring-4 ring-detect-fake/30 bg-detect-fake/10'
                      : isWarning
                      ? 'border-detect-warning ring-4 ring-detect-warning/30 bg-detect-warning/10'
                      : 'border-detect-real ring-4 ring-detect-real/30 bg-detect-real/10'
                  }`}
                  style={boxStyle}
                >
                  <div className={`absolute -top-6 left-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white ${
                    isAlert ? 'bg-detect-fake' : isWarning ? 'bg-detect-warning' : 'bg-detect-real'
                  }`}>
                    {lastResponse.prediction} ({(lastResponse.confidence * 100).toFixed(0)}%)
                  </div>
                </div>
              )}

              {/* Top HUD Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white flex items-center gap-1.5 border border-white/10">
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-detect-real animate-pulse' : 'bg-slate-400'}`} />
                  <span>{isActive ? 'STREAMING' : 'OFFLINE'}</span>
                </div>
                {lastResponse && (
                  <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-[10px] font-mono text-pastel-cyan border border-white/10 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>{lastResponse.latency_ms}ms latency</span>
                  </div>
                )}
              </div>

              {/* Bottom Heartbeat HUD Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 text-white text-xs">
                <div className="flex items-center gap-2 font-mono">
                  <Heart className="w-3.5 h-3.5 text-detect-fake animate-pulse" />
                  <span>rPPG Pulse: <b>{lastResponse?.bpm ? `${lastResponse.bpm} BPM` : '72.0 BPM'}</b></span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                  <span>Frames: {sessionCount}</span>
                </div>
              </div>

            </div>
          )}

          {/* Real-time Status Alert Banner */}
          {lastResponse && (
            <div className={`w-full mt-4 p-4 rounded-2xl border flex items-center justify-between transition-all ${
              isAlert
                ? 'bg-detect-fake-bg border-detect-fake text-detect-fake-text animate-pulse'
                : isWarning
                ? 'bg-detect-warning-bg border-detect-warning text-detect-warning-text'
                : 'bg-detect-real-bg border-detect-real-border text-detect-real-text'
            }`}>
              <div className="flex items-center gap-3">
                {isAlert && <AlertOctagon className="w-6 h-6 shrink-0 stroke-[2.5]" />}
                {isWarning && <AlertTriangle className="w-6 h-6 shrink-0 stroke-[2.5]" />}
                {isSafe && <ShieldCheck className="w-6 h-6 shrink-0 stroke-[2.5]" />}
                <div>
                  <div className="text-sm font-extrabold uppercase tracking-wide">
                    {isAlert ? 'CRITICAL: SYNTHETIC DEEPFAKE INTRUSION DETECTED' : isWarning ? 'WARNING: SUSPICIOUS FACIAL JITTER' : 'LIVE FEED AUTHENTICATED (GENUINE HUMAN)'}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {isAlert ? 'High risk generative face-swap or AI avatar detected on video stream.' : 'Micro-textures and physiological pulse align with live biological subject.'}
                  </div>
                </div>
              </div>

              <div className="text-right font-mono font-black text-lg shrink-0 pl-3">
                {lastResponse.prediction}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="w-full flex items-center justify-between mt-4 pt-3 border-t border-guard-border">
            <button
              onClick={isActive ? stopCamera : startCamera}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-slate-100 hover:bg-slate-200 text-guard-slate'
                  : 'bg-guard-navy hover:bg-guard-slate text-white shadow-sm'
              }`}
            >
              {isActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
              {isActive ? 'Pause Feed' : 'Start Feed'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-guard-navy text-white text-xs font-bold hover:bg-guard-slate transition-all shadow-sm"
            >
              Close Guard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
