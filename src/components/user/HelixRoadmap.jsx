import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useMotionValueEvent, useAnimationFrame } from 'framer-motion';
import {
  UserCheck, FileCode, Search, Code, Cpu, ShieldCheck, Award, Flag,
  ChevronUp, ChevronDown, FlaskConical
} from 'lucide-react';
import AcmHeroEmblem from '../AcmHeroEmblem';
import { API_BASE_URL } from '../../utils/api';

const BASE_ROADMAP_STAGES = [
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

const crystalKeyframesCSS = `
@keyframes crystalFloat {
  0%, 100% { transform: translateY(-15px) rotateX(-25deg); }
  50% { transform: translateY(15px) rotateX(-25deg); }
}
@keyframes crystalGlow {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}
`;

export default function HelixRoadmap({ fullscreen = false }) {
  const containerRef = useRef(null);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const hasInitialized = useRef(false);
  const lastPhaseRef = useRef(-1);
  
  // Define these before fetchSettings so we can update them on initial fetch
  const targetProgress = useMotionValue(0);
  const smoothProgress = useSpring(targetProgress, { damping: 20, stiffness: 100, mass: 0.8 });

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        const phaseIdx = data.CurrentPhaseIndex !== undefined ? parseInt(data.CurrentPhaseIndex, 10) : 0;
        setCurrentPhaseIndex(phaseIdx);

        if (phaseIdx !== lastPhaseRef.current) {
          const progressVal = phaseIdx / (BASE_ROADMAP_STAGES.length - 1);
          targetProgress.set(progressVal);
          
          if (!hasInitialized.current) {
            hasInitialized.current = true;
            if (smoothProgress.set) smoothProgress.set(progressVal);
          }
          lastPhaseRef.current = phaseIdx;
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  const ROADMAP_STAGES = useMemo(() => {
    return BASE_ROADMAP_STAGES.map((stage, idx) => {
      let status = 'upcoming';
      if (idx < currentPhaseIndex) status = 'completed';
      else if (idx === currentPhaseIndex) status = 'current';
      return { ...stage, status };
    });
  }, [currentPhaseIndex]);

  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  
  const globalRotation = useMotionValue(0);
  useAnimationFrame((time, delta) => {
    globalRotation.set(globalRotation.get() + (delta * 0.015));
  });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  useMotionValueEvent(smoothProgress, "change", (latest) => {
    let closestIdx = Math.round(latest * (BASE_ROADMAP_STAGES.length - 1));
    closestIdx = Math.max(0, Math.min(BASE_ROADMAP_STAGES.length - 1, closestIdx));
    if (closestIdx !== activeIdxRef.current) {
      activeIdxRef.current = closestIdx;
      setActiveIdx(closestIdx);
    }
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Link cursor movement directly to the 3D tilt
  const tiltX = useTransform(mouseY, [-0.5, 0.5], [10, -30]); 
  const tiltY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }, [mouseX, mouseY]);

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
    momentumRef.current *= 0.85;
    rafRef.current = requestAnimationFrame(runMomentumLoop);
  }, [targetProgress]);

  const handleWheel = useCallback((e) => {
    const currentVal = targetProgress.get();
    if ((currentVal <= 0 && e.deltaY < 0) || (currentVal >= 1 && e.deltaY > 0)) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = Math.abs(e.deltaY) > 20 ? Math.sign(e.deltaY) * 0.016 : e.deltaY * 0.0005;
    momentumRef.current = Math.max(-0.06, Math.min(0.06, momentumRef.current + delta));
    if (!rafRef.current) rafRef.current = requestAnimationFrame(runMomentumLoop);
  }, [targetProgress, runMomentumLoop]);

  const hoverTimerRef = useRef(null);

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
    if (fullscreen) return;
    hoverTimerRef.current = setTimeout(() => {
      containerRef.current?.addEventListener('wheel', handleWheel, { passive: false });
    }, 400);
  }, [fullscreen, handleWheel]);

  const handleMouseLeaveWithIntent = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    if (fullscreen) return;
    clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    containerRef.current?.removeEventListener('wheel', handleWheel);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      momentumRef.current = 0;
    }
  }, [fullscreen, handleWheel, mouseX, mouseY]);

  const goToStage = useCallback((idx) => {
    const progressVal = idx / (BASE_ROADMAP_STAGES.length - 1);
    targetProgress.set(progressVal);
  }, [targetProgress]);

  const nextStage = useCallback(() => {
    if (activeIdx < BASE_ROADMAP_STAGES.length - 1) goToStage(activeIdx + 1);
  }, [activeIdx, goToStage]);

  const prevStage = useCallback(() => {
    if (activeIdx > 0) goToStage(activeIdx - 1);
  }, [activeIdx, goToStage]);

  const totalStages = BASE_ROADMAP_STAGES.length;
  const angleStep = 360 / totalStages; // 45 degrees for 8 cards

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
        <style>{crystalKeyframesCSS}</style>

        {/* Volumetric Blue Glow */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[900px] aspect-square bg-[#0066FF]/15 rounded-full blur-[60px] sm:blur-[230px]" />
        </div>

        {/* Header Overlay */}
        <div className="relative z-20 w-full flex items-center justify-between gap-4 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-400/50 text-[#00FFFF]/90 shadow-[0_0_20px_rgba(0,102,255,0.4)]">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <span>Hackathon Roadmap</span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevStage} disabled={activeIdx === 0} className="p-2 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400 text-white disabled:opacity-30 transition-colors cursor-pointer" title="Previous Stage"><ChevronUp className="w-4 h-4" /></button>
            <button onClick={nextStage} disabled={activeIdx === totalStages - 1} className="p-2 rounded-lg bg-black/60 border border-white/10 hover:border-cyan-400 text-white disabled:opacity-30 transition-colors cursor-pointer" title="Next Stage"><ChevronDown className="w-4 h-4" /></button>
          </div>
        </div>

        {/* 3D Viewport Stage */}
        <div className="relative flex-1 w-full flex items-center justify-center perspective-[1200px] mt-10">
          <motion.div
            style={{ rotateX: tiltX, rotateY: tiltY, scale: isMobile ? 0.45 : 1, transformStyle: 'preserve-3d' }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* ROADMAP 3D SPACE */}
            <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
              <GyroscopicFusionReactorChamber smoothProgress={smoothProgress} isMobile={isMobile} globalRotation={globalRotation} />
              
              {ROADMAP_STAGES.map((stage, idx) => (
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
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-black/80 border border-white/10 shadow-2xl">
            {ROADMAP_STAGES.map((s, idx) => (
              <button key={s.id} onClick={() => goToStage(idx)} title={`${s.id}. ${s.name}`} className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${idx === activeIdx ? 'w-7 bg-[#3B82F6] shadow-[0_0_14px_rgba(0,255,255,0.9)]' : idx < activeIdx ? 'w-2.5 bg-blue-400 hover:bg-blue-300' : 'w-2.5 bg-zinc-700 hover:bg-zinc-500'}`} />
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-300 tracking-wider flex items-center gap-2">
            <span className="text-[#00FFFF] font-bold">[{ROADMAP_STAGES[activeIdx]?.id}]</span>
            <span className="text-white font-extrabold uppercase">{ROADMAP_STAGES[activeIdx]?.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-mono font-bold ${ROADMAP_STAGES[activeIdx]?.status === 'completed' ? 'bg-[#3B82F6]/15 border-[#3B82F6]/30 text-[#00FFFF]' : 'bg-[#3B82F6]/20 border-[#3B82F6]/50 text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.3)]'}`}>
              {ROADMAP_STAGES[activeIdx]?.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const GyroscopicFusionReactorChamber = React.memo(function GyroscopicFusionReactorChamber({ smoothProgress, isMobile, globalRotation }) {
  const slowCrystalRotateY = useTransform(smoothProgress, (p) => (p - 0.428) * 150);

  const W = isMobile ? 150 : 220; // Increased size of the 3D crystal
  const H = W * 0.951056; // aspect ratio of pentagon bounding box
  const a = W / 1.618034; // edge length
  const tz = a * 1.113516; // inradius for Z translation
  
  const dihedral = 116.56505;
  const tilt = 180 - dihedral; // 63.43495

  const faces = [];
  
  // Top face
  faces.push({ id: 'top', transform: `rotateX(90deg) translateZ(${tz}px)` });
  // Bottom face
  faces.push({ id: 'bottom', transform: `rotateX(-90deg) rotateZ(180deg) translateZ(${tz}px)` });
  
  // Upper ring
  for (let i = 0; i < 5; i++) {
    faces.push({ id: `u-${i}`, transform: `rotateY(${i * 72}deg) rotateX(${90 - tilt}deg) rotateZ(180deg) translateZ(${tz}px)` });
  }
  
  // Lower ring
  for (let i = 0; i < 5; i++) {
    faces.push({ id: `l-${i}`, transform: `rotateY(${i * 72 + 36}deg) rotateX(${tilt - 90}deg) translateZ(${tz}px)` });
  }

  // The center of the pentagon is roughly at 55.27% height from the top.
  const originY = 55.27;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d', animation: 'crystalFloat 6s ease-in-out infinite' }}>
      <motion.div style={{ rotateY: slowCrystalRotateY, transformStyle: 'preserve-3d' }} className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          style={{ 
            width: W, height: H,
            rotateY: globalRotation, 
            y: isMobile ? -60 : -100,
            transformStyle: 'preserve-3d'
          }} 
          className="relative flex items-center justify-center"
        >
          <div className="absolute w-40 h-[400px] rounded-full bg-[#3B82F6]/30 blur-[40px] z-0" />

        {faces.map((face) => (
          <div 
            key={face.id}
            className="absolute flex items-center justify-center pointer-events-none" 
            style={{ 
              width: W, height: H, top: 0, left: 0,
              transformOrigin: `50% ${originY}%`,
              transform: face.transform,
              backfaceVisibility: 'hidden'
            }}
          >
            <svg width={W} height={H} viewBox="0 0 100 95.1" className="absolute">
              <defs>
                <linearGradient id="pentGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00A3FF" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#0055FF" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#002288" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <polygon 
                points="50,0 100,36.32 80.9,95.1 19.1,95.1 0,36.32" 
                fill="url(#pentGrad)" 
                stroke="#22d3ee" 
                strokeWidth="1.5" 
                strokeLinejoin="round" 
              />
            </svg>
            
            <div 
              className="z-10 absolute flex items-center justify-center will-change-transform" 
              style={{ transform: `translateY(10%) scale(0.9) ${(face.id === 'bottom' || face.id.startsWith('u-')) ? 'rotateZ(180deg)' : ''}` }}
            >
              <AcmHeroEmblem size={isMobile ? 90 : 140} />
            </div>
          </div>
        ))}
        </motion.div>
      </motion.div>
    </div>
  );
});

const TitaniumRoboticArmCardItem = React.memo(function TitaniumRoboticArmCardItem({ stage, idx, totalStages, angleStep, smoothProgress, isActive, onClick, isMobile }) {
 const Icon = stage.icon;
 
 const themeStyles = useMemo(() => ({
  completed: { hex: '#3B82F6', borderActive: 'border-[#3B82F6]', bgActive: 'bg-[#3B82F6]/20', textActive: 'text-[#3B82F6]', shadowActive: 'shadow-[0_0_45px_rgba(59,130,246,0.45)]', borderDim: 'border-[#3B82F6]/30', bgDim: 'bg-[#3B82F6]/10', textDim: 'text-[#3B82F6]/70', shadowDim: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
  current: { hex: '#00FFFF', borderActive: 'border-[#00FFFF]', bgActive: 'bg-[#00FFFF]/20', textActive: 'text-[#00FFFF]', shadowActive: 'shadow-[0_0_45px_rgba(0,255,255,0.45)]', borderDim: 'border-[#00FFFF]/40', bgDim: 'bg-[#00FFFF]/15', textDim: 'text-[#00FFFF]', shadowDim: 'shadow-[0_0_20px_rgba(0,255,255,0.25)]' },
  upcoming: { hex: '#64748B', borderActive: 'border-slate-500', bgActive: 'bg-slate-500/20', textActive: 'text-slate-400', shadowActive: 'shadow-[0_0_30px_rgba(100,116,139,0.3)]', borderDim: 'border-slate-500/25', bgDim: 'bg-slate-500/10', textDim: 'text-slate-500', shadowDim: 'shadow-[0_0_15px_rgba(100,116,139,0.1)]' }
 }), []);

 const t = themeStyles[stage.status] || themeStyles.upcoming;

 const combinedStyle = useTransform(() => {
    const p = smoothProgress.get();
    const stageProgress = p * (totalStages - 1);
    const relativePos = idx - stageProgress;
    const yVal = isMobile ? 100 : 160; 
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

 const transformStr = useTransform(combinedStyle, (s) => s.transform);
 const opacityVal = useTransform(combinedStyle, (s) => s.opacity);
 const zIndexVal = useTransform(combinedStyle, (s) => s.zIndex);

 return (
  <motion.div onClick={onClick} style={{ transform: transformStr, opacity: opacityVal, zIndex: zIndexVal, transformStyle: 'preserve-3d', position: 'absolute', top: '50%', left: '50%', willChange: 'transform, opacity' }} className="pointer-events-auto cursor-pointer">
  <div className={`relative w-full max-w-[250px] sm:max-w-[300px] p-3.5 sm:p-4 rounded-xl transition-all duration-300 border ${isActive ? `bg-zinc-950/95 ${t.borderActive} ${t.shadowActive} ring-1 ${t.ring}` : `bg-zinc-950/80 ${t.borderDim} ${t.shadowDim} hover:${t.borderActive}`}`}>
  <div className="flex items-center justify-between mb-2">
  <div className="flex items-center gap-2">
  <div className={`p-2 rounded-lg border ${isActive ? `${t.bgActive} ${t.borderActive} ${t.textActive}` : `${t.bgDim} ${t.borderDim} ${t.textDim}`}`}>
  <Icon className="w-4 h-4" />
  </div>
  <span className={`text-[10px] font-mono tracking-widest ${isActive ? t.textActive : 'text-slate-400'}`}>{stage.phase}</span>
  </div>
  <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${isActive ? `${t.bgActive} ${t.borderActive} ${t.textActive} animate-pulse` : `${t.bgDim} ${t.borderDim} ${t.textDim}`}`}>
  {stage.status || 'UPCOMING'}
  </span>
  </div>
  <h3 className={`text-xs sm:text-base font-bold font-mono uppercase tracking-wider mb-1 ${isActive ? `text-white ${t.shadowText}` : 'text-slate-200'}`}>{stage.id}. {stage.name}</h3>
  <p className={`text-[10px] sm:text-[11px] font-sans leading-relaxed ${isActive ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>{stage.desc}</p>
  <div className={`absolute inset-0 rounded-xl border-b-4 border-r-4 opacity-40 pointer-events-none ${isActive ? t.borderActive : t.borderDim}`} style={{ transform: 'translateZ(-8px)' }} />
  </div>
  </motion.div>
 );
});
