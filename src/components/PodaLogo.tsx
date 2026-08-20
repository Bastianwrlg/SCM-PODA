import React, { useState } from 'react';

interface PodaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PodaLogo: React.FC<PodaLogoProps> = ({ 
  className = '', 
  size = 'md'
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-black border border-slate-800 flex items-center justify-center p-0.5 shadow-sm ${sizeClasses[size]} ${className}`}>
      {!imgError ? (
        <img
          src="/poda_logo.jpg"
          alt="PODA E-Liquid Company Logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <svg
          viewBox="0 0 280 140"
          className="w-full h-full object-contain p-0.5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="poda-letters">
            {/* Letter P (Red) */}
            <path
              d="M 28 32 H 68 C 84 32 94 42 94 56 C 94 70 84 80 68 80 H 48 V 104 H 28 V 32 Z M 48 48 V 64 H 66 C 73 64 76 60 76 56 C 76 52 73 48 66 48 H 48 Z"
              fill="#E11D48"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            {/* Letter O (White with Droplet Cutout) */}
            <path
              d="M 125 32 C 104 32 88 48 88 68 C 88 88 104 104 125 104 C 146 104 162 88 162 68 C 162 48 146 32 125 32 Z"
              fill="#FFFFFF"
            />
            <path
              d="M 125 50 C 125 50 114 65 114 72 C 114 78 119 83 125 83 C 131 83 136 78 136 72 C 136 65 125 50 125 50 Z"
              fill="#09090b"
            />
            {/* Letter D (White) */}
            <path
              d="M 158 32 H 188 C 208 32 222 47 222 68 C 222 89 208 104 188 104 H 158 V 32 Z M 176 48 V 88 H 186 C 198 88 204 79 204 68 C 204 57 198 48 186 48 H 176 Z"
              fill="#FFFFFF"
            />
            {/* Letter A (Black with White outline) */}
            <path
              d="M 235 32 L 210 104 H 230 L 235 88 H 255 L 260 104 H 280 L 255 32 H 235 Z M 240 72 L 245 54 L 250 72 H 240 Z"
              fill="#18181b"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
          </g>
          <text
            x="140"
            y="126"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="18"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
            letterSpacing="4"
          >
            E-LIQUID COMPANY
          </text>
        </svg>
      )}
    </div>
  );
};

