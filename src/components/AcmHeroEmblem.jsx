import React from 'react';
import { motion } from 'framer-motion';

/**
 * AcmHeroEmblem - Deluxe 3D Interactive Hero Animation
 * for the official KARE ACM Student Chapter logo.
 */
export default function AcmHeroEmblem({ size = 180, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Outer Energy Halo & Pulse Waves */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-[#0284C7]/30 via-[#38BDF8]/20 to-[#00F0FF]/25 blur-2xl -z-10 pointer-events-none"
      />

      {/* Floating Levitation Container */}
      <motion.div
        animate={{
          y: [-6, 6, -6],
          rotate: [-1.5, 1.5, -1.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{
          scale: 1.06,
          rotate: 0,
          transition: { duration: 0.3 }
        }}
        className="relative cursor-pointer"
        style={{ width: size, height: size }}
      >
        {/* Rotating Outer Gyroscope Rings */}
        <div className="absolute inset-[-14px] rounded-full border border-dashed border-[#38BDF8]/40 animate-spin pointer-events-none" style={{ animationDuration: '24s' }} />
        <div className="absolute inset-[-6px] rounded-full border border-dotted border-[#00F0FF]/50 animate-spin pointer-events-none" style={{ animationDuration: '16s', animationDirection: 'reverse' }} />

        {/* SVG Core */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,163,255,0.45)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary Diamond Azure Gradient */}
            <linearGradient id="heroAcmGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#56C0F5" />
              <stop offset="45%" stopColor="#2E9DE0" />
              <stop offset="100%" stopColor="#146EA8" />
            </linearGradient>

            {/* Inner Ring Glow Gradient */}
            <linearGradient id="heroRingGrad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#DDF2FD" />
            </linearGradient>

            {/* Radiant Laser Filter */}
            <filter id="heroNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Main Diamond Base */}
          <rect
            x="100"
            y="8"
            width="130"
            height="130"
            rx="14"
            transform="rotate(45 100 8)"
            fill="url(#heroAcmGrad)"
            stroke="#7DD3FC"
            strokeWidth="2"
          />

          {/* 2. White Concentric Ring */}
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="url(#heroRingGrad)"
            strokeWidth="7"
            fill="none"
            opacity="0.98"
          />

          {/* 3. Orbiting Cyan Energy Arc */}
          <circle
            cx="100"
            cy="100"
            r="60"
            stroke="#00F0FF"
            strokeWidth="3.5"
            strokeDasharray="30 75"
            strokeLinecap="round"
            fill="none"
            filter="url(#heroNeonGlow)"
            className="animate-spin"
            style={{ transformOrigin: '100px 100px', animationDuration: '4.5s' }}
          />

          {/* 4. Official Typography */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            fontFamily="'Inter', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="26"
            letterSpacing="2.8"
            fill="#FFFFFF"
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
          >
            KARE
          </text>

          <text
            x="100"
            y="118"
            textAnchor="middle"
            fontFamily="'Inter', 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="35"
            letterSpacing="2.2"
            fill="#FFFFFF"
            className="drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)]"
          >
            ACM
          </text>

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

          {/* Glowing Apex Beads */}
          <circle cx="100" cy="8" r="3" fill="#FFFFFF" className="animate-ping" style={{ transformOrigin: '100px 8px', animationDuration: '3s' }} />
          <circle cx="192" cy="100" r="3" fill="#00F0FF" className="animate-pulse" />
          <circle cx="8" cy="100" r="3" fill="#00F0FF" className="animate-pulse" />
          <circle cx="100" cy="192" r="3" fill="#38BDF8" className="animate-pulse" />
        </svg>
      </motion.div>
    </div>
  );
}
