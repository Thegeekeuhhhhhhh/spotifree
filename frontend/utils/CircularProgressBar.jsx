import React, { useEffect, useState } from 'react';

const CircularProgressBar = ({
  size = 120,
  strokeWidth = 10,
  percentage = 75,
  color = '#4caf50',
  bgColor = '#e6e6e6',
  animationDuration = 1000, // in ms
}) => {
  const [progress, setProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let start = 0;
    const step = (timestamp) => {
      const progressRatio = Math.min(1, (Date.now() - startTime) / animationDuration);
      setProgress(progressRatio * percentage);
      if (progressRatio < 1) requestAnimationFrame(step);
    };

    const startTime = Date.now();
    requestAnimationFrame(step);
  }, [percentage, animationDuration]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size}>
      {/* Background circle */}
      <circle
        stroke={bgColor}
        fill="none"
        strokeWidth={strokeWidth}
        cx={size / 2}
        cy={size / 2}
        r={radius}
      />

      {/* Foreground progress circle */}
      <circle
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: 'stroke-dashoffset 0.3s ease' }}
      />

      {/* Percentage text */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fontSize={size * 0.2}
        fill="#333"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};

export default CircularProgressBar;
