import { DetectionResult } from '../types/detection';
import { DEFAULT_VIT_CONFIG, normalizeModelPrediction } from '../config/modelConfig';

// High-fidelity curated face samples with explainability maps
export const SAMPLE_REAL_IMAGE: DetectionResult = {
  id: 'scan-real-001',
  filename: 'portrait_interview_camerarec.jpg',
  mediaType: 'image',
  previewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  fileSizeBytes: 2420000,
  timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  rawOutput: {
    predictedClassIndex: 0,
    rawClassName: 'REAL',
    probabilities: { 'REAL': 0.947, 'FAKE': 0.053 },
  },
  labelMappingUsed: DEFAULT_VIT_CONFIG.labelMapping,
  verdict: 'REAL',
  confidence: 94.7,
  riskLevel: 'Low',
  framesAnalyzed: 1,
  modelInfo: {
    name: 'Vision Transformer (ViT-B/16)',
    architecture: 'ViT Base / 16x16 Patch Resolution',
    framework: 'PyTorch v2.3.1',
    patchSize: '16x16',
    attentionHeads: 12,
    latencyMs: 148,
  },
  explainability: {
    summary: 'The model focused strongly on facial boundary consistency, natural corneal reflections, organic skin pore micro-texture, and absence of synthesis blending seams.',
    heatmapUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    attentionRolloutUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    boundaryConsistencyScore: 96,
    eyeReflectionSymmetryScore: 93,
    skinTextureUniformityScore: 95,
    blendingArtifactScore: 6, // Low artifacts
    keyObservations: [
      'Corneal specular highlights match natural environmental point light source',
      'Continuous skin micro-texture gradient across cheekbone and jawline',
      'No boundary edge blending or color space clipping detected around hairline',
      'Uniform frequency response across all 196 ViT image tokens'
    ],
  },
};

export const SAMPLE_FAKE_IMAGE: DetectionResult = {
  id: 'scan-fake-002',
  filename: 'synthetic_spokesperson_leak.png',
  mediaType: 'image',
  previewUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  fileSizeBytes: 3840000,
  timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  rawOutput: {
    predictedClassIndex: 1,
    rawClassName: 'FAKE',
    probabilities: { 'REAL': 0.038, 'FAKE': 0.962 },
  },
  labelMappingUsed: DEFAULT_VIT_CONFIG.labelMapping,
  verdict: 'FAKE',
  confidence: 96.2,
  riskLevel: 'High',
  framesAnalyzed: 1,
  modelInfo: {
    name: 'Vision Transformer (ViT-B/16)',
    architecture: 'ViT Base / 16x16 Patch Resolution',
    framework: 'PyTorch v2.3.1',
    patchSize: '16x16',
    attentionHeads: 12,
    latencyMs: 162,
  },
  explainability: {
    summary: 'The model identified high-frequency boundary blending inconsistencies along the perimeter of the face, asymmetric specular reflections in the pupils, and smoothing artifacts characteristic of GAN/Diffusion synthesis.',
    heatmapUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    attentionRolloutUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    boundaryConsistencyScore: 28, // Low consistency
    eyeReflectionSymmetryScore: 32, // Asymmetric
    skinTextureUniformityScore: 41, // Over-smoothed
    blendingArtifactScore: 92, // High artifacts
    keyObservations: [
      'Pronounced gradient discontinuity detected across the jawline perimeter',
      'Corneal reflection angle in left eye differs by 18° from right eye',
      'Abnormal frequency attenuation in patch tokens [7, 8, 9] covering oral region',
      'ViT Attention Rollout concentrated 68% of weights on synthetic boundary junction'
    ],
  },
};

export const SAMPLE_FAKE_VIDEO: DetectionResult = {
  id: 'scan-fake-vid-003',
  filename: 'executive_statement_deepfake.mp4',
  mediaType: 'video',
  previewUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  fileSizeBytes: 18400000,
  timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  rawOutput: {
    predictedClassIndex: 1,
    rawClassName: 'FAKE',
    probabilities: { 'REAL': 0.086, 'FAKE': 0.914 },
  },
  labelMappingUsed: DEFAULT_VIT_CONFIG.labelMapping,
  verdict: 'FAKE',
  confidence: 91.4,
  riskLevel: 'High',
  framesAnalyzed: 120,
  modelInfo: {
    name: 'Vision Transformer (ViT-B/16) + Temporal TCN',
    architecture: 'Spatiotemporal ViT-B/16',
    framework: 'PyTorch v2.3.1',
    patchSize: '16x16',
    attentionHeads: 12,
    latencyMs: 1420,
  },
  explainability: {
    summary: 'Temporal frame sequence analysis revealed periodic facial jitter, lip-sync warping around consonants, and high frame-to-frame boundary divergence on frames 38 to 74.',
    heatmapUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    attentionRolloutUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    boundaryConsistencyScore: 35,
    eyeReflectionSymmetryScore: 40,
    skinTextureUniformityScore: 44,
    blendingArtifactScore: 88,
    keyObservations: [
      '42 of 120 frames (35%) exceeded the manipulation threshold (>65% fake probability)',
      'Sharp temporal discontinuity at transition frames 42-56 during rapid head tilt',
      'Unnatural teeth boundary warping detected across consecutive phoneme transitions',
      'ViT cross-attention map isolates synthesis artifacts at mask boundary'
    ],
  },
  videoAnalysis: {
    durationSeconds: 4.8,
    fps: 25,
    totalFrames: 120,
    suspiciousFramesCount: 42,
    suspiciousFramesPercentage: 35.0,
    averageConfidence: 91.4,
    frameTimeline: Array.from({ length: 24 }).map((_, i) => {
      const frameNum = (i + 1) * 5;
      const isSusp = i >= 7 && i <= 15;
      const prob = isSusp 
        ? Math.min(96, Math.max(78, 88 + Math.sin(i * 0.8) * 8))
        : Math.min(62, Math.max(20, 35 + Math.cos(i * 0.5) * 15));
      return {
        frame: frameNum,
        timestamp: `00:0${Math.floor((frameNum / 25) * 10) / 10}s`,
        confidence: Math.round(prob * 10) / 10,
        manipulationProb: Math.round((prob / 100) * 1000) / 1000,
        isSuspicious: isSusp,
      };
    }),
  },
};

export const INITIAL_HISTORY: DetectionResult[] = [
  SAMPLE_REAL_IMAGE,
  SAMPLE_FAKE_IMAGE,
  SAMPLE_FAKE_VIDEO,
  {
    id: 'scan-real-004',
    filename: 'press_conference_cspan.mp4',
    mediaType: 'video',
    previewUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    fileSizeBytes: 14200000,
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    rawOutput: {
      predictedClassIndex: 0,
      rawClassName: 'REAL',
      probabilities: { 'REAL': 0.938, 'FAKE': 0.062 },
    },
    labelMappingUsed: DEFAULT_VIT_CONFIG.labelMapping,
    verdict: 'REAL',
    confidence: 93.8,
    riskLevel: 'Low',
    framesAnalyzed: 150,
    modelInfo: {
      name: 'Vision Transformer (ViT-B/16) + Temporal TCN',
      architecture: 'Spatiotemporal ViT-B/16',
      framework: 'PyTorch v2.3.1',
      patchSize: '16x16',
      attentionHeads: 12,
      latencyMs: 1680,
    },
    explainability: {
      summary: 'Consistent 3D head-pose tracking and natural micro-saccades confirmed authenticity across all 150 frames.',
      heatmapUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      attentionRolloutUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
      boundaryConsistencyScore: 94,
      eyeReflectionSymmetryScore: 92,
      skinTextureUniformityScore: 91,
      blendingArtifactScore: 8,
      keyObservations: [
        'Zero frames exceeded the suspicious risk threshold',
        'Natural optical flow vector distribution across head rotations',
        'Biological blink rate and duration within normal clinical baseline'
      ],
    },
  },
  {
    id: 'scan-fake-005',
    filename: 'face_swap_social_clip.jpg',
    mediaType: 'image',
    previewUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    fileSizeBytes: 1980000,
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    rawOutput: {
      predictedClassIndex: 1,
      rawClassName: 'FAKE',
      probabilities: { 'REAL': 0.115, 'FAKE': 0.885 },
    },
    labelMappingUsed: DEFAULT_VIT_CONFIG.labelMapping,
    verdict: 'FAKE',
    confidence: 88.5,
    riskLevel: 'High',
    framesAnalyzed: 1,
    modelInfo: {
      name: 'Vision Transformer (ViT-B/16)',
      architecture: 'ViT Base / 16x16 Patch Resolution',
      framework: 'PyTorch v2.3.1',
      patchSize: '16x16',
      attentionHeads: 12,
      latencyMs: 155,
    },
    explainability: {
      summary: 'Strong attention rollout on facial seam boundaries and mismatched skin lighting directions.',
      heatmapUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      attentionRolloutUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      boundaryConsistencyScore: 42,
      eyeReflectionSymmetryScore: 45,
      skinTextureUniformityScore: 50,
      blendingArtifactScore: 82,
      keyObservations: [
        'Color grading dissonance between donor face crop and recipient neck',
        'Specular reflection artifacts detected under nasal septum'
      ],
    },
  }
];
