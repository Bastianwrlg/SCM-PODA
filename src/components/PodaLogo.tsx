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
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14'
  };

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-white border border-slate-200/80 flex items-center justify-center p-0.5 shadow-sm ${sizeClasses[size]} ${className}`}>
      {!imgError ? (
        <img
          src="/poda_logo.png"
          alt="PODA Supply Chain Management Logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full object-contain"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle track */}
          <circle cx="50" cy="50" r="38" stroke="#0284c7" strokeWidth="4" strokeDasharray="6 3" />
          <path d="M 20 50 A 30 30 0 0 1 80 50" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
          <path d="M 80 50 A 30 30 0 0 1 20 50" stroke="#0369a1" strokeWidth="4" strokeLinecap="round" />
          
          {/* Center P and upward arrow */}
          <text
            x="48"
            y="62"
            textAnchor="middle"
            fill="#0f172a"
            fontSize="36"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            P
          </text>
          <path d="M 36 64 L 62 36 M 46 36 H 62 V 52" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
};


