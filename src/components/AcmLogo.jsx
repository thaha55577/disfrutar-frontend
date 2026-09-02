import React from 'react';
import { motion } from 'framer-motion';

/**
 * Official Animated KARE ACM STUDENT CHAPTER Logo
 * Features:
 * - Exact 45° diamond silhouette in cyber ACM azure/cyan gradient
 * - Concentric glowing orbital ring with rotating light beacon
 * - Crisp typography: KARE / ACM / STUDENT CHAPTER
 * - Multi-layered neon glow and interactive hover physics
 */
export default function AcmLogo({ 
  className = "h-10 w-10", 
  showText = false,
  animated = true,
  size = 48,
  glow = true
}) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Animated Diamond Logo Container */}
      <motion.div
        whileHover={animated ? { scale: 1.08, rotate: [0, -2, 2, 0] } : {}}
        transition={{ duration: 0.3 }}
        className={`relative flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* Radiant Ambient Glow Behind Diamond */}
        {glow && (
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0072CE]/40 via-[#00A3FF]/30 to-[#00F0FF]/25 rounded-2xl blur-md -z-10 animate-pulse" />
        )}

        {/* Pure Vector SVG Diamond Logo */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(0,163,255,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Diamond Azure Gradient */}
            <linearGradient id="acmDiamondGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4FB5EC" />
              <stop offset="50%" stopColor="#2996D8" />
              <stop offset="100%" stopColor="#1877B8" />
            </linearGradient>

            {/* Glowing Ring Gradient */}
            <linearGradient id="acmRingGrad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Neon Glow Filter */}
            <filter id="acmGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Main 45-degree Rotated Diamond */}
          <rect
            x="100"
            y="8"
            width="130"
            height="130"
            rx="12"
            transform="rotate(45 100 8)"
            fill="url(#acmDiamondGrad)"
            stroke="#67C5F7"
            strokeWidth="1.5"
          />

          {/* 2. Concentric Circular Ring (Static + Rotating Orbital Dash) */}
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="url(#acmRingGrad)"
            strokeWidth="6"
            fill="none"
            opacity="0.95"
          />

          {/* Rotating Dynamic Cyber Ring Overlay */}
          {animated && (
            <circle
              cx="100"
              cy="100"
              r="60"
              stroke="#00F0FF"
              strokeWidth="3"
              strokeDasharray="25 65"
              strokeLinecap="round"
              fill="none"
              filter="url(#acmGlow)"
              className="animate-spin"
              style={{ transformOrigin: '100px 100px', animationDuration: '6s' }}
            />
          )}

          {/* Inner Decorative Tech Bezel */}
          <circle
            cx="100"
            cy="100"
            r="67"
            stroke="#BAE6FD"
            strokeWidth="1"
            strokeDasharray="3 6"
            fill="none"
            opacity="0.45"
          />

          {/* 3. Official Typography */}
          {/* "KARE" */}
          <text
            x="100"
            y="86"
            textAnchor="middle"
            fontFamily="'Inter', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="2.5"
            fill="#00FFFF"
            className="drop-shadow-[0_1px_3px_rgba(0,255,255,0.35)]"
          >
            KARE
          </text>

          {/* "ACM" */}
          <text
            x="100"
            y="118"
            textAnchor="middle"
            fontFamily="'Inter', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="34"
            letterSpacing="2"
            fill="#00FFFF"
            className="drop-shadow-[0_2px_5px_rgba(0,255,255,0.4)]"
          >
            ACM
          </text>

          {/* "STUDENT CHAPTER" */}
          <text
            x="100"
            y="134"
            textAnchor="middle"
            fontFamily="'Inter', sans-serif"
            fontWeight="800"
            fontSize="8.5"
            letterSpacing="1.2"
            fill="#E0F2FE"
            className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          >
            STUDENT CHAPTER
          </text>

          {/* Orbital Sparkle Points */}
          {animated && (
            <>
              <circle cx="100" cy="33" r="2.5" fill="#FFFFFF" className="animate-pulse" />
              <circle cx="100" cy="167" r="2.5" fill="#00F0FF" className="animate-pulse" />
            </>
          )}
        </svg>
      </motion.div>

      {/* Optional Accompanying Text */}
      {showText && (
        <div className="flex flex-col text-left leading-tight font-mono-custom">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-black text-sm tracking-wider">KARE ACM</span>
            <span className="px-1.5 py-0.2 bg-[#00A3FF]/20 border border-[#00A3FF]/50 text-[#00A3FF] text-[8px] font-bold rounded">
              CHAPTER
            </span>
          </div>
          <span className="text-[10px] text-cyan-400/80 tracking-widest uppercase font-semibold">
            Student Chapter
          </span>
        </div>
      )}
    </div>
  );
}
