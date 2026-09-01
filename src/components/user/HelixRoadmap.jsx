import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useMotionValueEvent } from 'framer-motion';
import {
 UserCheck, FileCode, Search, Code, Cpu, ShieldCheck, Award, Flag,
 ChevronUp, ChevronDown, Activity, Sparkles, Gem, Zap, FlaskConical
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const ROADMAP_STAGES = [
 {
 id: '01',
 name: 'Registration',
 status: 'completed',
 desc: 'Participant onboarding, identity verification & security clearance protocol.',
 icon: UserCheck,
 phase: 'Phase 01',
 date: 'Day 01 • 09:00'
 },
 {
 id: '02',
 name: 'Problem Statement selection',
 status: 'completed',
 desc: 'Concept architecture, methodology formulation & initial proposal upload.',
 icon: FileCode,
 phase: 'Phase 02',
 date: 'Day 01 • 18:30'
 },
 {
 id: '03',
 name: 'Review 1',
 status: 'completed',
 desc: 'Initial feasibility assessment, problem alignment & structural check.',
 icon: Search,
 phase: 'Phase 03',
 date: 'Day 01 • 23:00'
 },
 {
 id: '04',
 name: 'Review 2',
 status: 'current',
 desc: 'Mid-point telemetry, codebase integrity audit & prototype benchmarking.',
 icon: Code,
 phase: 'Phase 04',
 date: 'Day 02 • 04:00'
 },
 {
 id: '05',
 name: 'Prototype Development',
 status: 'upcoming',
 desc: 'Full-scale solution implementation, core neural engine & pipeline build.',
 icon: Cpu,
 phase: 'Phase 05',
 date: 'Day 02 • 7:00'
 },
 {
 id: '06',
 name: 'Review 3',
 status: 'upcoming',
 desc: 'Final system stress testing, security vulnerability scan & deployment check.',
 icon: ShieldCheck,
 phase: 'Phase 06',
 date: 'Day 02 • 11:00'
 },
 {
 id: '07',
 name: 'Final Presentation',
 status: 'upcoming',
 desc: 'Live telemetry demonstration to jury panel & system defense execution.',
 icon: Flag,
 phase: 'Phase 07',
 date: 'Day 02 • 15:00'
 },
 {
 id: '08',
 name: 'Winner Announcement',
 status: 'upcoming',
 desc: 'Protocol resolution, final leaderboard release & award distribution.',
 icon: Award,
 phase: 'Phase 08',
 date: 'Day 02 • 16:15'
 }
];

// ── CSS keyframes for crystal float animation (replaces 13 Framer Motion loops) ──
const crystalKeyframesCSS = `
@keyframes crystalFloat {
 0%, 100% { transform: var(--crystal-start); }
 50% { transform: var(--crystal-mid); }
}
@keyframes crystalGlow {
 0%, 100% { opacity: 0.85; }
 50% { opacity: 1; }
}
`;

export default function HelixRoadmap({ fullscreen = false }) {
 const containerRef = useRef(null);

 // Motion value for progress between 0 and 1
 const targetProgress = useMotionValue(0); // Default focus at 0 (Stage 1)
 const [activeIdx, setActiveIdx] = useState(0);
 const [isHovered, setIsHovered] = useState(false);
 const activeIdxRef = useRef(0); // Ref to throttle setActiveIdx calls

 const [isMobile, setIsMobile] = useState(false);
 useEffect(() => {
   const handleResize = () => setIsMobile(window.innerWidth < 768);
   handleResize(); // Initial check
   window.addEventListener('resize', handleResize);
   return () => window.removeEventListener('resize', handleResize);
 }, []);

 const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);

 // Poll settings to get the dynamic phase index
 useEffect(() => {
 const fetchPhase = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/settings`);
 if (res.ok) {
 const data = await res.json();
 if (data.CurrentPhaseIndex !== undefined) {
 setCurrentPhaseIdx(parseInt(data.CurrentPhaseIndex, 10));
 }
 }
 } catch (err) {
 console.error('Error fetching roadmap phase in user helix:', err);
 }
 };

 fetchPhase();
 const interval = setInterval(fetchPhase, 5000);
 return () => clearInterval(interval);
 }, []);

 // Compute roadmapStages dynamically based on currentPhaseIdx
 const roadmapStages = useMemo(() => {
 return ROADMAP_STAGES.map((stage, idx) => {
 let status = 'upcoming';
 if (idx < currentPhaseIdx) {
 status = 'completed';
 } else if (idx === currentPhaseIdx) {
 status = 'current';
 }
 return { ...stage, status };
 });
 }, [currentPhaseIdx]);

 // Animate focus to the active stage when currentPhaseIdx changes
 useEffect(() => {
 const targetIdx = Math.min(ROADMAP_STAGES.length - 1, currentPhaseIdx);
 const progressVal = targetIdx / (ROADMAP_STAGES.length - 1);
 targetProgress.set(progressVal);
 setActiveIdx(targetIdx);
 activeIdxRef.current = targetIdx;
 }, [currentPhaseIdx, targetProgress]);

 // Mouse Parallax Tilt for true 3D physical object feedback
 const mouseX = useMotionValue(0);
 const mouseY = useMotionValue(0);

 const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, -20]), { stiffness: 350, damping: 30 });
 const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-25, 25]), { stiffness: 350, damping: 30 });

 // Silky smooth spring physics scrub for seamless transmission
 const smoothProgress = useSpring(targetProgress, {
 stiffness: 250,
 damping: 25,
 mass: 0.5,
 restDelta: 0.0001
 });

 // Keep active index updated — THROTTLED: only setActiveIdx when index actually changes
 useEffect(() => {
 const unsubscribe = smoothProgress.on('change', (val) => {
 const idx = Math.min(
 ROADMAP_STAGES.length - 1,
 Math.max(0, Math.round(val * (ROADMAP_STAGES.length - 1)))
 );
 if (idx !== activeIdxRef.current) {
 activeIdxRef.current = idx;
 setActiveIdx(idx);
 }
 });
 return () => unsubscribe();
 }, [smoothProgress]);

 // Mouse move tracking for 3D tilt
 const handleMouseMove = useCallback((e) => {
 if (!containerRef.current) return;
 const rect = containerRef.current.getBoundingClientRect();
 const x = (e.clientX - rect.left) / rect.width - 0.5;
 const y = (e.clientY - rect.top) / rect.height - 0.5;
 mouseX.set(x);
 mouseY.set(y);
 }, [mouseX, mouseY]);

 const handleMouseLeave = useCallback(() => {
 setIsHovered(false);
 mouseX.set(0);
 mouseY.set(0);
 }, [mouseX, mouseY]);

 // ── Momentum-Decay Wheel Handler ─────────────────────────────────────────
 // Each scroll event adds to a momentum value that decays by 85% per frame,
 // creating a natural coast-to-stop feel instead of an abrupt halt.
 const momentumRef = useRef(0);
 const rafRef = useRef(null);

 const runMomentumLoop = useCallback(() => {
 if (Math.abs(momentumRef.current) < 0.0001) {
 momentumRef.current = 0;
 rafRef.current = null;
 return;
 }
 const current = targetProgress.get();
 const next = Math.min(1, Math.max(0, current + momentumRef.current));
 targetProgress.set(next);
 // Decay: 85% retention per frame → smooth coast
 momentumRef.current *= 0.85;
 rafRef.current = requestAnimationFrame(runMomentumLoop);
 }, [targetProgress]);

 const handleWheel = useCallback((e) => {
 const currentVal = targetProgress.get();

 // At boundaries, release scroll back to the page
 if ((currentVal <= 0 && e.deltaY < 0) || (currentVal >= 1 && e.deltaY > 0)) {
 return;
 }

 e.preventDefault();
 e.stopPropagation();

 // Scale input: large mouse wheel → fixed nudge, fine trackpad → proportional
 const delta = Math.abs(e.deltaY) > 20
 ? Math.sign(e.deltaY) * 0.016
 : e.deltaY * 0.0005;

 // Add to running momentum (caps at ±0.06 to prevent over-flinging)
 momentumRef.current = Math.max(-0.06, Math.min(0.06, momentumRef.current + delta));

 // Start the decay loop if not already running
 if (!rafRef.current) {
 rafRef.current = requestAnimationFrame(runMomentumLoop);
 }
 }, [targetProgress, runMomentumLoop]);

 const hoverTimerRef = useRef(null);

 // In fullscreen mode: attach wheel listener immediately on mount.
 // In embedded mode: use hover-intent (400ms) to avoid hijacking page scroll.
 useEffect(() => {
 if (fullscreen && containerRef.current) {
 containerRef.current.addEventListener('wheel', handleWheel, { passive: false });
 return () => {
 containerRef.current?.removeEventListener('wheel', handleWheel);
 if (rafRef.current) cancelAnimationFrame(rafRef.current);
 };
 }
 }, [fullscreen, handleWheel]);

 const handleMouseEnterWithIntent = useCallback(() => {
 setIsHovered(true);
 if (fullscreen) return; // already attached
 hoverTimerRef.current = setTimeout(() => {
 containerRef.current?.addEventListener('wheel', handleWheel, { passive: false });
 }, 400);
 }, [fullscreen, handleWheel]);

 const handleMouseLeaveWithIntent = useCallback(() => {
 setIsHovered(false);
 mouseX.set(0);
 mouseY.set(0);
 if (fullscreen) return; // keep listener alive in fullscreen
 clearTimeout(hoverTimerRef.current);
 hoverTimerRef.current = null;
 containerRef.current?.removeEventListener('wheel', handleWheel);
 if (rafRef.current) {
 cancelAnimationFrame(rafRef.current);
 rafRef.current = null;
 momentumRef.current = 0;
 }
 }, [fullscreen, handleWheel, mouseX, mouseY]);


 // Programmatic navigation
 const goToStage = useCallback((idx) => {
 const progressVal = idx / (ROADMAP_STAGES.length - 1);
 targetProgress.set(progressVal);
 }, [targetProgress]);

 const nextStage = useCallback(() => {
 if (activeIdx < ROADMAP_STAGES.length - 1) {
 goToStage(activeIdx + 1);
 }
 }, [activeIdx, goToStage]);

 const prevStage = useCallback(() => {
 if (activeIdx > 0) {
 goToStage(activeIdx - 1);
 }
 }, [activeIdx, goToStage]);

 const angleStep = 55;
 const totalStages = ROADMAP_STAGES.length;

 return (
    <div className={`relative w-full overflow-hidden ${fullscreen ? 'h-full' : 'h-[600px] sm:h-[700px] rounded-2xl'}`}>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnterWithIntent}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeaveWithIntent}
        style={{ overscrollBehavior: 'contain', transform: 'translateZ(0)' }}
        className={`relative w-full flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden ${fullscreen
          ? 'h-full rounded-none bg-[radial-gradient(ellipse_at_top,rgba(2,20,40,1)_0%,rgba(1,12,24,1)_70%,rgba(0,6,12,1)_100%)]'
          : 'h-full bg-[radial-gradient(ellipse_at_top,rgba(2,20,40,1)_0%,rgba(1,12,24,1)_70%,rgba(0,6,12,1)_100%)]'
        }`}
      >
  {/* Inject crystal keyframes CSS */}
 <style>{crystalKeyframesCSS}</style>

 {/* Volumetric Blue Glow */}
 <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] aspect-square bg-[#0066FF]/15 rounded-full blur-[60px] sm:blur-[230px]" />
 </div>

 {/* Header Overlay */}
 <div className="relative z-20 w-full flex items-center justify-between gap-4 pb-3">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-400/50 text-blue-300 shadow-[0_0_20px_rgba(0,102,255,0.4)]">
 <FlaskConical className="w-4 h-4" />
 </div>
 <div>
 <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
 <span>Hackathon Roadmap</span>
 </h3>
 </div>
 </div>

 {/* Quick Prev / Next Step Controls */}
 <div className="flex items-center gap-1">
 <button
 onClick={prevStage}
 disabled={activeIdx === 0}
 className="p-2 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
 title="Previous Stage"
 >
 <ChevronUp className="w-4 h-4" />
 </button>
 <button
 onClick={nextStage}
 disabled={activeIdx === totalStages - 1}
 className="p-2 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
 title="Next Stage"
 >
 <ChevronDown className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* 3D Viewport Stage */}
 <div
 className="relative w-full flex-1 flex items-center justify-center z-10 my-2 px-2 sm:px-6"
 style={{ perspective: '1400px' }}
 >
 {/* 3D TILT CONTAINER */}
 <motion.div
 style={{
 rotateX: tiltX,
 rotateY: tiltY,
 scale: isMobile ? 0.45 : 1,
 transformStyle: 'preserve-3d'
 }}
 className="relative w-full h-full flex items-center justify-center"
 >
 {/* DEAD CENTER: GYROSCOPIC FUSION REACTOR CHAMBER (40% VIEWPORT WIDTH) */}
 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
 <GyroscopicFusionReactorChamber smoothProgress={smoothProgress} isMobile={isMobile} />
 </div>

 {/* DNA STRANDS HAVE BEEN REMOVED TO ALLOW CLEAN OPEN-AIR CRYSTAL GROWTH SYNTHESIS */}

 {/* ROADMAP STAGE CARDS ATTACHED VIA PRECISION TITANIUM ROBOTIC ARMS */}
 <div
 className="relative w-full h-full flex items-center justify-center z-20"
 style={{ transformStyle: 'preserve-3d' }}
 >
 {roadmapStages.map((stage, idx) => (
 <TitaniumRoboticArmCardItem
 key={stage.id}
 stage={stage}
 idx={idx}
 totalStages={totalStages}
 angleStep={angleStep}
 smoothProgress={smoothProgress}
 isActive={idx === activeIdx}
 isMobile={isMobile}
 onClick={() => goToStage(idx)}
 />
 ))}
 </div>
 </motion.div>
 </div>

 {/* Footer Navigation Bar */}
 <div className="relative z-20 w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
 {/* Stage Progress Indicators */}
 <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 border border-white/10 shadow-2xl">
 {roadmapStages.map((s, idx) => (
 <button
 key={s.id}
 onClick={() => goToStage(idx)}
 title={`${s.id}. ${s.name}`}
 className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${idx === activeIdx
 ? 'w-7 bg-[#00FF66] shadow-[0_0_14px_rgba(0,255,102,0.9)]'
 : idx < activeIdx
 ? 'w-2.5 bg-blue-400 hover:bg-blue-300'
 : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'
 }`}
 />
 ))}
 </div>

 {/* Current Stage Title Indicator */}
 <div className="text-[11px] font-mono text-slate-300 tracking-wider flex items-center gap-2">
 <span className="text-[#00FF66] font-bold">[{roadmapStages[activeIdx]?.id}]</span>
 <span className="text-white font-extrabold uppercase">{roadmapStages[activeIdx]?.name}</span>
 <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono font-bold ${roadmapStages[activeIdx]?.status === 'completed'
 ? 'bg-[#00FF66]/15 border-[#00FF66]/30 text-[#00FF66]'
 : 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.3)]'
 }`}>
 {roadmapStages[activeIdx]?.status}
 </span>
 </div>
 </div>
    </div>
    </div>
  );
}

// ─── 1. GYROSCOPIC FUSION REACTOR CHAMBER (40% VIEWPORT WIDTH) ────────────────
// OPTIMIZED: Crystals now use CSS @keyframes instead of 13 Framer Motion animation loops.
// The parent container still uses a single Framer Motion animation for slow rotation.
const GyroscopicFusionReactorChamber = React.memo(function GyroscopicFusionReactorChamber({ smoothProgress, isMobile }) {
 // Independent slow continuous rotation for the blue crystal core
 const slowCrystalRotateY = useTransform(smoothProgress, (p) => (p - 0.428) * 150);

 // 13 Levitating Irregular Cobalt-Blue Sapphire Crystal Shards (Growing Formation)
 const COBALT_CRYSTALS = useMemo(() => {
 const allCrystals = [
 // 1 Top Small
 { id: 1, yOffset: -220, xOffset: 0, zOffset: 0, width: 'w-4 sm:w-6', height: 'h-48 sm:h-56', clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', rotZ: 5, rotX: -10, rotY: 0, floatDelay: 0 },
 // 3 Medium Top
 { id: 2, yOffset: -140, xOffset: -30, zOffset: 20, width: 'w-8 sm:w-10', height: 'h-64 sm:h-72', clip: 'polygon(30% 0%, 85% 15%, 100% 70%, 55% 100%, 0% 65%, 10% 20%)', rotZ: 12, rotX: -15, rotY: 45, floatDelay: 0.3 },
 { id: 3, yOffset: -130, xOffset: 30, zOffset: -20, width: 'w-6 sm:w-8', height: 'h-60 sm:h-68', clip: 'polygon(20% 0%, 95% 25%, 80% 85%, 40% 100%, 0% 55%)', rotZ: -8, rotX: 18, rotY: -30, floatDelay: 0.6 },
 { id: 4, yOffset: -150, xOffset: 10, zOffset: 35, width: 'w-5 sm:w-7', height: 'h-56 sm:h-64', clip: 'polygon(40% 0%, 100% 30%, 75% 100%, 15% 85%, 0% 35%)', rotZ: 16, rotX: -12, rotY: 120, floatDelay: 0.9 },
 // 5 Large Center
 { id: 5, yOffset: -30, xOffset: -45, zOffset: 30, width: 'w-10 sm:w-12', height: 'h-80 sm:h-96', clip: 'polygon(25% 0%, 75% 0%, 100% 45%, 60% 100%, 0% 70%)', rotZ: -5, rotX: 8, rotY: -15, floatDelay: 1.1 },
 { id: 6, yOffset: 10, xOffset: 45, zOffset: -30, width: 'w-12 sm:w-14', height: 'h-96 sm:h-[420px]', clip: 'polygon(30% 0%, 90% 20%, 100% 80%, 50% 100%, 0% 60%)', rotZ: 10, rotX: -14, rotY: 60, floatDelay: 1.4 },
 { id: 7, yOffset: -10, xOffset: 0, zOffset: 55, width: 'w-10 sm:w-12', height: 'h-80 sm:h-96', clip: 'polygon(15% 0%, 80% 20%, 100% 75%, 45% 100%, 0% 45%)', rotZ: 14, rotX: -18, rotY: -75, floatDelay: 1.7 },
 { id: 8, yOffset: 30, xOffset: -25, zOffset: -50, width: 'w-8 sm:w-10', height: 'h-72 sm:h-80', clip: 'polygon(35% 0%, 90% 35%, 65% 100%, 10% 80%, 0% 25%)', rotZ: -12, rotX: 15, rotY: 135, floatDelay: 2.0 },
 { id: 9, yOffset: 0, xOffset: 25, zOffset: 45, width: 'w-10 sm:w-12', height: 'h-80 sm:h-96', clip: 'polygon(20% 10%, 80% 0%, 100% 60%, 70% 100%, 10% 80%)', rotZ: 5, rotX: 5, rotY: -120, floatDelay: 2.3 },
 // 3 Medium Bottom
 { id: 10, yOffset: 120, xOffset: -35, zOffset: 15, width: 'w-8 sm:w-10', height: 'h-64 sm:h-72', clip: 'polygon(50% 0%, 100% 40%, 70% 100%, 20% 90%, 0% 30%)', rotZ: 8, rotX: -10, rotY: 85, floatDelay: 2.6 },
 { id: 11, yOffset: 140, xOffset: 35, zOffset: -15, width: 'w-6 sm:w-8', height: 'h-60 sm:h-68', clip: 'polygon(40% 0%, 100% 25%, 85% 85%, 35% 100%, 0% 65%)', rotZ: -15, rotX: 12, rotY: -45, floatDelay: 2.9 },
 { id: 12, yOffset: 160, xOffset: 0, zOffset: 30, width: 'w-5 sm:w-7', height: 'h-56 sm:h-64', clip: 'polygon(25% 10%, 85% 0%, 100% 70%, 60% 100%, 0% 80%)', rotZ: 20, rotX: -20, rotY: 150, floatDelay: 3.2 },
 // 1 Bottom Small
 { id: 13, yOffset: 230, xOffset: 0, zOffset: 0, width: 'w-4 sm:w-6', height: 'h-48 sm:h-56', clip: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', rotZ: -10, rotX: 15, rotY: 0, floatDelay: 3.5 },
 ];
 return isMobile ? allCrystals.slice(4, 9) : allCrystals;
 }, [isMobile]);

 return (
 <div className="relative w-full max-w-[360px] sm:max-w-[480px] h-[500px] sm:h-[620px] flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
 {/* Soft Volumetric Blue Fog */}
 <div className="absolute inset-0 pointer-events-none z-0">
 <div className="absolute inset-0 bg-[#0066FF]/10 blur-[20px] sm:blur-[45px] rounded-full" style={{ animation: 'crystalGlow 4s ease-in-out infinite' }} />
 </div>

 {/* FLOATING COBALT-BLUE SAPPHIRE CRYSTAL CLUSTER INSIDE CHAMBER */}
 <motion.div
 animate={{
 rotateY: [0, 360],
 }}
 transition={{
 repeat: Infinity,
 duration: 35, // Rotates very slowly on its own
 ease: "linear"
 }}
 style={{
 rotateY: slowCrystalRotateY,
 transformStyle: 'preserve-3d',
 }}
 className="relative w-72 h-[680px] sm:w-96 sm:h-[760px] flex items-center justify-center z-10"
 >
 {/* Soft Cobalt Blue Core Volumetric Glow */}
 <div className="absolute w-40 h-[600px] rounded-full bg-[#0066FF]/20 blur-[30px] sm:blur-[60px] z-0" />

 {/* 13 LEVITATING COBALT-BLUE SAPPHIRE CRYSTAL SHARDS — CSS KEYFRAME ANIMATED */}
 {COBALT_CRYSTALS.map((crystal) => {
 // Pre-compute the CSS custom properties for start/mid keyframes
 const duration = 5 + (crystal.id % 4);
 const startTransform = `translate(-50%, -50%) translateX(${crystal.xOffset}px) translateY(${crystal.yOffset - 6}px) translateZ(${crystal.zOffset}px) rotateZ(${crystal.rotZ - 4}deg) rotateY(${crystal.rotY - 8}deg)`;
 const midTransform = `translate(-50%, -50%) translateX(${crystal.xOffset}px) translateY(${crystal.yOffset + 6}px) translateZ(${crystal.zOffset}px) rotateZ(${crystal.rotZ + 4}deg) rotateY(${crystal.rotY + 8}deg)`;

 return (
 <div
 key={crystal.id}
 style={{
 '--crystal-start': startTransform,
 '--crystal-mid': midTransform,
 position: 'absolute',
 top: '50%',
 left: '50%',
 transform: startTransform,
 animation: `crystalFloat ${duration}s ease-in-out ${crystal.floatDelay}s infinite`,
 transformStyle: 'preserve-3d',
 }}
 className="flex items-center justify-center"
 >
 {/* Internal Glowing Blue Energy Vein Core */}
 <div
 className="absolute w-3.5 h-3/5 bg-white/95 shadow-[0_0_35px_#0066FF] rounded-full z-20"
 style={{ animation: 'crystalGlow 3s ease-in-out infinite' }}
 />

 {/* Front Cobalt-Blue Glass Facet — backdrop-blur REMOVED (invisible behind opaque gradient) */}
 <div
 className={`absolute ${crystal.width} ${crystal.height} bg-gradient-to-b from-[#0066FF]/95 via-[#0033CC]/85 to-blue-950/98 border border-cyan-300/60 shadow-[0_0_45px_rgba(0,102,255,0.7)]`}
 style={{
 clipPath: crystal.clip,
 transform: `rotateX(${crystal.rotX}deg) translateZ(12px)`
 }}
 />

 {/* Rear Refractive Cobalt Glass Facet — backdrop-blur REMOVED */}
 <div
 className={`absolute ${crystal.width} ${crystal.height} bg-gradient-to-tr from-sky-400/70 via-blue-900/60 to-black/95 border border-sky-300/50 shadow-[inset_0_0_30px_#0066FF]`}
 style={{
 clipPath: crystal.clip,
 transform: `rotateX(${crystal.rotX}deg) rotateY(180deg) translateZ(-12px)`
 }}
 />

 {/* Electrical Arcs bridging nearby Shards (only on some shards) */}
 {crystal.id % 2 === 0 && (
 <div
 className="absolute -bottom-10 w-1 h-12 bg-gradient-to-b from-cyan-300 to-transparent shadow-[0_0_15px_#00FFFF] z-30 opacity-70"
 style={{ animation: 'crystalGlow 2s ease-in-out infinite' }}
 />
 )}
 </div>
 );
 })}

 </motion.div>
 </div>
 );
});

// ─── 3. ROADMAP CARD ATTACHED VIA PRECISION TITANIUM ROBOTIC ARM ─────────────────
// OPTIMIZED: Single useTransform per card instead of 6 separate ones.
const TitaniumRoboticArmCardItem = React.memo(function TitaniumRoboticArmCardItem({ stage, idx, totalStages, angleStep, smoothProgress, isActive, onClick, isMobile }) {
 const Icon = stage.icon;
 const isCompleted = stage.status === 'completed';
 const isCurrent = stage.status === 'current';
 const isUpcoming = stage.status === 'upcoming';

 const themeStyles = useMemo(() => ({
 completed: {
 hex: '#00FF66',
 bgActive: 'bg-[#00FF66]/20',
 bgDim: 'bg-[#00FF66]/10',
 borderActive: 'border-[#00FF66]',
 borderDim: 'border-[#00FF66]/30',
 shadowActive: 'shadow-[0_0_45px_rgba(0,255,102,0.45)]',
 shadowDim: 'shadow-[0_0_20px_rgba(0,255,102,0.15)]',
 shadowText: 'drop-shadow-[0_0_10px_rgba(0,255,102,0.6)]',
 ring: 'ring-[#00FF66]/60',
 textActive: 'text-[#00FF66]',
 textDim: 'text-emerald-400',
 gradientVia: 'via-[#00FF66]',
 },
 current: {
 hex: '#00AAFF',
 bgActive: 'bg-[#00AAFF]/20',
 bgDim: 'bg-[#00AAFF]/15',
 borderActive: 'border-[#00AAFF]',
 borderDim: 'border-[#00AAFF]/40',
 shadowActive: 'shadow-[0_0_45px_rgba(0,170,255,0.45)]',
 shadowDim: 'shadow-[0_0_20px_rgba(0,170,255,0.25)]',
 shadowText: 'drop-shadow-[0_0_10px_rgba(0,170,255,0.6)]',
 ring: 'ring-[#00AAFF]/60',
 textActive: 'text-[#00AAFF]',
 textDim: 'text-cyan-400',
 gradientVia: 'via-[#00AAFF]',
 },
 upcoming: {
 hex: '#FFD700',
 bgActive: 'bg-[#FFD700]/20',
 bgDim: 'bg-[#FFD700]/10',
 borderActive: 'border-[#FFD700]',
 borderDim: 'border-[#FFD700]/25',
 shadowActive: 'shadow-[0_0_45px_rgba(255,215,0,0.45)]',
 shadowDim: 'shadow-[0_0_20px_rgba(255,215,0,0.1)]',
 shadowText: 'drop-shadow-[0_0_10px_rgba(255,215,0,0.6)]',
 ring: 'ring-[#FFD700]/60',
 textActive: 'text-[#FFD700]',
 textDim: 'text-yellow-400',
 gradientVia: 'via-[#FFD700]',
 }
 }), []);

 const t = themeStyles[stage.status] || themeStyles.upcoming;

 // OPTIMIZED: Single useTransform computes ALL spatial properties at once
 // Instead of 6 separate subscriptions (48 total for 8 cards), this is 1 per card (8 total)
 const combinedStyle = useTransform(smoothProgress, (p) => {
 const stageProgress = p * (totalStages - 1);
 const relativePos = idx - stageProgress;
 const yVal = relativePos * 60;
 const angleVal = relativePos * angleStep;
 const rad = (angleVal * Math.PI) / 180;
 const cosVal = Math.cos(rad);
 const sinVal = Math.sin(rad);

 const opacityVal = Math.max(0.18, (cosVal + 1.2) / 2.2);
 const scaleVal = 0.8 + 0.26 * Math.max(0, cosVal);
 const zIndexVal = Math.round(cosVal * 160) + 250;
 const xVal = sinVal * 260;
 const zVal = cosVal * 180;

 return {
 transform: `translate(-50%, -50%) translate3d(${xVal}px, ${yVal}px, ${zVal}px) scale(${scaleVal})`,
 opacity: opacityVal,
 zIndex: zIndexVal,
 };
 });

 // Extract individual motion values from the combined computation
 const transformStr = useTransform(combinedStyle, (s) => s.transform);
 const opacityVal = useTransform(combinedStyle, (s) => s.opacity);
 const zIndexVal = useTransform(combinedStyle, (s) => s.zIndex);

 return (
 <motion.div
 onClick={onClick}
 style={{
 transform: transformStr,
 opacity: opacityVal,
 zIndex: zIndexVal,
 transformStyle: 'preserve-3d',
 position: 'absolute',
 top: '50%',
 left: '50%',
 willChange: 'transform, opacity'
 }}
 className="pointer-events-auto cursor-pointer"
 >

 {/* Main Dark Glass Card */}
 <div
 className={`relative w-full max-w-[250px] sm:max-w-[300px] p-3.5 sm:p-4 rounded-xl transition-all duration-300 border ${isActive
 ? `bg-zinc-950/95 ${t.borderActive} ${t.shadowActive} ring-1 ${t.ring}`
 : `bg-zinc-950/80 ${t.borderDim} ${t.shadowDim} hover:${t.borderActive}`
 }`}
 >

 {/* Card Header Row */}
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <div className={`p-2 rounded-lg border ${isActive ? `${t.bgActive} ${t.borderActive} ${t.textActive}` : `${t.bgDim} ${t.borderDim} ${t.textDim}`
 }`}>
 <Icon className="w-4 h-4" />
 </div>

 <div>
 <span className={`text-[9px] font-mono uppercase tracking-widest block font-bold ${isActive ? t.textActive : t.textDim
 }`}>
 {stage.phase}
 </span>
 <span className="text-[10px] font-mono text-slate-400 block">
 {stage.date}
 </span>
 </div>
 </div>

 {/* Status Badge — animate-pulse ONLY on active card */}
 <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${isActive ? `${t.bgActive} ${t.borderActive} ${t.textActive} animate-pulse` : `${t.bgDim} ${t.borderDim} ${t.textDim}`
 }`}>
 {stage.status || 'UPCOMING'}
 </span>
 </div>

 {/* Stage Title */}
 <h3 className={`text-xs sm:text-base font-bold font-mono uppercase tracking-wider mb-1 ${isActive ? `text-white ${t.shadowText}` : 'text-slate-200'
 }`}>
 {stage.id}. {stage.name}
 </h3>

 {/* Stage Description */}
 <p className={`text-[10px] sm:text-[11px] font-sans leading-relaxed ${isActive ? 'text-slate-200 font-medium' : 'text-slate-400'
 }`}>
 {stage.desc}
 </p>

 {/* 3D Card Edge Thickness Layer */}
 <div
 className={`absolute inset-0 rounded-xl border-b-4 border-r-4 opacity-40 pointer-events-none ${isActive ? t.borderActive : t.borderDim
 }`}
 style={{ transform: 'translateZ(-8px)' }}
 />
 </div>
 </motion.div>
 );
});
