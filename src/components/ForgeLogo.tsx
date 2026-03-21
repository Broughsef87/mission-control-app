"use client";

import React from 'react';

const ForgeLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagonal frame */}
        <path
          d="M50 5L93.3 30V70L50 95L6.7 70V30L50 5Z"
          stroke="var(--color-brand-warm-gray)"
          strokeWidth="1.5"
        />
        {/* Forge "F" mark */}
        <path
          d="M35 30H65V40H45V50H60V60H45V75H35V30Z"
          fill="var(--color-brand-gold)"
        />
        {/* Accent line */}
        <rect x="70" y="30" width="1.5" height="45" fill="var(--color-brand-medium-gray)" opacity="0.6" />
      </svg>
    </div>
  );
};

export default ForgeLogo;
