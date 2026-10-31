import React from 'react';
import { DetectionVerdict } from '../../types/detection';

interface ConfidenceMeterProps {
  confidence: number; // 0 to 100
  verdict: DetectionVerdict;
  size?: number;
  strokeWidth?: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  verdict,
  size = 180,
  strokeWidth = 14,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  let strokeColor = '#2E8B70'; // REAL
  if (verdict === 'FAKE') strokeColor = '#D94F70';
  if (verdict === 'WARNING') strokeColor = '#C58B2B';

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
        />
        {/* Animated Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center Percentage & Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-guard-navy">
          {confidence.toFixed(1)}%
        </span>
        <span className="text-[11px] uppercase font-bold text-guard-muted tracking-wider mt-0.5">
          Confidence
        </span>
      </div>
    </div>
  );
};
