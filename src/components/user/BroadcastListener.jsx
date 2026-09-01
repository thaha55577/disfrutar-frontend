import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Megaphone, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

/**
 * Web Audio API synthesizer for futuristic high-tech broadcast alert sound.
 * Guarantees zero asset loading issues, works cross-platform instantly.
 */
const playBroadcastChime = () => {
 try {
 const AudioContext = window.AudioContext || window.webkitAudioContext;
 if (!AudioContext) return;
 const ctx = new AudioContext();

 const now = ctx.currentTime;

 // First tone (A5 - 880Hz)
 const osc1 = ctx.createOscillator();
 const gain1 = ctx.createGain();
 osc1.type = 'sine';
 osc1.frequency.setValueAtTime(880, now);
 gain1.gain.setValueAtTime(0.3, now);
 gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
 osc1.connect(gain1);
 gain1.connect(ctx.destination);
 osc1.start(now);
 osc1.stop(now + 0.35);

 // Second tone (E6 - 1320Hz) chime higher note
 const osc2 = ctx.createOscillator();
 const gain2 = ctx.createGain();
 osc2.type = 'sine';
 osc2.frequency.setValueAtTime(1320, now + 0.15);
 gain2.gain.setValueAtTime(0.4, now + 0.15);
 gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
 osc2.connect(gain2);
 gain2.connect(ctx.destination);
 osc2.start(now + 0.15);
 osc2.stop(now + 0.7);
 } catch (err) {
 console.error('Audio chime playback error:', err);
 }
};

export default function BroadcastListener() {
 const [announcements, setAnnouncements] = useState([]);
 const [activeToast, setActiveToast] = useState(null);
 const [notifPermission, setNotifPermission] = useState(
 typeof Notification !== 'undefined' ? Notification.permission : 'denied'
 );
 const isInitialMount = useRef(true);
 const autoDismissTimer = useRef(null);

 // Request desktop notification permission
 const requestNotificationPermission = async () => {
 if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
 try {
 const perm = await Notification.requestPermission();
 setNotifPermission(perm);
 } catch (e) {
 console.error('Error requesting notification permission:', e);
 }
 }
 };

 // Trigger Native Browser Desktop Notification
 const showDesktopNotification = (ann) => {
 if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
 try {
 const title = '📢 Mainframe Announcement Broadcast';
 const options = {
 body: ann.text,
 icon: '/favicon.ico',
 tag: `announcement-${ann.id}`,
 requireInteraction: false
 };
 const notif = new Notification(title, options);
 notif.onclick = () => {
 window.focus();
 };
 } catch (err) {
 console.error('Desktop notification error:', err);
 }
 }
 };

 // Trigger toast popup with 5 second auto dismiss
 const triggerToast = (ann) => {
 setActiveToast(ann);
 if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
 autoDismissTimer.current = setTimeout(() => {
 setActiveToast(null);
 }, 5000);
 };

 // Sync announcements from API & localStorage
 const syncAnnouncements = async () => {
 let freshList = [];
 try {
 const res = await fetch(`${API_BASE_URL}/announcements`);
 if (res.ok) {
 const data = await res.json();
 freshList = data.announcements || [];
 }
 } catch (err) {
 // Fallback to localStorage if offline/network error
 const saved = localStorage.getItem('hackathon_announcements');
 if (saved) freshList = JSON.parse(saved);
 }

 if (freshList.length > 0) {
 // Check for new announcements
 const seenIds = JSON.parse(localStorage.getItem('seen_announcement_ids') || '[]');
 const newest = freshList[0];

 // If it's a new announcement we haven't processed yet
 if (newest && !seenIds.includes(newest.id)) {
 // Update seen list
 const updatedSeen = [newest.id, ...seenIds];
 localStorage.setItem('seen_announcement_ids', JSON.stringify(updatedSeen));

 // Skip sound/popup on cold initial mount if older than 15 seconds to avoid spam on page refresh
 const isRecent = (Date.now() - (newest.id || 0)) < 15000;

 if (!isInitialMount.current || isRecent) {
 // Play sound chime alert
 playBroadcastChime();

 // Show in-app bottom-right toast notification
 triggerToast(newest);

 // Trigger browser desktop notification (works even in background tab)
 showDesktopNotification(newest);
 }
 }

 setAnnouncements(freshList);
 localStorage.setItem('hackathon_announcements', JSON.stringify(freshList));
 window.dispatchEvent(new Event('announcements_updated'));
 }

 if (isInitialMount.current) {
 isInitialMount.current = false;
 }
 };

 useEffect(() => {
 // Auto-request desktop notification permission on load
 requestNotificationPermission();

 // Initial sync
 syncAnnouncements();

 // High frequency interval (3000ms) to catch broadcasts fast across tabs/devices
 const interval = setInterval(syncAnnouncements, 3000);

 const handleLocalEvent = () => syncAnnouncements();
 window.addEventListener('announcements_updated', handleLocalEvent);
 window.addEventListener('storage', handleLocalEvent);

 return () => {
 clearInterval(interval);
 if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
 window.removeEventListener('announcements_updated', handleLocalEvent);
 window.removeEventListener('storage', handleLocalEvent);
 };
 }, []);

 const handleDismiss = () => {
 if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
 setActiveToast(null);
 };

 return (
 <>
 {/* Desktop Notification Banner Prompt if default permission */}
 {notifPermission === 'default' && (
 <div className="fixed top-3 right-3 z-50 bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 ">
 <Bell className="w-4 h-4 animate-bounce text-amber-400" />
 <span>Enable Desktop Notifications for live announcement alerts</span>
 <button
 onClick={requestNotificationPermission}
 className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-2 py-1 rounded text-[10px] uppercase transition-colors"
 >
 Allow
 </button>
 </div>
 )}

 {/* Global Bottom-Right Toast Notification Card (Yellow Outline Theme, 5 Second Auto-Dismiss) */}
 <AnimatePresence>
 {activeToast && (
 <div className="fixed bottom-6 right-6 z-[9999] w-full max-w-md pointer-events-auto">
 <motion.div
 initial={{ opacity: 0, x: 60, y: 20, scale: 0.95 }}
 animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
 exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.25 } }}
 transition={{ type: 'spring', damping: 22, stiffness: 280 }}
 className="relative bg-gradient-to-b from-slate-900/95 via-slate-950/98 to-slate-900/95 border-2 border-yellow-500/80 rounded-2xl p-4 shadow-[0_10px_35px_rgba(234,179,8,0.35)] overflow-hidden"
 >
 {/* Top accent glow */}
 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500" />

 {/* Close Button */}
 <button
 onClick={handleDismiss}
 className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
 title="Close"
 >
 <X className="w-4 h-4" />
 </button>

 {/* Header section */}
 <div className="flex items-center gap-3 mb-2.5 pr-6">
 <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-yellow-400 flex-shrink-0">
 <Megaphone className="w-5 h-5 animate-pulse" />
 <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
 </span>
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-mono tracking-widest uppercase bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1.5 py-0.5 rounded font-bold">
 Mainframe Announcement
 </span>
 <span className="text-[10px] font-mono text-slate-400">
 {activeToast.timestamp}
 </span>
 </div>
 {/* <h4 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-1">
 Announcement
 <Sparkles className="w-3.5 h-3.5 text-yellow-400 inline" />
 </h4> */}
 </div>
 </div>

 {/* Message text */}
 <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 mb-2 text-slate-200 text-xs leading-relaxed font-sans whitespace-pre-wrap max-h-36 overflow-y-auto">
 {activeToast.text}
 </div>

 {/* Auto-dismissing note */}
 <div className="flex items-center justify-end text-[10px] font-mono text-slate-500 italic">
 <span>Auto-dismissing in 5s</span>
 </div>

 {/* 5-second countdown progress bar animation */}
 <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
 <motion.div
 initial={{ width: '100%' }}
 animate={{ width: '0%' }}
 transition={{ duration: 5, ease: 'linear' }}
 className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400"
 />
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </>
 );
}
