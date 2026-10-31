import React, { useState } from 'react';
import { Video, Play, Pause, Activity, AlertTriangle, CheckCircle2, Sliders, Film } from 'lucide-react';
import { DetectionResult } from '../../types/detection';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface VideoAnalysisTimelineProps {
  result: DetectionResult;
}

export const VideoAnalysisTimeline: React.FC<VideoAnalysisTimelineProps> = ({ result }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<number>(35);

  const videoData = result.videoAnalysis;
  if (!videoData) return null;

  const chartData = videoData.frameTimeline.map((item) => ({
    frame: `F#${item.frame}`,
    frameNum: item.frame,
    timestamp: item.timestamp,
    confidence: item.confidence,
    isSuspicious: item.isSuspicious,
  }));

  const activePoint = videoData.frameTimeline.find((p) => p.frame === selectedFrame) || videoData.frameTimeline[7];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl glass-panel p-6 sm:p-10 shadow-soft-xl border border-white relative mt-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-guard-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pastel-yellow/60 flex items-center justify-center text-guard-navy">
            <Film className="w-5 h-5 text-guard-navy" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-guard-navy">
              Video Frame-by-Frame Timeline
            </h3>
            <p className="text-xs text-guard-muted mt-0.5">
              Spatiotemporal sequence verification across {videoData.totalFrames} decoded frames
            </p>
          </div>
        </div>

        {/* Video Metric Summary Badges */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-guard-slate border border-slate-200">
            {videoData.durationSeconds}s @ {videoData.fps} FPS
          </span>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-detect-fake border border-rose-200">
            {videoData.suspiciousFramesPercentage}% Suspicious
          </span>
        </div>
      </div>

      {/* Top 3 Video KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-white/70 border border-guard-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Aggregated Verdict</span>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-base font-extrabold ${result.verdict === 'REAL' ? 'text-detect-real' : 'text-detect-fake'}`}>
              {result.verdict} — {result.confidence}%
            </span>
          </div>
          <span className="text-[11px] text-guard-muted mt-0.5 block">Confidence over full duration</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 border border-guard-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Flagged Frame Count</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-extrabold text-guard-navy">
              {videoData.suspiciousFramesCount} / {videoData.totalFrames}
            </span>
          </div>
          <span className="text-[11px] text-guard-muted mt-0.5 block">Exceeding 65% manipulation prob</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/70 border border-guard-border shadow-sm">
          <span className="text-[10px] uppercase font-bold text-guard-muted block">Temporal Consistency</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-extrabold text-guard-slate">
              {videoData.suspiciousFramesPercentage > 20 ? 'Discontinuous' : 'Uniform'}
            </span>
          </div>
          <span className="text-[11px] text-guard-muted mt-0.5 block">Cross-attention drift index</span>
        </div>
      </div>

      {/* Frame Confidence Chart (Recharts) */}
      <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-white border border-guard-border shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h4 className="text-xs font-bold text-guard-navy uppercase tracking-wider">
              Frame-by-Frame Manipulation Confidence
            </h4>
            <p className="text-[11px] text-guard-muted">Click or hover over frame nodes to inspect timestamp risk</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-detect-fake inline-block" />
              <span className="text-guard-muted text-[11px]">Suspicious Threshold (65%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pastel-rose inline-block" />
              <span className="text-guard-muted text-[11px]">Frame Risk Score</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setSelectedFrame(e.activePayload[0].payload.frameNum);
                }
              }}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F791A9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F791A9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="frame" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-guard-midnight text-white p-3 rounded-xl shadow-lg border border-white/20 text-xs">
                        <p className="font-bold text-pastel-yellow">{data.frame} ({data.timestamp})</p>
                        <p className="mt-1">
                          Risk Score: <span className="font-mono font-bold">{data.confidence}%</span>
                        </p>
                        <p className="text-[10px] text-guard-border mt-0.5">
                          Status: {data.isSuspicious ? '⚠️ Suspicious Artifact' : '✓ Normal'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={65} stroke="#D94F70" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="confidence"
                stroke="#D94F70"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorConfidence)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Frame Detail Strip */}
        <div className="mt-4 pt-4 border-t border-guard-border flex items-center justify-between flex-wrap gap-3 bg-guard-softbg/60 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-guard-navy bg-white px-2 py-1 rounded border border-guard-border">
              Inspecting Frame #{activePoint.frame}
            </span>
            <span className="text-xs text-guard-muted">Timestamp: {activePoint.timestamp}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
              activePoint.isSuspicious 
                ? 'bg-detect-fake-bg text-detect-fake border-detect-fake-border'
                : 'bg-detect-real-bg text-detect-real border-detect-real-border'
            }`}>
              {activePoint.isSuspicious ? 'High Synthesis Jitter' : 'Natural Coherence'}
            </span>
            <span className="text-xs font-mono font-bold text-guard-navy">
              Score: {activePoint.confidence}%
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
