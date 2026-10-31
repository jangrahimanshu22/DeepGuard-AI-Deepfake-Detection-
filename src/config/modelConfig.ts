import { ModelConfig, ModelLabelMapping, ModelRawOutput, DetectionVerdict, RiskLevel } from '../types/detection';

/**
 * Standard Vision Transformer Deepfake Classification Model Config
 * Pretrained on FaceForensics++ / DFDC / Celeb-DF
 */
export const DEFAULT_VIT_CONFIG: ModelConfig = {
  modelName: 'ViT-B/16-DeepGuard-Forensic',
  architecture: 'Vision Transformer (ViT-Base, 16x16 patch resolution)',
  framework: 'PyTorch v2.3 / Hugging Face Transformers',
  patchSize: '16x16',
  numAttentionHeads: 12,
  // Explicit label mapping dictionary as provided by model card or config.json
  labelMapping: {
    '0': 'REAL',
    '1': 'FAKE',
  },
  suspiciousThreshold: 0.65,
};

/**
 * Normalizes model raw output using the explicitly provided labelMapping.
 * Prevents reversed or inverted assumptions.
 */
export function normalizeModelPrediction(
  rawOutput: ModelRawOutput,
  labelMapping: ModelLabelMapping = DEFAULT_VIT_CONFIG.labelMapping
): {
  normalizedVerdict: DetectionVerdict;
  confidence: number;
  riskLevel: RiskLevel;
} {
  const predictedIdxStr = String(rawOutput.predictedClassIndex);
  const mappedLabel = (labelMapping[predictedIdxStr] || rawOutput.rawClassName || 'UNKNOWN').toUpperCase();

  // Extract probability for the predicted class
  const classProb = rawOutput.probabilities[mappedLabel] ?? 
                    rawOutput.probabilities[predictedIdxStr] ?? 
                    Math.max(...Object.values(rawOutput.probabilities), 0.5);

  const confidence = Math.round(classProb * 1000) / 10; // e.g. 94.7

  let verdict: DetectionVerdict = 'WARNING';
  if (mappedLabel.includes('REAL') || mappedLabel === 'AUTHENTIC') {
    verdict = 'REAL';
  } else if (mappedLabel.includes('FAKE') || mappedLabel === 'MANIPULATED' || mappedLabel === 'SYNTHETIC') {
    verdict = 'FAKE';
  }

  // Calculate forensic risk level
  let riskLevel: RiskLevel = 'Low';
  if (verdict === 'FAKE') {
    riskLevel = confidence > 85 ? 'High' : 'Medium';
  } else if (verdict === 'REAL') {
    riskLevel = confidence < 70 ? 'Medium' : 'Low';
  } else {
    riskLevel = 'Medium';
  }

  return {
    normalizedVerdict: verdict,
    confidence,
    riskLevel,
  };
}
