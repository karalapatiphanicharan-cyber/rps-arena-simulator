import React from 'react';

interface RpsLogoProps {
  size?: number;
}

const RpsLogo: React.FC<RpsLogoProps> = ({ size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ verticalAlign: 'middle' }}
    >
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity="0.3" />

      {/* Rock at top */}
      <circle cx="50" cy="20" r="12" fill="#EF4444" />
      <path d="M45 20L55 20" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* Paper at bottom right */}
      <rect x="68" cy="65" width="18" height="22" rx="2" transform="translate(-9, -11) rotate(15 77 76)" fill="#3B82F6" />

      {/* Scissors at bottom left */}
      <path d="M23 65L33 85M33 65L23 85" stroke="#FACC15" strokeWidth="4" strokeLinecap="round" />

      {/* Arrows in loop */}
      <path d="M60 25C70 30 75 40 75 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M65 75C55 80 45 80 35 75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M25 50C25 40 30 30 40 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
};

export default RpsLogo;
