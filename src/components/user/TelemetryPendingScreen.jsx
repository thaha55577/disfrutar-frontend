import React from 'react';
import { ShieldAlert, ArrowLeft, LogOut, Clock, Terminal } from 'lucide-react';
import AnimatedBackground from '../AnimatedBackground';
import DsfrutarLogo from '../DsfrutarLogo';
import AcmLogo from '../AcmLogo';

export default function TelemetryPendingScreen({ onBack, onLogout }) {
  return (
    <div className="min-h-screen bg-[var(--bg-matte)] text-slate-100 flex flex-col justify-between font-mono relative overflow-hidden">
      <AnimatedBackground phase="phase2" />
      

      {/* Top Header */}
      <header className="border-b border-white/10 bg-zinc-950/80 px-6 py-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <GfgLogo className="h-7 w-7" />
          <DsfrutarLogo inline className="text-base" showSub={false} />
          <span className="bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] text-[9px] px-2 py-0.5 rounded font-mono-custom uppercase tracking-wider hidden sm:inline-block">
            Standby Chamber
          </span>
        </div>
        
        <button 
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-all hover:bg-rose-500/20 cursor-pointer font-sans"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Terminate Session</span>
        </button>
      </header>

      {/* Main content area */}
      <main className="max-w-md w-full mx-auto px-6 py-12 flex-grow flex flex-col justify-center relative z-10 text-center">
        
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative border border-[#00FF66]/30">
          
          {/* Animated reactor core */}
          <div className="w-32 h-32 rounded-full border-2 border-[#00FF66]/30 flex items-center justify-center mx-auto mb-6 relative shadow-[0_0_30px_rgba(0,255,102,0.15)] overflow-hidden">
            <div className="absolute inset-0 border-2 border-dashed border-[#00FF66]/40 rounded-full animate-rotate-slow"></div>
            <div className="absolute inset-2 border border-[#00FF66]/50 rounded-full animate-rotate-slow-reverse"></div>
            
            <div className="w-16 h-16 rounded-full bg-[#00FF66]/20 relative overflow-hidden animate-glow-pulse">
              <div className="absolute bottom-0 w-full bg-[#00FF66]/80 animate-energy-fill blur-[2px]"></div>
            </div>
            
            <Clock className="w-8 h-8 text-black absolute z-10" />
          </div>

          <h2 className="text-md font-bold text-[#00FF66] tracking-wider font-orbitron uppercase mb-2 animate-holographic-reveal">
            WORKSPACE STANDBY
          </h2>
          <p className="text-[10px] text-[#00FF66] uppercase tracking-widest mb-6 bg-[#00FF66]/10 py-1 px-3 rounded inline-block">
            PORT STATUS: AWAITING GLOBAL LAUNCH
          </p>

          <p className="text-xs text-slate-300 font-sans leading-relaxed mb-6 font-medium text-center">
            Your team credentials are authenticated for <span className="text-emerald-400 font-bold">DSFRUTAR-2K26</span>. The administrator has not triggered the synchronized telemetry countdown signal yet. Please stand by.
          </p>

          {/* Terminal log readouts */}
          <div className="bg-black/90 border border-white/10 p-4 rounded-xl text-left text-[10px] leading-relaxed text-[#00FF66]/90 mb-6 font-mono relative overflow-hidden animate-slide-up-fade">
            <div className="flex items-center gap-1.5 border-b border-white/10 pb-2 mb-2 text-slate-500">
              <Terminal className="w-3.5 h-3.5 text-[#00FF66]" />
              <span className="uppercase text-[9px] text-[#00FF66]">Node Diagnostics Log</span>
            </div>
            <div>&gt;&gt; ESTABLISHING SECURE SSH TUNNEL... OK</div>
            <div>&gt;&gt; DSFRUTAR-2K26 ACCESS: <span className="text-white font-bold">AUTHENTICATED</span></div>
            <div>&gt;&gt; carrier_freq: AWAITING GLOBAL LAUNCH SIGNAL</div>
            <div className="animate-pulse text-yellow-400/90">&gt;&gt; status: STANDBY_FOR_TIMER_LAUNCH...</div>
          </div>

          {/* Back button */}
          <button
            onClick={onBack}
            className="w-full bg-[#00FF66] text-slate-950 hover:bg-[#00FF66]/80 font-extrabold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-xs uppercase tracking-wider lab-btn-ripple"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Mainboard</span>
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#07080a] py-6 px-6 text-center text-xs text-slate-500 select-none relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AcmLogo className="h-5 w-5" />
            <span className="font-semibold text-slate-400">ACM KARE Student Chapter</span>
          </div>
          <p className="text-[10px]">&copy; {new Date().getFullYear()} DSFRUTAR-2K26. All rights secured.</p>
        </div>
      </footer>

    </div>
  );
}
