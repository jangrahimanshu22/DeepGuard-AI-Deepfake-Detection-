export type MediaType = 'image' | 'video';

export type DetectionVerdict = 'REAL' | 'FAKE' | 'WARNING';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ModelLabelMapping {
  [classIndex: string]: 'REAL' | 'FAKE' | string;
}

export interface ModelConfig {
  modelName: string;
  architecture: string;
  framework: string;
  patchSize: string;
  numAttentionHeads: number;
  labelMapping: ModelLabelMapping;
  suspiciousThreshold: number;
}

export interface ModelRawOutput {
  predictedClassIndex: number;
  rawClassName: string;
  probabilities: {
    [classLabelOrIndex: string]: number;
  };
}

export interface AudioForensicsData {
  has_audio: boolean;
  voice_clone_probability: number;
  voice_clone_risk: number;
  spectral_flatness: number;
  high_frequency_ratio?: number;
  waveform_preview?: number[];
  lip_sync_score?: number;
  lip_sync_correlation?: number;
  lip_sync_verdict?: string;
  verdict: string;
  reasons?: string[];
  summary: string;
}

export interface BiologicalForensicsData {
  bpm: number;
  cardiac_snr: number;
  cardiac_coherence_score: number;
  pulse_waveform: number[];
  has_rppg_signal?: boolean;
  blink_count: number;
  blink_rate_bpm: number;
  blink_pattern?: string;
  biological_verdict: string;
  summary: string;
}

export interface ELAForensicsData {
  ela_image: string;
  uniformity_score: number;
  average_difference: number;
  max_difference: number;
  face_bg_discrepancy: number;
  tampering_detected: boolean;
  quality_level: number;
  summary: string;
}

export interface MetadataForensicsData {
  has_camera_metadata: boolean;
  camera_make: string;
  camera_model: string;
  software: string;
  capture_date: string;
  lens_model?: string;
  iso?: string;
  focal_length?: string;
  c2pa_credentials_found: boolean;
  ai_signatures: string[];
  metadata_verdict: string;
  summary: string;
  total_tags_extracted: number;
}

export interface InspectedFace {
  face_id: number;
  bounding_box: [number, number, number, number];
  area?: number;
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  risk_level: string;
  probabilities: {
    REAL: number;
    FAKE: number;
  };
}

export interface ExplainabilityData {
  summary: string;
  heatmapUrl: string;
  attentionRolloutUrl: string;
  boundaryConsistencyScore: number;
  eyeReflectionSymmetryScore: number;
  skinTextureUniformityScore: number;
  blendingArtifactScore: number;
  keyObservations: string[];
  audio?: AudioForensicsData;
  biological?: BiologicalForensicsData;
  ela?: ELAForensicsData;
  metadata?: MetadataForensicsData;
  faces?: InspectedFace[];
}

export interface VideoFrameMetric {
  frame: number;
  timestamp: string;
  confidence: number;
  manipulationProb: number;
  isSuspicious: boolean;
}

export interface VideoAnalysisData {
  durationSeconds: number;
  fps: number;
  totalFrames: number;
  suspiciousFramesCount: number;
  suspiciousFramesPercentage: number;
  averageConfidence: number;
  frameTimeline: VideoFrameMetric[];
}

export interface DetectionResult {
  id: string;
  filename: string;
  mediaType: MediaType;
  previewUrl: string;
  fileSizeBytes: number;
  timestamp: string;
  mediaHash?: string;
  
  // Model raw outputs & explicit mapping
  rawOutput: ModelRawOutput;
  labelMappingUsed: ModelLabelMapping;
  
  // Normalized & Verified Verdict
  verdict: DetectionVerdict;
  confidence: number; // 0 to 100
  riskLevel: RiskLevel;
  framesAnalyzed: number;
  
  faces?: InspectedFace[];
  faceCount?: number;

  modelInfo: {
    name: string;
    architecture: string;
    framework: string;
    patchSize: string;
    attentionHeads: number;
    latencyMs: number;
  };

  explainability: ExplainabilityData;
  videoAnalysis?: VideoAnalysisData;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at?: string | null;
  is_active: boolean;
  raw_key?: string | null;
}

export interface LiveScanResponse {
  session_id: string;
  face_detected: boolean;
  bounding_box: number[];
  prediction: 'REAL' | 'FAKE';
  confidence: number;
  fake_probability: number;
  risk_level: string;
  bpm: number;
  pulse_waveform: number[];
  alert_level: 'SAFE' | 'WARNING' | 'CRITICAL_INTRUSION';
  latency_ms: number;
}

export interface DetectionStats {
  totalAnalyses: number;
  realCount: number;
  fakeCount: number;
  warningCount: number;
  avgConfidence: number;
  avgLatencyMs: number;
}
