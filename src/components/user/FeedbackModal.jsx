import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

/**
 * FeedbackModal
 * Renders an animated glassmorphism modal matching the DSFRUTAR-2K26 cyberpunk aesthetic.
 * 
 * Props:
 * teamId — The authenticated team's ID
 * regNo — The specific member's registration number
 * memberName — Display name for the member
 * onClose — Called when the modal is dismissed without submitting
 * onSubmitted — Called after a successful submission so parent can refresh member state
 */
export default function FeedbackModal({ teamId, regNo, memberName, onClose, onSubmitted }) {
 const [howWasEvent, setHowWasEvent] = useState('');
 const [improvements, setImprovements] = useState('');
 const [discomfort, setDiscomfort] = useState('');
 const [other, setOther] = useState('');
 const [rating, setRating] = useState(0);
 const [hoveredStar, setHoveredStar] = useState(0);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();

 if (rating === 0) {
 setError('Please select a star rating before submitting.');
 return;
 }
 if (!howWasEvent.trim()) {
 setError('Please share your thoughts on how the event was.');
 return;
 }

 setIsSubmitting(true);
 setError('');

 try {
 const res = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}/submit-feedback`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 team_id: teamId,
 reg_no: regNo,
 how_was_event: howWasEvent.trim(),
 improvements: improvements.trim(),
 discomfort: discomfort.trim(),
 other: other.trim(),
 rating
 })
 });

 const data = await res.json();

 if (!res.ok) {
 throw new Error(data.detail || 'Failed to submit feedback.');
 }

 setSuccess(true);
 // Allow success animation to play before closing
 setTimeout(() => {
 onSubmitted();
 onClose();
 }, 1800);
 } catch (err) {
 setError(err.message || 'Network error. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };

 const textAreaClass =
 'w-full bg-black/60 border border-zinc-800/80 hover:border-cyber-cyan/30 focus:border-cyber-cyan/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 font-sans focus:outline-none transition-all duration-300 resize-none focus:shadow-[0_0_10px_rgba(0,243,255,0.08)]';

 const questions = [
 { id: 'howWasEvent', label: 'How was the event?', value: howWasEvent, setter: setHowWasEvent, placeholder: 'Share your overall experience...', required: true },
 { id: 'improvements', label: 'Any improvements needed?', value: improvements, setter: setImprovements, placeholder: 'What could be done better?', required: false },
 { id: 'discomfort', label: 'Is there anything where you felt discomfort?', value: discomfort, setter: setDiscomfort, placeholder: 'Any concerns or friction points?', required: false },
 { id: 'other', label: 'Other', value: other, setter: setOther, placeholder: 'Anything else you\'d like to share...', required: false }
 ];

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

 {/* Backdrop */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={!isSubmitting ? onClose : undefined}
 className="absolute inset-0 bg-black/90 "
 />

 {/* Modal Panel */}
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.94, y: 20 }}
 transition={{ type: 'spring', stiffness: 260, damping: 22 }}
 className="relative z-10 w-full max-w-2xl bg-black/95 border border-cyber-cyan/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.10)] overflow-hidden"
 >
 {/* CRT scanline overlay */}
 <div className="cyber-scanline-cyan pointer-events-none" />

 {/* Corner decorations */}
 <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-cyan/50 pointer-events-none" />
 <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyber-cyan/50 pointer-events-none" />
 <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyber-cyan/50 pointer-events-none" />
 <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-cyan/50 pointer-events-none" />

 {/* Ambient glow */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyber-cyan/5 -z-0 pointer-events-none" />

 <div className="relative z-10 p-6 md:p-8 max-h-[90dvh] overflow-y-auto">

 {/* ── Header ── */}
 <div className="flex items-start justify-between mb-6 pb-4 border-b border-zinc-800/80">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <MessageSquare className="w-4 h-4 text-cyber-cyan" />
 <h2 className="text-sm font-bold text-cyber-cyan uppercase tracking-widest glow-cyan font-sans">
 Event Feedback Form
 </h2>
 </div>
 <p className="text-[11px] text-slate-500 font-mono-custom uppercase tracking-wider">
 NODE: <span className="text-slate-400 font-bold">{regNo}</span>
 {memberName && (
 <> · AGENT: <span className="text-slate-400 font-bold">{memberName}</span></>
 )}
 </p>
 <p className="text-[10px] text-yellow-500/80 font-mono-custom mt-1.5 flex items-center gap-1">
 <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
 Complete to unlock your participation certificate download
 </p>
 </div>
 <button
 onClick={onClose}
 disabled={isSubmitting}
 className="shrink-0 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-zinc-800/80 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
 aria-label="Close feedback modal"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* ── Success State ── */}
 {success ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center justify-center py-12 gap-4 text-center"
 >
 <motion.div
 initial={{ scale: 0 }}
 animate={{ scale: 1 }}
 transition={{ type: 'spring', delay: 0.1 }}
 >
 <CheckCircle className="w-14 h-14 text-cyber-green" />
 </motion.div>
 <div>
 <h3 className="text-lg font-bold text-white font-sans mb-1">Feedback Submitted!</h3>
 <p className="text-sm text-cyber-green font-mono-custom glow-cyber-green">
 Certificate download is now unlocked.
 </p>
 </div>
 </motion.div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-5">

 {/* ── Text Area Questions ── */}
 {questions.map((q) => (
 <div key={q.id}>
 <label
 htmlFor={q.id}
 className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-sans"
 >
 {q.label}
 {q.required && (
 <span className="text-cyber-cyan ml-1">*</span>
 )}
 </label>
 <textarea
 id={q.id}
 value={q.value}
 onChange={(e) => q.setter(e.target.value)}
 placeholder={q.placeholder}
 rows={3}
 disabled={isSubmitting}
 className={textAreaClass}
 />
 </div>
 ))}

 {/* ── Star Rating ── */}
 <div>
 <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-sans">
 How would you rate our event?
 <span className="text-cyber-cyan ml-1">*</span>
 </label>
 <div className="flex items-center gap-2" role="group" aria-label="Star rating 1 to 5">
 {[1, 2, 3, 4, 5].map((star) => {
 const isActive = star <= (hoveredStar || rating);
 return (
 <button
 key={star}
 type="button"
 disabled={isSubmitting}
 onClick={() => setRating(star)}
 onMouseEnter={() => setHoveredStar(star)}
 onMouseLeave={() => setHoveredStar(0)}
 aria-label={`${star} star${star !== 1 ? 's' : ''}`}
 className="focus:outline-none transition-transform duration-150 hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
 >
 <Star
 className={`w-8 h-8 transition-all duration-200 ${
 isActive
 ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
 : 'text-zinc-700 fill-zinc-900'
 }`}
 />
 </button>
 );
 })}
 {rating > 0 && (
 <span className="ml-2 text-xs font-bold text-yellow-400 font-mono-custom tracking-wider">
 {rating}/5
 {rating === 5 ? ' — Excellent!' : rating === 4 ? ' — Great!' : rating === 3 ? ' — Good' : rating === 2 ? ' — Fair' : ' — Poor'}
 </span>
 )}
 </div>
 </div>

 {/* ── Error Banner ── */}
 {error && (
 <motion.div
 initial={{ opacity: 0, y: -4 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-400 text-xs font-sans"
 >
 <AlertTriangle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </motion.div>
 )}

 {/* ── Submit ── */}
 <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/60">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-sans uppercase tracking-wider"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 id="feedback-submit-btn"
 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all duration-300 font-sans ${
 isSubmitting
 ? 'bg-cyber-cyan/10 text-cyber-cyan/50 border border-cyber-cyan/20 cursor-not-allowed'
 : 'bg-gradient-to-r from-cyber-cyan/20 to-cyber-cyan/30 hover:from-cyber-cyan hover:to-cyber-cyan text-cyber-cyan hover:text-black border border-cyber-cyan/50 hover:border-cyber-cyan cursor-pointer hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-[1.02] active:scale-[0.98]'
 }`}
 >
 {isSubmitting ? (
 <>
 <span className="w-3.5 h-3.5 border-2 border-cyber-cyan/40 border-t-cyber-cyan rounded-full animate-spin" />
 <span>Submitting...</span>
 </>
 ) : (
 <>
 <Send className="w-3.5 h-3.5" />
 <span>Submit Feedback</span>
 </>
 )}
 </button>
 </div>

 </form>
 )}
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 );
}
