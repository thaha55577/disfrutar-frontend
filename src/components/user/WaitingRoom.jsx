import React, { useState, useEffect, useRef } from 'react';
import { Terminal, AlertTriangle, LogOut } from 'lucide-react';
import { fetchStartTime } from '../../utils/api';
import { getTeamId, logoutTeam } from '../../utils/auth';

import AnimatedBackground from '../AnimatedBackground';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Animated Analog Clock SVG ─── */
function AnalogClock({ timeLeft, totalDuration, danger, critical }) {
 const size = 220;
 const cx = size / 2;
 const cy = size / 2;
 const r = 90;

 const totalSecs = totalDuration || 1;
 const remaining = timeLeft ?? 0;

 // Second hand: rotates 360° every 60 seconds
 const secAngle = ((remaining % 60) / 60) * 360;
 // Minute hand: rotates 360° over the full duration (or per minute)
 const minAngle = ((remaining % 3600) / 3600) * 360;
 // Hour hand (subtle, over full duration)
 const hourAngle = (remaining / totalSecs) * 360;

 const toXY = (angleDeg, length) => {
 const rad = ((angleDeg - 90) * Math.PI) / 180;
 return {
 x: cx + Math.cos(rad) * length,
 y: cy + Math.sin(rad) * length,
 };
 };

 // Tick marks
 const ticks = Array.from({ length: 60 }, (_, i) => {
 const isMajor = i % 5 === 0;
 const inner = r - (isMajor ? 14 : 8);
 const outer = r - 2;
 const angle = (i / 60) * 360;
 const start = toXY(angle, inner);
 const end = toXY(angle, outer);
 return { start, end, isMajor };
 });

 const secPos = toXY(secAngle, r - 18);
 const secTail = toXY(secAngle + 180, 20); // Counter-balance

 const minPos = toXY(minAngle, r - 28);
 const minTail = toXY(minAngle + 180, 12); // Counter-balance

 const hourPos = toXY(hourAngle, r - 45);

 const baseColor = critical ? 'rgba(239,68,68,' : danger ? 'rgba(249,115,22,' : 'rgba(0,255,102,';
 const accentColor = critical ? '#ef4444' : danger ? '#f97316' : '#00FF66';

 return (
 <svg
 width={size}
 height={size}
 viewBox={`0 0 ${size} ${size}`}
 className={`drop-shadow-[0_0_30px_${baseColor}0.5)] mb-4`}
 >

 {/* Outer glow ring */}
 <circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={`${baseColor}0.12)`} strokeWidth="16" />
 {/* Clock face */}
 <circle cx={cx} cy={cy} r={r} fill="#050807" stroke={`${baseColor}0.35)`} strokeWidth="2" />
 {/* Inner subtle ring */}
 <circle cx={cx} cy={cy} r={r - 6} fill="none" stroke={`${baseColor}0.08)`} strokeWidth="1" />

 {/* Tick marks */}
 {ticks.map((t, i) => (
 <line
 key={i}
 x1={t.start.x} y1={t.start.y}
 x2={t.end.x} y2={t.end.y}
 stroke={t.isMajor ? `${baseColor}0.7)` : `${baseColor}0.25)`}
 strokeWidth={t.isMajor ? 2 : 1}
 strokeLinecap="round"
 />
 ))}


 {/* Minute hand */}
 <line
 x1={minTail.x} y1={minTail.y}
 x2={minPos.x} y2={minPos.y}
 stroke={`${baseColor}0.9)`}
 strokeWidth="3"
 strokeLinecap="round"
 />
 {/* Minute hand tip */}
 <circle cx={minPos.x} cy={minPos.y} r="3" fill={`${baseColor}1)`} />

 {/* Second hand */}
 <line
 x1={secTail.x} y1={secTail.y}
 x2={secPos.x} y2={secPos.y}
 stroke={accentColor}
 strokeWidth="1.5"
 strokeLinecap="round"
 />
 {/* Second hand tip */}
 <circle cx={secPos.x} cy={secPos.y} r="2" fill={accentColor} />
 <circle cx={secPos.x} cy={secPos.y} r="6" fill="none" stroke={accentColor} strokeWidth="1" opacity="0.5" />

 {/* Center pivot */}
 <circle cx={cx} cy={cy} r={5} fill={accentColor} />
 <circle cx={cx} cy={cy} r={2.5} fill="#050807" />
 </svg>
 );
}

/* ─── Digital digit flip segment ─── */
function DigitBlock({ value, label, danger, critical }) {
 const str = String(value).padStart(2, '0');

 const textColor = critical ? 'text-red-500' : danger ? 'text-orange-500' : 'text-[#00FF66]';
 const shadowColor = critical ? 'rgba(239,68,68,0.8)' : danger ? 'rgba(249,115,22,0.8)' : 'rgba(0,255,102,0.8)';
 const borderColor = critical ? 'border-red-500/50' : danger ? 'border-orange-500/50' : 'border-[#00FF66]/30';
 const bgColor = critical ? 'bg-red-500/10' : danger ? 'bg-orange-500/10' : 'bg-black/60';

 return (
 <div className="flex flex-col items-center gap-2">
 <div className={`relative w-[25vw] h-[25vw] max-w-[110px] max-h-[110px] sm:max-w-[150px] sm:max-h-[150px] sm:w-[150px] sm:h-[150px] ${bgColor} ${borderColor} border-2 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,102,0.1),inset_0_2px_0_rgba(0,255,102,0.2)] glass-panel overflow-hidden`}>
 {/* Scan line */}
 <div className="absolute inset-x-0 top-1/2 -translate-y-px h-0.5 bg-black/50 z-10 shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
 <motion.span
 key={value}
 initial={{ rotateX: 90, opacity: 0 }}
 animate={{ rotateX: 0, opacity: 1 }}
 transition={{ duration: 0.3, type: "spring", stiffness: 150 }}
 className={`text-6xl sm:text-7xl font-black font-orbitron tabular-nums text-white`}
 style={{
 textShadow: `0 0 10px ${shadowColor}, 0 0 20px ${shadowColor.replace('0.8', '0.5')}`
 }}>
 {str}
 </motion.span>
 </div>
 <span className={`text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold ${critical ? 'text-red-400' : danger ? 'text-orange-400' : 'text-[#00FF66]/70'}`}>{label}</span>
 </div>
 );
}

/* ─── Main WaitingRoom ─── */
export default function WaitingRoom({ onTimerComplete, onLogout, initialStartTime }) {
 const [startTime, setStartTime] = useState(initialStartTime || null);
 const [totalDuration, setTotalDuration] = useState(null);
 const [timeLeft, setTimeLeft] = useState(null);
 const [loading, setLoading] = useState(!initialStartTime);
 const [systemLogs, setSystemLogs] = useState(['Initializing secure handshakes...']);
 const teamId = getTeamId();
 const completedRef = useRef(false);

 // Immersion logs
 useEffect(() => {
 const logs = [
 'Establishing tunnel to mainframe...',
 'Decrypting dashboard elements...',
 'Anti-cheat sentinel initialized.',
 'Awaiting synchronized timestamp...',
 ];
 logs.forEach((log, i) => {
 setTimeout(() => setSystemLogs(prev => [...prev, log]), (i + 1) * 1500);
 });
 }, []);

 // Fetch expiry time from backend
 useEffect(() => {
 let active = true;
 fetchStartTime().then(({ timestamp, serverTime }) => {
 if (!active) return;
 if (timestamp) {
 setStartTime(timestamp);
 setLoading(false);
 setSystemLogs(prev => [
 ...prev,
 `Sync complete. Expiry: ${new Date(timestamp * 1000).toLocaleTimeString()}`,
 ]);
 // Compute total duration from serverTime
 if (serverTime) {
 const dur = timestamp - serverTime;
 setTotalDuration(dur > 0 ? dur : 15);
 window.__timerClockOffsetMs = (serverTime * 1000) - Date.now();
 }
 }
 });
 return () => { active = false; };
 }, []);

 // Countdown tick
 useEffect(() => {
 if (startTime === null) return;

 const tick = () => {
 if (!startTime) return false;
 const offsetMs = window.__timerClockOffsetMs || 0;
 const currentServerMs = Date.now() + offsetMs;
 const targetMs = startTime * 1000;
 const diffMs = targetMs - currentServerMs;
 const diffSecs = Math.max(0, Math.ceil(diffMs / 1000));

 if (diffSecs <= 0) {
 setTimeLeft(0);
 if (!completedRef.current) {
 completedRef.current = true;
 onTimerComplete();
 }
 return true;
 }
 setTimeLeft(diffSecs);
 return false;
 };

 const done = tick();
 if (done) return;

 const interval = setInterval(() => {
 if (tick()) clearInterval(interval);
 }, 200);

 return () => clearInterval(interval);
 }, [startTime, onTimerComplete]);

 const hrs = timeLeft !== null ? Math.floor(timeLeft / 3600) : 0;
 const mins = timeLeft !== null ? Math.floor((timeLeft % 3600) / 60) : 0;
 const secs = timeLeft !== null ? timeLeft % 60 : 0;

 const handleLogout = () => { logoutTeam(); onLogout(); };

 // ── Loading state ──
 if (loading) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-black text-slate-300 font-mono-custom">
 <div className="w-12 h-12 border-2 border-[#308a4f] border-t-transparent rounded-full animate-spin mb-4" />
 <p className="text-xs tracking-wider text-[#308a4f] font-bold">SYNCING WITH PORTAL SERVER...</p>
 </div>
 );
 }

 // ── Main view ──
 const isDanger = timeLeft !== null && timeLeft <= 30;
 const isCritical = timeLeft !== null && timeLeft <= 10;

 return (
 <div className="min-h-screen py-10 px-4 relative flex items-center justify-center font-mono-custom bg-[var(--bg-matte)]">
 <AnimatedBackground phase={isCritical ? "phase3" : isDanger ? "phase3" : "phase3"} />
 <div className={`w-full max-w-4xl mx-auto glass-panel border-4 ${isCritical ? 'border-red-500' : isDanger ? 'border-orange-500' : 'border-[#ffe033]'} rounded-none shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative overflow-hidden z-20 transition-colors duration-500`}>
 <div className="absolute top-0 inset-x-0 h-4 hazard-stripes" />
 <div className="absolute bottom-0 inset-x-0 h-4 hazard-stripes" />

 {/* Top scan-line decoration */}
 <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#308a4f]/50 to-transparent" />

 {/* Header */}
 <div className="flex items-center justify-between px-6 pt-8 pb-4 border-b border-zinc-800/80">
 <div className="flex items-center gap-2.5">
 <span className="relative flex h-2.5 w-2.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#308a4f] opacity-75" />
 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#308a4f]" />
 </span>
 <span className="text-xs text-[#308a4f] font-bold uppercase tracking-wider">
 Connected: {teamId}
 </span>
 </div>
 <button
 onClick={handleLogout}
 className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-all hover:bg-rose-500/20 cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Disconnect</span>
 </button>
 </div>

 {/* Main content */}
 <div className="px-6 py-8 flex flex-col items-center gap-8 select-none">

 {/* Label */}
 <div className="text-center">
 <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-semibold mb-1 font-orbitron">
 DSFRUTAR-2K26 LAUNCH COUNTDOWN
 </p>
 <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-orbitron">
 Problem Statements Decrypt In
 </h2>
 </div>

 {/* ── Massive Digital Laboratory Clock & Analog Clock ── */}
 <div className="flex flex-col items-center gap-8 my-8 relative w-full border border-zinc-800/80 bg-black/40 p-8">
 {/* Corner decorations for System Calibration UI */}
 <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ffe033]/50" />
 <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ffe033]/50" />
 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ffe033]/50" />
 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ffe033]/50" />
 <div className="absolute -top-3 bg-black px-2 text-[10px] uppercase tracking-[0.3em] text-[#ffe033] font-bold">System Calibration</div>
 <AnalogClock timeLeft={timeLeft} totalDuration={totalDuration} danger={isDanger} critical={isCritical} />

 <div className="flex items-center gap-2 sm:gap-6">
 <DigitBlock value={mins} label="Minutes" danger={isDanger} critical={isCritical} />
 <div className="flex flex-col items-center justify-center h-[110px] sm:h-[150px] pb-[25px]">
 <span className={`text-5xl sm:text-7xl font-bold leading-none animate-pulse ${isCritical ? 'text-red-500' : isDanger ? 'text-orange-500' : 'text-[#00FF66]/60'}`} style={{
 textShadow: `0 0 20px ${isCritical ? 'rgba(239,68,68,0.5)' : isDanger ? 'rgba(249,115,22,0.5)' : 'rgba(0,255,102,0.5)'}`
 }}>:</span>
 </div>
 <DigitBlock value={secs} label="Seconds" danger={isDanger} critical={isCritical} />
 </div>

 {isCritical && (
 <motion.div
 initial={{ opacity: 0, scale: 0.8 }}
 animate={{ opacity: 1, scale: 1 }}
 className="text-red-500 font-black text-2xl uppercase tracking-[0.3em] font-orbitron animate-pulse"
 >
 Launch Sequence Initiated
 </motion.div>
 )}
 </div>

 {/* Info text */}
 <p className="text-slate-400 text-[11px] max-w-sm text-center leading-relaxed font-sans font-medium">
 Please wait. The problem statement and source assets will be decrypted and displayed automatically when the timer reaches zero.
 </p>

 {/* Anti-cheat banner */}
 <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-left font-sans">
 <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
 <div>
 <h4 className="text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">Strict Anti-Cheat Policy Active</h4>
 <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
 Once the dashboard loads, copy/paste shortcuts, right-clicking, and text selection are strictly disabled. Leaving or blurring the tab will trigger a security overlay.
 </p>
 </div>
 </div>

 {/* Terminal logs */}
 <div className="w-full bg-[#050608] border border-white/5 rounded-xl p-4 text-left">
 <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5 text-slate-500">
 <Terminal className="w-4 h-4 text-[#308a4f]" />
 <span className="text-[10px] uppercase tracking-wider font-semibold">Terminal Sentinel v1.2</span>
 </div>
 <div className="space-y-1.5 text-[10px] text-slate-400 max-h-28 overflow-y-auto scrollbar-none">
 {systemLogs.map((log, idx) => (
 <div key={idx} className="flex gap-2">
 <span className="text-[#308a4f]/70">&gt;</span>
 <span>{log}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Bottom scan-line decoration */}
 <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#308a4f]/30 to-transparent" />
 </div>
 </div>
 );
}
