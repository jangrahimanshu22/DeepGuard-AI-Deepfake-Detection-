import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { TrustStrip } from './components/home/TrustStrip';
import { HowItWorks } from './components/home/HowItWorks';
import { ResponsibleAI } from './components/home/ResponsibleAI';
import { UploadCard } from './components/detection/UploadCard';
import { AnalysisProgress } from './components/detection/AnalysisProgress';
import { ResultCard } from './components/detection/ResultCard';
import { ModelInfoCard } from './components/detection/ModelInfoCard';
import { ExplainabilityPanel } from './components/detection/ExplainabilityPanel';
import { VideoAnalysisTimeline } from './components/detection/VideoAnalysisTimeline';
import { DetectionHistory } from './components/history/DetectionHistory';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';
import { LiveWebcamGuard } from './components/detection/LiveWebcamGuard';
import { ApiKeyModal } from './components/developer/ApiKeyModal';
import { MediaType, DetectionResult } from './types/detection';
import { DEFAULT_VIT_CONFIG } from './config/modelConfig';
import { INITIAL_HISTORY } from './services/sampleData';
import { analyzeMedia } from './services/mockDetectionService';
import {
  checkBackendHealth,
  uploadImageForInference,
  uploadVideoForInference,
  scanMediaUrl,
  fetchBackendHistory,
  SystemHealth,
} from './services/api';
import confetti from 'canvas-confetti';
import { Shield, Sparkles, Cpu, BookOpen, AlertCircle } from 'lucide-react';


export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [labelMapping, setLabelMapping] = useState<Record<string, string>>(DEFAULT_VIT_CONFIG.labelMapping);
  const [historyList, setHistoryList] = useState<DetectionResult[]>(INITIAL_HISTORY);
  const [backendHealth, setBackendHealth] = useState<SystemHealth | null>(null);
  
  // Detection Workflow State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentStageId, setCurrentStageId] = useState<number>(1);
  const [stageName, setStageName] = useState<string>('Initializing');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [frameInfo, setFrameInfo] = useState<string | undefined>();
  const [currentFileMeta, setCurrentFileMeta] = useState<{ name: string; previewUrl: string; mediaType: MediaType } | null>(null);
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(null);
  const [isLiveWebcamOpen, setIsLiveWebcamOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const detectSectionRef = useRef<HTMLDivElement>(null);

  // Check backend health & sync real history on mount
  useEffect(() => {
    async function initSystem() {
      const health = await checkBackendHealth();
      setBackendHealth(health);
      if (health && health.status === 'healthy') {
        const realHistory = await fetchBackendHistory();
        if (realHistory && realHistory.length > 0) {
          setHistoryList(realHistory);
        }
      }
    }
    initSystem();
  }, []);

  // Navigate to Detect and scroll to upload card
  const handleOpenDetect = () => {
    setCurrentTab('detect');
    setTimeout(() => {
      detectSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleScanUrl = async (url: string) => {
    setIsProcessing(true);
    setActiveResult(null);
    setCurrentStageId(1);
    setProgressPercent(20);
    setStageName('Fetching Remote Stream & Computing Hash');
    setFrameInfo('Establishing secure transport stream...');
    setCurrentFileMeta({
      name: url.split('/').pop()?.split('?')[0] || 'remote_web_media',
      previewUrl: url,
      mediaType: url.includes('.mp4') || url.includes('.mov') ? 'video' : 'image',
    });

    try {
      setTimeout(() => {
        setCurrentStageId(2);
        setProgressPercent(45);
        setStageName('Multi-Face & Spatiotemporal Analysis');
      }, 400);

      setTimeout(() => {
        setCurrentStageId(3);
        setProgressPercent(75);
        setStageName('Dual-Stream Vision Transformer Pass');
      }, 800);

      const result = await scanMediaUrl(url);
      setCurrentStageId(5);
      setProgressPercent(100);
      setStageName('Forensic Verification Complete');
      setActiveResult(result);
      setHistoryList((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);

      if (result.verdict === 'REAL') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#2E8B70', '#E0F2F4', '#BAD6DA'],
        });
      }
    } catch (err: any) {
      alert(err.message || 'URL inspection failed. Please check URL accessibility.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartAnalysis = async (

    file: File | { name: string; size: number; type: string; previewUrl: string },
    mediaType: MediaType
  ) => {
    // Setup preview
    let previewUrl = '';
    if ('previewUrl' in file && file.previewUrl) {
      previewUrl = file.previewUrl;
    } else if (file instanceof File) {
      previewUrl = URL.createObjectURL(file);
    }

    setCurrentFileMeta({
      name: file.name,
      previewUrl,
      mediaType,
    });

    setIsProcessing(true);
    setActiveResult(null);
    setCurrentStageId(1);
    setProgressPercent(15);
    setStageName('Uploading Media & Checking Integrity');

    try {
      let result: DetectionResult;

      // If user uploaded a real file and backend is available
      if (file instanceof File) {
        // Stage 2: Face Detection
        setTimeout(() => {
          setCurrentStageId(2);
          setProgressPercent(35);
          setStageName('Detecting Face & Extracting ROI');
          setFrameInfo('Locating facial bounding boxes...');
        }, 300);

        // Stage 3 & 4: Model Inference
        setTimeout(() => {
          setCurrentStageId(3);
          setProgressPercent(60);
          setStageName('Vision Transformer Analysis');
          setFrameInfo(mediaType === 'video' ? 'Processing spatiotemporal frames...' : 'Computing 196 patch token self-attention...');
        }, 600);

        if (mediaType === 'image') {
          result = await uploadImageForInference(file, previewUrl);
        } else {
          result = await uploadVideoForInference(file, previewUrl);
        }

        setCurrentStageId(5);
        setProgressPercent(100);
        setStageName('Forensic Analysis Complete');
      } else {
        // Sample demonstration flow
        result = await analyzeMedia(
          file,
          mediaType,
          (stageId, name, percent, frame) => {
            setCurrentStageId(stageId);
            setStageName(name);
            setProgressPercent(percent);
            setFrameInfo(frame);
          },
          labelMapping
        );
      }

      setActiveResult(result);
      setHistoryList((prev) => [result, ...prev.filter((item) => item.id !== result.id)]);

      // Subtle celebration if authentic
      if (result.verdict === 'REAL') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#2E8B70', '#E0F2F4', '#BAD6DA'],
        });
      }
    } catch (err: any) {
      console.error('Detection error:', err);
      alert(err.message || 'An error occurred during analysis. Please check file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetDetection = () => {
    setActiveResult(null);
    setIsProcessing(false);
    setCurrentFileMeta(null);
  };

  const handleScrollToExplain = () => {
    const el = document.getElementById('explainability-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh-pattern">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenUpload={handleOpenDetect}
        onOpenLiveWebcam={() => setIsLiveWebcamOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        labelMapping={labelMapping}
        onUpdateLabelMapping={setLabelMapping}
      />

      {/* Main Content Areas based on Tab */}
      <main className="flex-1">
        
        {/* HOME VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-12 animate-fade-in">
            <Hero
              onAnalyzeClick={handleOpenDetect}
              onHowItWorksClick={() => {
                setCurrentTab('how-it-works');
              }}
            />

            <TrustStrip />

            {/* Quick Upload Portal right on Home page */}
            <section ref={detectSectionRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {!isProcessing && !activeResult && (
                <UploadCard
                  onFileSelect={handleStartAnalysis}
                  onUrlScan={handleScanUrl}
                  isProcessing={isProcessing}
                />
              )}


              {isProcessing && currentFileMeta && (
                <AnalysisProgress
                  currentStageId={currentStageId}
                  stageName={stageName}
                  progressPercent={progressPercent}
                  frameInfo={frameInfo}
                  mediaPreviewUrl={currentFileMeta.previewUrl}
                  mediaType={currentFileMeta.mediaType}
                  filename={currentFileMeta.name}
                />
              )}

              {activeResult && !isProcessing && (
                <div className="space-y-8">
                  <ResultCard
                    result={activeResult}
                    onReset={handleResetDetection}
                    onScrollToExplain={handleScrollToExplain}
                  />

                  <ModelInfoCard result={activeResult} />

                  <ExplainabilityPanel result={activeResult} />

                  {activeResult.mediaType === 'video' && (
                    <VideoAnalysisTimeline result={activeResult} />
                  )}
                </div>
              )}
            </section>

            <HowItWorks />
            <ResponsibleAI />
          </div>
        )}

        {/* DETECT VIEW */}
        {currentTab === 'detect' && (
          <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-cyan/60 border border-pastel-blue text-guard-navy text-xs font-bold mb-3">
                <Shield className="w-3.5 h-3.5 text-guard-navy" />
                Forensic Inspection Suite
              </div>
              <h1 className="text-3xl font-extrabold text-guard-navy">Media Authenticity Detector</h1>
              <p className="text-xs text-guard-muted mt-1">
                Upload image or video files to generate ViT patch attention rollout & Grad-CAM heatmaps
              </p>
            </div>

            {!isProcessing && !activeResult && (
              <UploadCard
                onFileSelect={handleStartAnalysis}
                onUrlScan={handleScanUrl}
                isProcessing={isProcessing}
              />
            )}


            {isProcessing && currentFileMeta && (
              <AnalysisProgress
                currentStageId={currentStageId}
                stageName={stageName}
                progressPercent={progressPercent}
                frameInfo={frameInfo}
                mediaPreviewUrl={currentFileMeta.previewUrl}
                mediaType={currentFileMeta.mediaType}
                filename={currentFileMeta.name}
              />
            )}

            {activeResult && !isProcessing && (
              <div className="space-y-8">
                <ResultCard
                  result={activeResult}
                  onReset={handleResetDetection}
                  onScrollToExplain={handleScrollToExplain}
                />

                <ModelInfoCard result={activeResult} />

                <ExplainabilityPanel result={activeResult} />

                {activeResult.mediaType === 'video' && (
                  <VideoAnalysisTimeline result={activeResult} />
                )}
              </div>
            )}
          </div>
        )}

        {/* HISTORY VIEW */}
        {currentTab === 'history' && (
          <div className="animate-fade-in">
            <DetectionHistory
              history={historyList}
              onSelectResult={(res) => {
                setActiveResult(res);
                setCurrentTab('detect');
              }}
            />
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {currentTab === 'dashboard' && (
          <div className="animate-fade-in">
            <AnalyticsDashboard
              history={historyList}
              onSelectResult={(res) => {
                setActiveResult(res);
                setCurrentTab('detect');
              }}
              onNavigateDetect={() => setCurrentTab('detect')}
            />
          </div>
        )}

        {/* HOW IT WORKS VIEW */}
        {currentTab === 'how-it-works' && (
          <div className="animate-fade-in">
            <HowItWorks />
            <ResponsibleAI />
          </div>
        )}

        {/* ABOUT VIEW */}
        {currentTab === 'about' && (
          <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fade-in">
            <div className="rounded-3xl glass-panel p-8 sm:p-12 border border-white shadow-soft-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-rose/30 border border-pastel-rose text-guard-navy text-xs font-bold mb-4">
                Academic & Industry Defense Research
              </div>

              <h2 className="text-3xl font-extrabold text-guard-navy tracking-tight">
                About DeepGuard AI
              </h2>

              <p className="text-sm text-guard-slate leading-relaxed mt-4">
                DeepGuard AI is an advanced AI security and forensic analysis platform engineered to counter malicious synthetic media, face swapping, and diffusion-generated disinformation. 
              </p>

              <div className="mt-8 space-y-4">
                <div className="p-4 rounded-2xl bg-guard-softbg border border-guard-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-guard-navy">
                    Why Vision Transformer (ViT)?
                  </h3>
                  <p className="text-xs text-guard-muted mt-1 leading-relaxed">
                    Traditional Convolutional Neural Networks (CNNs) rely on localized receptive fields, making them vulnerable to synthetic blending along boundaries and adversarial perturbations. Vision Transformers divide images into 16x16 patch embeddings, capturing global spatiotemporal attention to detect minute discontinuities that CNNs miss.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-guard-softbg border border-guard-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-guard-navy">
                    Explainable AI (XAI) Architecture
                  </h3>
                  <p className="text-xs text-guard-muted mt-1 leading-relaxed">
                    Rather than operating as a black-box oracle, DeepGuard synthesizes Grad-CAM gradient activations with ViT Attention Rollout matrices. This illuminates whether predictions stem from genuine synthesis artifacts (e.g. corneal reflection mismatch, boundary seams) or benign compression noise.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-guard-softbg border border-guard-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-guard-navy">
                    Backend & Production Readiness
                  </h3>
                  <p className="text-xs text-guard-muted mt-1 leading-relaxed">
                    The platform architecture is decoupled and prepared for immediate integration with PyTorch, FastAPI, Hugging Face Transformers, and SQLite persistence.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-guard-border flex items-center justify-between">
                <button
                  onClick={() => setCurrentTab('detect')}
                  className="px-6 py-2.5 rounded-2xl bg-guard-navy text-white text-xs font-semibold hover:bg-guard-slate"
                >
                  Try Media Detection
                </button>
                <span className="text-xs text-guard-muted font-mono">v2.3.1-production</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Live Webcam Guard Modal */}
      <LiveWebcamGuard
        isOpen={isLiveWebcamOpen}
        onClose={() => setIsLiveWebcamOpen(false)}
      />

      {/* Developer API Key Portal Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Footer */}
      <Footer onNavigateTab={setCurrentTab} />

    </div>
  );
}

export default App;
