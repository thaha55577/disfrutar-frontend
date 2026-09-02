import React from 'react';
import { ArrowLeft, Globe, Users, ExternalLink, Code, BookOpen, Terminal, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground';
import AcmLogo from '../AcmLogo';
import AcmHeroEmblem from '../AcmHeroEmblem';
import DsfrutarLogo from '../DsfrutarLogo';

export default function GfgScreen({ onBack }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] py-12 px-4 relative flex items-center justify-center font-sans">
      <AnimatedBackground phase="phase1" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-5xl glass-panel border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-20 backdrop-blur-xl"
      >
        {/* Terminal corners */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#00F0FF]/50 pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#00F0FF]/50 pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#00F0FF]/50 pointer-events-none"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#00F0FF]/50 pointer-events-none"></div>

        {/* Back and Title Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="group flex items-center justify-center p-3 rounded-2xl border border-white/10 hover:border-[#00F0FF]/50 bg-black/60 text-slate-300 hover:text-[#00F0FF] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
            <div className="text-left flex items-center gap-3">
              <AcmLogo className="h-9 w-9" />
              <div>
                <h1 className="flex items-center font-orbitron font-extrabold text-white leading-none text-xl md:text-2xl tracking-wider">
                  <span className="text-[#00F0FF]">ACM KARE</span>
                  <span className="text-slate-400 text-sm md:text-base font-normal font-mono-custom ml-2">Student Chapter</span>
                </h1>
                <p className="text-[10px] text-cyan-400/90 font-mono-custom uppercase tracking-widest mt-1">
                  OFFICIAL ACM STUDENT CHAPTER · ORGANIZERS OF DISFRUTAR-2K26
                </p>
              </div>
            </div>
          </div>
          <DsfrutarLogo inline className="text-sm hidden md:inline-flex" showSub={false} />
        </motion.div>

        {/* Content Box */}
        <div className="flex flex-col items-center justify-center mb-8">
          <motion.div variants={itemVariants} className="mb-8">
            <AcmHeroEmblem size={160} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="w-full max-w-3xl p-8 rounded-2xl bg-black/50 border border-white/10 flex flex-col justify-between backdrop-blur-xl"
          >
            <div>
              <h2 className="text-xs font-bold text-[#00F0FF] uppercase tracking-widest mb-4 flex items-center gap-2 font-orbitron">
                <Globe className="w-4 h-4 text-[#00F0FF]" />
                <span>ACM KARE STUDENT CHAPTER OVERVIEW</span>
              </h2>
              <div className="space-y-4 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans font-medium">
                <p>
                  The <span className="text-[#00F0FF] font-semibold">ACM KARE Student Chapter</span> is an internationally affiliated student computing body dedicated to fostering research, algorithmic thinking, systems architecture, and state-of-the-art AI development.
                </p>
                <p>
                  We coordinate national computing symposia, research workshops, and flagship innovation conclaves like <span className="text-[#00FFFF] font-semibold drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">DISFRUTAR-2K26</span>. Connect with our leadership and community members below.
                </p>
              </div>
            </div>

            {/* Links and Handles */}
            <div className="space-y-3 mt-8 border-t border-white/10 pt-6">
              <a
                href="https://kare.acm.org/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/[0.05] transition-all text-xs text-slate-200 group"
              >
                <span className="flex items-center gap-2 font-mono-custom">
                  <Globe className="w-4 h-4 text-[#00F0FF]" />
                  <span>Official Chapter Portal</span>
                </span>
                <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1 font-mono-custom font-semibold">
                  kare.acm.org
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>

              <a
                href="https://www.instagram.com/acmkare/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/[0.05] transition-all text-xs text-slate-200 group"
              >
                <span className="flex items-center gap-2 font-mono-custom">
                  <span className="text-[#00F0FF] font-bold text-xs">📸</span>
                  <span>Instagram</span>
                </span>
                <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1 font-mono-custom font-semibold">
                  @acmkare
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>

              <a
                href="https://www.linkedin.com/company/acmkare"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#00F0FF]/50 hover:bg-[#00F0FF]/[0.05] transition-all text-xs text-slate-200 group"
              >
                <span className="flex items-center gap-2 font-mono-custom">
                  <Users className="w-4 h-4 text-[#00F0FF]" />
                  <span>LinkedIn Network</span>
                </span>
                <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1 font-mono-custom font-semibold">
                  ACM KARE Student Chapter
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
