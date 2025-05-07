import React from "react";

interface GlucoLogoProps {
  size?: number;
  className?: string;
}

export default function GlucoLogo({ size = 40, className = "" }: GlucoLogoProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-black ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.3 6.5C18.3 11.75 12 17.1 12 17.1C12 17.1 5.7 11.75 5.7 6.5C5.7 4.01 8.07 2 12 2C15.93 2 18.3 4.01 18.3 6.5Z"
          stroke="#4285F4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 22C10.343 22 9 20.657 9 19C9 17.343 10.343 16 12 16C13.657 16 15 17.343 15 19C15 20.657 13.657 22 12 22Z"
          stroke="#4285F4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 9C13.1046 9 14 8.10457 14 7C14 5.89543 13.1046 5 12 5C10.8954 5 10 5.89543 10 7C10 8.10457 10.8954 9 12 9Z"
          stroke="#4285F4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}