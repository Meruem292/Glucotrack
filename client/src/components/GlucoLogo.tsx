import React from 'react';

interface GlucoLogoProps {
  size?: number;
  className?: string;
}

export default function GlucoLogo({ size = 80, className = '' }: GlucoLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" fill="#111827" />
        <path 
          d="M30 50C30 38.954 38.954 30 50 30C61.046 30 70 38.954 70 50C70 61.046 61.046 70 50 70"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path 
          d="M50 70C44.477 70 40 65.523 40 60C40 54.477 44.477 50 50 50C55.523 50 60 54.477 60 60"
          stroke="#4285F4"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="5" fill="#4285F4" />
      </svg>
    </div>
  );
}