import React from 'react';
import './CircularLoader.css'; // Import CSS for the animation

const CircularLoader = ({
  size = 120, 
  strokeWidth = 10, 
  color = '#3498db', // Color of the loader
  bgColor = '#e6e6e6', // Background circle color
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      className="circular-loader"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background circle */}
      <circle
        className="background-circle"
        stroke={bgColor}
        fill="none"
        strokeWidth={strokeWidth}
        cx={center}
        cy={center}
        r={radius}
      />
      {/* Loader circle (rotating part) */}
      <circle
        className="loader-circle"
        stroke={color}
        fill="none"
        strokeWidth={strokeWidth}
        cx={center}
        cy={center}
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={circumference / 4} // Starts from 25% for animation effect
      />
    </svg>
  );
};

export default CircularLoader;
