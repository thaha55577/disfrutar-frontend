import React, { useState } from 'react';
import { Terminal, Lock, ArrowRight, Shield, Sparkles, Cpu, CheckCircle2 } from 'lucide-react';
import DsfrutarLogo from '../DsfrutarLogo';
import AcmLogo from '../AcmLogo';
import { loginTeam } from '../../utils/auth';
import { motion } from 'framer-motion';

export default function Login({ onLoginSuccess }) {
    const [teamId, setTeamId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!teamId.trim() || !password.trim()) {
            setError('Please fill in all credentials fields.');
            return;
        }
        setIsLoading(true);
        try {
            const success = await loginTeam(teamId, password);
            if (success) {
                if (onLoginSuccess) onLoginSuccess();
            } else {
                setError('Authentication failed. Invalid Team ID or Access Key.');
            }
        } catch (err) {
            setError('Connection failure. Unable to reach authentication server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[#030712]">

            {/* Ambient Multi-spectral Cyber Lighting */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[650px] max-h-[650px] bg-gradient-to-tr from-[#3B82F6]/20 via-[#00F0FF]/15 to-[#FFD700]/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Perspective Grid Background Overlay */}
            <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(0, 255, 102, 0.4) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 255, 102, 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '48px 48px'
                }}
            />

            {/* Central Holographic Container */}
            <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Glowing Top Frame Accent */}
                <div className="flex items-center justify-center mb-6">
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)]">
                        <AcmLogo className="h-4 w-4" />
                        <span className="text-[11px] font-mono-custom uppercase tracking-widest text-cyan-400 font-bold">
                            ACM KARE · SECURE ACCESS GATEWAY
                        </span>
                    </div>
                </div>

                {/* Main Glassmorphic Login Terminal */}
                <div className="relative rounded-3xl bg-black/75 border border-white/15 p-7 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,255,255,0.1)] overflow-hidden">

                    {/* Top Radiant Laser Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent shadow-[0_0_15px_#3B82F6]" />

                    {/* Corner Tech Brackets */}
                    <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#3B82F6]/60 pointer-events-none" />
                    <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#3B82F6]/60 pointer-events-none" />
                    <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#3B82F6]/60 pointer-events-none" />
                    <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#3B82F6]/60 pointer-events-none" />

                    {/* Logo & Headline */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-3">
                            <DsfrutarLogo inline={false} className="text-3xl sm:text-4xl" />
                        </div>
                        <p className="text-xs font-mono-custom uppercase tracking-[0.2em] text-slate-400 mt-2">
                            National Flagship Hackathon Portal
                        </p>
                    </div>

                    {/* Error Toast */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono-custom flex items-center gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                        >
                            <Shield className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Team ID / Username */}
                        <div>
                            <label
                                htmlFor="team-id"
                                className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono-custom flex items-center justify-between"
                            >
                                <span className="flex items-center gap-1.5 text-cyan-400">
                                    <Terminal className="w-3.5 h-3.5" />
                                    <span>Team Identity (Team ID)</span>
                                </span>
                                <span className="text-[9px] text-slate-500 font-normal">REQUIRED</span>
                            </label>
                            <div className="relative group">
                                <input
                                    id="team-id"
                                    type="text"
                                    value={teamId}
                                    onChange={(e) => setTeamId(e.target.value)}
                                    placeholder="e.g. TEAM-404 or Registered ID"
                                    disabled={isLoading}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3.5 bg-black/60 border border-white/10 hover:border-[#3B82F6]/40 focus:border-[#3B82F6] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-mono-custom text-sm transition-all duration-200 shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Password / Access Key */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono-custom flex items-center justify-between"
                            >
                                <span className="flex items-center gap-1.5 text-[#00FFFF]">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Access Passcode</span>
                                </span>
                                <span className="text-[9px] text-slate-500 font-normal">AUTHENTICATED KEY</span>
                            </label>
                            <div className="relative group">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    disabled={isLoading}
                                    required
                                    className="w-full px-4 py-3.5 bg-black/60 border border-white/10 hover:border-blue-400/40 focus:border-blue-400 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400/20 font-mono-custom text-sm transition-all duration-200 shadow-inner tracking-widest"
                                />
                            </div>
                        </div>

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            id="login-submit-btn"
                            className="group relative w-full py-4 px-6 rounded-xl font-orbitron font-extrabold text-sm uppercase tracking-widest text-black bg-gradient-to-r from-[#3B82F6] via-[#00F0FF] to-[#3B82F6] bg-[length:200%_auto] hover:bg-[position:right_center] transition-all duration-500 cursor-pointer shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:shadow-[0_0_40px_rgba(0,255,255,0.7)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    <span>Verifying Clearance...</span>
                                </div>
                            ) : (
                                <>
                                    <Cpu className="w-4 h-4 transition-transform group-hover:rotate-45" />
                                    <span>Initialize Portal</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Bottom Status Info & Admin Quick Link */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-custom text-slate-500">
                        <span className="flex items-center gap-1 text-cyan-400/90 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                            <span>System Online</span>
                        </span>
                    </div>

                </div>

            </motion.div>

        </div>
    );
}
