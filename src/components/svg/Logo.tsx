"use client";

import { memo } from "react";
import { suitPaths } from "./SuitIcon";

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const Logo = memo(function Logo({
  className = "",
  size = 120,
  animated = true,
}: LogoProps) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={animated ? "animate-pulse-slow" : ""}
        aria-label="Spades logo"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#e8c65a" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          opacity="0.6"
        />
        
        {/* Inner ring */}
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="url(#logoGradient)"
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Central spade */}
        <g transform="translate(26, 25) scale(2)" filter="url(#logoGlow)">
          <path d={suitPaths.spades} fill="url(#logoGradient)" />
        </g>
        
        {/* Corner stars */}
        <circle cx="20" cy="20" r="2" fill="#d4af37" opacity="0.6" />
        <circle cx="80" cy="20" r="2" fill="#d4af37" opacity="0.6" />
        <circle cx="20" cy="80" r="2" fill="#d4af37" opacity="0.6" />
        <circle cx="80" cy="80" r="2" fill="#d4af37" opacity="0.6" />
      </svg>
      
      <h1
        className="text-gold font-display text-3xl tracking-widest"
        style={{ fontFamily: "var(--font-cinzel), Cinzel, serif" }}
      >
        SPADES
      </h1>
      <p
        className="text-white text-sm tracking-[0.3em] uppercase"
        style={{ fontFamily: "var(--font-cinzel), Cinzel, serif" }}
      >
        Celestial Noir
      </p>
    </div>
  );
});

export default Logo;


