import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ className = '', size = 42 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B5E20" />
            <stop offset="100%" stopColor="#0B3A10" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="50%" stopColor="#FFC107" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>

        {/* Outer Shield with Gold Border */}
        <path
          d="M50 6 C74 6 88 16 88 38 C88 64 68 84 50 94 C32 84 12 64 12 38 C12 16 26 6 50 6 Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="3.5"
        />

        {/* Inner Golden Rim Accent */}
        <path
          d="M50 12 C70 12 82 20 82 38 C82 60 65 77 50 86 C35 77 18 60 18 38 C18 20 30 12 50 12 Z"
          fill="none"
          stroke="#FFD54F"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* Central Open Wisdom Book */}
        <path
          d="M32 46 C38 43 45 44 50 48 C55 44 62 43 68 46 L68 62 C62 59 55 60 50 64 C45 60 38 59 32 62 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
        <path
          d="M50 48 L50 64"
          stroke="#1B5E20"
          strokeWidth="1.5"
        />

        {/* Laurel / Torch Symbol on top */}
        <path
          d="M50 22 L53 28 L59 29 L54 34 L56 40 L50 37 L44 40 L46 34 L41 29 L47 28 Z"
          fill="url(#goldGrad)"
        />

        {/* School Initial Ribbon Monogram */}
        <text
          x="50"
          y="77"
          textAnchor="middle"
          fill="#FFD54F"
          fontSize="8.5"
          fontWeight="bold"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="1.5"
        >
          NIS
        </text>
      </svg>
    </div>
  );
};
