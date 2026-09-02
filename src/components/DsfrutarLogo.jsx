import React from 'react';

/**
 * DSFRUTAR-2K26 Next-Gen Cyber-Futuristic Brand Identity
 * 100% Vector SVG Prism Core + Radiant Holographic Typography
 */
export default function DsfrutarLogo({
  className = "text-4xl",
  inline = false,
  showSub = true,
  glow = "emerald"
}) {
  if (inline) {
    return (
      <div className={`inline-flex items-center select-none font-orbitron tracking-wider ${className}`}>
        {/* Glowing Geometric Cyber Emblem */}
        <div className="relative flex items-center justify-center mr-2.5">
          <div className="w-[1.25em] h-[1.25em] rounded-lg bg-gradient-to-tr from-[#00FF88]/20 via-[#00F0FF]/15 to-transparent border border-[#00FF88]/60 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.35)]">
            <svg viewBox="0 0 24 24" className="w-[65%] h-[65%] text-[#00FF88]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              <line x1="12" y1="22" x2="12" y2="12" />
              <polyline points="22 8.5 12 12 2 8.5" />
            </svg>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-ping" />
        </div>

        {/* Wordmark: DSFRUTAR */}
        <span className="font-black bg-gradient-to-r from-white via-[#00FF88] to-[#00F0FF] bg-clip-text text-transparent tracking-widest mr-2 drop-shadow-[0_0_12px_rgba(0,255,136,0.3)]">
          DISFRUTAR
        </span>

        {/* Year Pill: 2K26 */}
        <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-400 via-blue-400 to-blue-500 text-black font-mono-custom font-black text-[0.62em] tracking-wider border border-blue-300 shadow-[0_0_15px_rgba(0,255,255,0.4)]">
          2K26
        </div>
      </div>
    );
  }

  // Hero / Center Stacked Version
  return (
    <div className={`flex flex-col items-center justify-center select-none font-orbitron ${className}`}>

      {/* Top Floating Cyber Emblem */}
      <div className="relative mb-3 group">
        {/* Radiant Ambient Aura */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00FF88]/30 via-[#00F0FF]/30 to-[#FFD700]/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl" />

        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black/70 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-[0_0_35px_rgba(0,255,136,0.3)] transition-transform duration-300 group-hover:scale-105">
          <svg viewBox="0 0 24 24" className="w-9 h-9 sm:w-11 sm:h-11 text-[#00FF88] drop-shadow-[0_0_12px_#00FF88]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" stroke="url(#logoGrad)" />
            <line x1="12" y1="22" x2="12" y2="12" stroke="#00F0FF" />
            <polyline points="22 8.5 12 12 2 8.5" stroke="#00FF88" />
            <circle cx="12" cy="12" r="2" fill="#FFD700" />
            <defs>
              <linearGradient id="logoGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00FF88" />
                <stop offset="0.5" stopColor="#00F0FF" />
                <stop offset="1" stopColor="#FFD700" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Glowing Holographic Title Header */}
      <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-1">

        {/* DSFRUTAR Gradient Wordmark */}
        <h1 className="text-[1.1em] sm:text-[1.25em] font-black tracking-[0.18em] uppercase bg-gradient-to-r from-white via-[#00FF88] to-[#00F0FF] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,255,136,0.35)]">
          DISFRUTAR
        </h1>

        {/* 2K26 Neon Capsule Badge */}
        <div className="inline-flex items-center px-3 py-1 rounded-xl bg-gradient-to-r from-blue-400 via-blue-400 to-blue-500 text-black font-mono-custom font-extrabold text-[0.68em] tracking-widest border border-blue-200 shadow-[0_0_20px_rgba(0,255,255,0.5)]">
          2K26
        </div>

      </div>

      {/* Laser Gradient Accent Line */}
      <div className="w-3/4 max-w-[280px] h-[2px] bg-gradient-to-r from-transparent via-[#00FF88] to-transparent shadow-[0_0_10px_#00FF88] mt-2 mb-3" />

      {/* Subtitle Badge */}
      {showSub && (
        <div className="flex items-center gap-2.5 font-mono-custom text-[0.32em] sm:text-[0.35em] tracking-[0.35em] uppercase text-slate-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse" />
          <span>NATIONAL HACKATHON CONCLAVE</span>
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] animate-pulse" />
        </div>
      )}

    </div>
  );
}
