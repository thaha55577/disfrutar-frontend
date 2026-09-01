import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import HelixRoadmap from './HelixRoadmap';
import AnimatedBackground from '../AnimatedBackground';

export default function RoadmapPage({ onBack }) {
 return (
 <div className="h-screen w-screen text-slate-100 flex flex-col relative overflow-hidden">
 <AnimatedBackground phase="phase5" />

 {/* Floating back button — top-left corner */}
 <motion.button
 onClick={onBack}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
 whileHover={{ scale: 1.1 }}
 whileTap={{ scale: 0.92 }}
 className="group absolute top-20 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 hover:border-[#00FF66]/60 bg-black/60 text-slate-400 hover:text-[#00FF66] transition-colors cursor-pointer"
 >
 <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
 <span className="text-[11px] font-mono uppercase tracking-widest hidden sm:inline">Back</span>
 </motion.button>

 {/* Full-screen Roadmap */}
 <motion.div
 className="relative w-full h-full"
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
 >
 <HelixRoadmap fullscreen />
 </motion.div>
 </div>
 );
}
