import React, { useState } from 'react';
import { ArrowLeft, Users, ShieldAlert, CheckCircle, RefreshCw, Key, Award, ExternalLink, HardDrive, Cpu, X, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '../AnimatedBackground';
import AcmLogo from '../AcmLogo';

export default function JudgesPanel({ onBack }) {
  const [selectedJudge, setSelectedJudge] = useState(null);

  const chiefGuests = [
    {
      id: "judge-1",
      name: "Parimal Sesha Sai Adini",
      initials: "PS",
      Role: "Backend Developer",
      company: "NOMISO",
      badgeColor: "cyan",
      description: "Software engineer with over a year of experience building backend systems and AI-powered applications across telecom and B2B SaaS. Core strengths in Java/Spring Boot microservices, event-driven architectures, and RAG-based agentic workflows with production-grade design patterns. Deep expertise in distributed systems, multi-tenant architectures, and GenAI engineering."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
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
    <div className="min-h-screen py-12 px-4 relative flex items-center justify-center font-sans text-left bg-[#030712] overflow-hidden">
      <AnimatedBackground phase="phase1" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-5xl glass-panel rounded-3xl p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 relative z-20"
      >

        {/* Top Header */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="group flex items-center justify-center p-3 rounded-2xl border border-white/10 hover:border-[#3B82F6]/50 bg-black/60 text-slate-300 hover:text-[#00FFFF] transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            >
              <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
            <div>
              <h1 className="flex items-center font-orbitron font-extrabold text-white leading-none select-none text-xl md:text-2xl tracking-wider">
                <span className="text-[#00FFFF] mr-2 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]">DISFRUTAR-2K26</span>
                <span className="text-slate-400 text-sm md:text-base font-normal font-mono-custom">· Evaluation & Chief Guests</span>
              </h1>
            </div>
          </div>
          <AcmLogo className="h-7 w-7 hidden sm:flex" />
        </motion.div>

        {/* Chief Guests Display Showcase */}
        <motion.div variants={itemVariants} className="mb-6">
          <h2
            className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 font-orbitron"
          >
            <span className="bg-[#00FFFF]/10 text-[#00FFFF] px-2.5 py-0.5 rounded-full border border-[#00FFFF]/30 text-[10px] inline-flex font-mono-custom font-bold">VIP</span>
            <span>Distinguished Chief Guests & Evaluation Panel</span>
          </h2>

          <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
            {chiefGuests.map((guest) => {
              const isGold = guest.badgeColor === 'gold';
              return (
                <div
                  key={guest.id}
                  onClick={() => setSelectedJudge(guest)}
                  className="relative bg-black/50 border border-white/10 hover:border-blue-400/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 transition-all duration-300 group shadow-lg hover:shadow-[0_0_30px_rgba(0,255,255,0.15)] hover:scale-[1.01] cursor-pointer overflow-hidden backdrop-blur-xl"
                >
                  {/* Glowing corner accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 rounded-full blur-2xl group-hover:bg-blue-400/15 transition-colors" />

                  {/* Pure Vector VIP Holographic Avatar Badge */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 border-2 border-blue-400/50 group-hover:border-blue-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.25)] relative z-10 transition-transform duration-300 group-hover:scale-105">
                      <span className="text-2xl md:text-3xl font-black font-orbitron text-[#00FFFF] drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                        {guest.initials}
                      </span>
                      {/* Orbital Corner Ring */}
                      <div className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-black border border-[#00FFFF]/50 shadow">
                        <Sparkles className="w-3.5 h-3.5 text-[#00FFFF]" />
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 flex flex-col items-center w-full">
                    <h4 className="text-base md:text-lg font-bold text-white uppercase font-orbitron truncate w-full group-hover:text-[#00FFFF] transition-colors">
                      {guest.name}
                    </h4>
                    <p className="text-xs md:text-sm text-[#00FFFF]/90 font-mono-custom font-semibold mt-1 truncate w-full">
                      {guest.Role}
                    </p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-mono-custom mt-3">
                      <span>{guest.company}</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-[#00FFFF]/80 font-mono-custom uppercase tracking-wider group-hover:underline">
                    View Full Profile & Credentials →
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Selected Judge Modal */}
      <AnimatePresence>
        {selectedJudge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedJudge(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0c0f17] border border-blue-400/40 rounded-3xl max-w-lg w-full relative shadow-[0_0_50px_rgba(0,255,255,0.2)] flex flex-col overflow-hidden max-h-[90dvh]"
            >
              <button
                onClick={() => setSelectedJudge(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors p-2 z-20 bg-white/5 rounded-full border border-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 overflow-y-auto">
                <div className="flex flex-col items-center text-center mt-2">

                  {/* Holographic Initial Avatar */}
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-black via-zinc-900 to-zinc-800 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,255,0.3)] mb-4">
                    <span className="text-3xl font-black font-orbitron text-[#00FFFF]">
                      {selectedJudge.initials}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-orbitron mb-1">{selectedJudge.name}</h3>
                  <p className="text-[#00FFFF]/90 font-mono-custom font-semibold text-sm mb-1">{selectedJudge.Role}</p>
                  <p className="text-slate-400 text-xs font-mono-custom mb-6">{selectedJudge.company}</p>

                  <div className="bg-black/60 rounded-2xl p-5 border border-white/10 w-full text-left">
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed whitespace-pre-line font-sans">
                      {selectedJudge.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
