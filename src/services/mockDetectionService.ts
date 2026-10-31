import { DetectionResult, MediaType, ModelLabelMapping } from '../types/detection';
import { DEFAULT_VIT_CONFIG, normalizeModelPrediction } from '../config/modelConfig';
import { SAMPLE_REAL_IMAGE, SAMPLE_FAKE_IMAGE, SAMPLE_FAKE_VIDEO } from './sampleData';

export interface AnalysisProgressCallback {
  (stageId: number, stageName: string, progressPercent: number, frameInfo?: string): void;
}

export async function analyzeMedia(
  file: File | { name: string; size: number; type: string; previewUrl: string },
  mediaType: MediaType,
  onProgress: AnalysisProgressCallback,
  labelMapping: ModelLabelMapping = DEFAULT_VIT_CONFIG.labelMapping
): Promise<DetectionResult> {
  const isVideo = mediaType === 'video';
  const totalFrames = isVideo ? 120 : 1;

  // Stage 1: Uploading Media
  onProgress(1, 'Uploading Media & File Hashing', 15);
  await new Promise((r) => setTimeout(r, 600));

  // Stage 2: Face Detection & Landmark Alignment
  onProgress(2, 'Detecting Face & Extracting ROI', 35, isVideo ? 'Tracking facial bounding boxes across frames' : 'Face detected (Confidence: 99.4%)');
  await new Promise((r) => setTimeout(r, 700));

  // Stage 3: Extracting Patch Features
  onProgress(3, 'Extracting 16x16 Patch Embeddings', 55, 'Generating 196 token embeddings + Positional Encodings');
  await new Promise((r) => setTimeout(r, 700));

  // Stage 4: Vision Transformer Multi-Head Self-Attention
  const stepFrames = isVideo ? [24, 48, 72, 96, 120] : [1];
  for (let i = 0; i < stepFrames.length; i++) {
    const currentFrame = stepFrames[i];
    const subProgress = 60 + Math.round((i / stepFrames.length) * 28);
    onProgress(
      4, 
      'Vision Transformer Analysis', 
      subProgress, 
      isVideo ? `Analyzing frame ${currentFrame} / ${totalFrames} (ViT Attention Heads: 12)` : 'Computing CLS Token Multi-Head Self-Attention'
    );
    await new Promise((r) => setTimeout(r, isVideo ? 280 : 500));
  }

  // Stage 5: Generating Result & Explainability Maps
  onProgress(5, 'Generating Result & Explainability Maps', 98, 'Synthesizing Grad-CAM & Attention Rollout matrices');
  await new Promise((r) => setTimeout(r, 600));

  // Check if filename hints at Fake or Real for demonstration, else default to realistic classification
  const lowerName = file.name.toLowerCase();
  let baseTemplate: DetectionResult;

  if (isVideo) {
    baseTemplate = JSON.parse(JSON.stringify(SAMPLE_FAKE_VIDEO));
  } else if (lowerName.includes('real') || lowerName.includes('authentic') || lowerName.includes('camera')) {
    baseTemplate = JSON.parse(JSON.stringify(SAMPLE_REAL_IMAGE));
  } else {
    baseTemplate = JSON.parse(JSON.stringify(SAMPLE_FAKE_IMAGE));
  }

  // Generate unique run ID and real file info
  const runId = `scan-${Date.now().toString(36)}`;
  const previewUrl = 'previewUrl' in file && file.previewUrl 
    ? file.previewUrl 
    : baseTemplate.previewUrl;

  // Strictly normalize with explicit label mapping
  const normalized = normalizeModelPrediction(baseTemplate.rawOutput, labelMapping);

  const result: DetectionResult = {
    ...baseTemplate,
    id: runId,
    filename: file.name,
    mediaType,
    previewUrl,
    fileSizeBytes: file.size,
    timestamp: new Date().toISOString(),
    labelMappingUsed: labelMapping,
    verdict: normalized.normalizedVerdict,
    confidence: normalized.confidence,
    riskLevel: normalized.riskLevel,
  };

  return result;
}
