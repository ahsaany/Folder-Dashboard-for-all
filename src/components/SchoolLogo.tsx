import React, { useState } from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  customLogo?: string | null;
  altText?: string;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({ 
  className = '', 
  size = 44,
  customLogo,
  altText = 'School Emblem Logo',
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Prefer explicit prop, then local storage, then default NIS asset
  let activeSrc = customLogo;
  if (!activeSrc) {
    try {
      activeSrc = localStorage.getItem('portal_school_logo') || undefined;
    } catch {}
  }
  if (!activeSrc) {
    activeSrc = '/assets/aistudio/Nada_International_School_Logo_68af40dc.png';
  }

  if (!imageError) {
    return (
      <div 
        className={`relative flex items-center justify-center shrink-0 drop-shadow-sm select-none ${className}`} 
        style={{ width: size, height: size }}
      >
        <img
          key={activeSrc}
          src={activeSrc}
          alt={altText}
          className="w-full h-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback if image fails to load
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

        <path
          d="M50 6 C74 6 88 16 88 38 C88 64 68 84 50 94 C32 84 12 64 12 38 C12 16 26 6 50 6 Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="3.5"
        />
        <path
          d="M32 46 C38 43 45 44 50 48 C55 44 62 43 68 46 L68 62 C62 59 55 60 50 64 C45 60 38 59 32 62 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />
        <path d="M50 48 L50 64" stroke="#1B5E20" strokeWidth="1.5" />
        <path
          d="M50 22 L53 28 L59 29 L54 34 L56 40 L50 37 L44 40 L46 34 L41 29 L47 28 Z"
          fill="url(#goldGrad)"
        />
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
