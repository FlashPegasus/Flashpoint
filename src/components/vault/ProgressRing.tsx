import React from 'react';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  size = 130,
  strokeWidth = 9,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const validPercent = Math.min(100, Math.max(0, percent));
  const offset = circumference - (validPercent / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0cc75" />
            <stop offset="50%" stopColor="#c5a059" />
            <stop offset="100%" stopColor="#8a7340" />
          </linearGradient>
          <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#d4af37" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(197, 160, 89, 0.15)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Circle */}
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#goldGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter="url(#goldGlow)"
        />
      </svg>

      <div className="progress-ring-text">
        <span className="progress-ring-percent">{validPercent}%</span>
        <span className="progress-ring-label">Concluído</span>
      </div>
    </div>
  );
};
