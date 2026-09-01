import React, { useState, useEffect } from 'react';
import DsfrutarLogo from '../DsfrutarLogo';
import AcmLogo from '../AcmLogo';
import Footer from '../Footer';
import { LogOut, BookOpen, Users, Terminal, Cpu, Activity, Globe, ExternalLink, Download, MessageSquare, Map, ArrowLeft } from 'lucide-react';
import { getTeamId, getTeamName, logoutTeam } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackModal from './FeedbackModal';
import AnimatedBackground from '../AnimatedBackground';

export default function HackathonDetails({
 onLogout,
 isSelectionEnabled = false,
 onEnterSelection,
 onNavigateToGfg,
 onNavigateToJudges,
 onOpenRoadmap,
 hasSelectedProblem = false
}) {
 const teamId = getTeamId();
 const [showGuestsModal, setShowGuestsModal] = useState(false);
 const [showGfgModal, setShowGfgModal] = useState(false);

 const [resolvedTeamName, setResolvedTeamName] = useState(getTeamName());
 const [teamMembers, setTeamMembers] = useState([]);
 const [loadingMembers, setLoadingMembers] = useState(true);

 // Feedback gate global state (synced from /settings)
 const [feedbackEnabled, setFeedbackEnabled] = useState(false);
 // Feedback modal control
 const [feedbackModalTarget, setFeedbackModalTarget] = useState(null); // { regNo, memberName }
 // Download loading state per-member
 const [downloadingMember, setDownloadingMember] = useState(null);


 const handleLogout = () => {
 logoutTeam();
 onLogout();
 };

 const fetchTeamDetails = async () => {
   if (!teamId) return;
   try {
     const res = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}`);
     if (res.ok) {
       const data = await res.json();

       // 1. Resolve Team Name
       const dbTeamName = data["Team Name"] || data.teamName || data.team_name || "";
       if (dbTeamName) {
         sessionStorage.setItem('team_name', dbTeamName);
         setResolvedTeamName(dbTeamName);
       }

       // 2. Resolve members (preserves FeedbackSubmitted flag per member)
       setTeamMembers(data.Members || data.members || []);

       // 3. Resolve certificates
       setCertificates(data.Certificates || {});
       setLoadingMembers(false);
       return;
     }
   } catch (e) {
     console.warn("API offline, falling back to local demo team context:", e.message);
   }

   // Fallback: Check local demo store
   try {
     const demoStr = sessionStorage.getItem('demo_team_data');
     if (demoStr) {
       const demoData = JSON.parse(demoStr);
       setResolvedTeamName(demoData["Team Name"] || "CYBER NEXUS");
       setTeamMembers(demoData.Members || []);
       setCertificates(demoData.Certificates || {});
     }
   } catch (err) {
     console.error("Local demo parse error:", err);
   } finally {
     setLoadingMembers(false);
   }
 };

 // Poll /settings to track the global FeedbackEnabled toggle
 useEffect(() => {
 const syncFeedbackSetting = async () => {
 try {
 const settingsRes = await fetch(`${API_BASE_URL}/settings`);
 if (settingsRes.ok) {
 const settingsData = await settingsRes.json();
 setFeedbackEnabled(!!settingsData.FeedbackEnabled);
 }
 } catch (err) {
 console.error('Error syncing feedback setting:', err);
 }
 };
 syncFeedbackSetting();
 const interval = setInterval(syncFeedbackSetting, 3000);
 return () => clearInterval(interval);
 }, []);


 useEffect(() => {
 fetchTeamDetails();
 }, [teamId]);

 const [certificates, setCertificates] = useState({});
 const [uploadingMember, setUploadingMember] = useState(null);
 const [uploadErrors, setUploadErrors] = useState({});

 const handleFileUpload = async (memberName, file, certType) => {
 if (!file) return;

 // Strict client-side validation
 if (file.type !== "application/pdf") {
 setUploadErrors(prev => ({
 ...prev,
 [memberName]: "Invalid format. Only PDF files are allowed."
 }));
 return;
 }

 const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
 if (file.size > maxSizeBytes) {
 setUploadErrors(prev => ({
 ...prev,
 [memberName]: "File is too large. Maximum size is 5 MB."
 }));
 return;
 }

 // Reset errors for this member
 setUploadErrors(prev => ({
 ...prev,
 [memberName]: null
 }));
 setUploadingMember(memberName);

 try {
 // 1. Fetch Presigned URL from Backend API
 const response = await fetch(`${API_BASE_URL}/api/certificates/generate-upload-url`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 team_id: teamId,
 member_name: memberName,
 file_name: file.name,
 cert_type: certType
 })
 });

 if (!response.ok) {
 const errorData = await response.json();
 throw new Error(errorData.detail || "Failed to generate presigned upload URL.");
 }

 const { presigned_url } = await response.json();

 // 2. Direct PUT request to S3
 // CRITICAL: We pass the raw `file` object directly into the body.
 // Do NOT wrap this in FormData or an object { file }
 const s3Response = await fetch(presigned_url, {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/pdf'
 },
 body: file
 });

 if (!s3Response.ok) {
 throw new Error("S3 Upload Failed.");
 }

 // 3. Refresh Local Certificates State
 await fetchTeamDetails();
 } catch (err) {
 console.error("Upload error details:", err);
 setUploadErrors(prev => ({
 ...prev,
 [memberName]: err.message || "Failed to complete upload request."
 }));
 } finally {
 setUploadingMember(null);
 }
 };

 /**
 * Fetches a presigned S3 GET URL for a participation certificate and opens it.
 * Only callable when the member's FeedbackSubmitted flag is true.
 */
 const handleDownloadCertificate = async (regNo, memberName) => {
 setDownloadingMember(regNo);
 try {
 const res = await fetch(
 `${API_BASE_URL}/api/certificates/participation/presigned-url?team_id=${encodeURIComponent(teamId)}&reg_no=${encodeURIComponent(regNo)}`
 );
 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.detail || 'Failed to generate download URL.');
 }
 window.open(data.url, '_blank', 'noopener,noreferrer');
 } catch (err) {
 console.error('Certificate download error:', err);
 alert(`Download failed: ${err.message}`);
 } finally {
 setDownloadingMember(null);
 }
 };


 // Framer Motion Animation Variants
 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.12,
 delayChildren: 0.15
 }
 }
 };

 const itemVariants = {
 hidden: { y: 24, opacity: 0 },
 visible: {
 y: 0,
 opacity: 1,
 transition: {
 type: 'spring',
 stiffness: 90,
 damping: 14
 }
 }
 };

 return (
 <div className="min-h-screen relative flex flex-col font-sans bg-[var(--bg-matte)]">
 <AnimatedBackground phase="phase1" />
 <div className="flex-grow py-12 px-4 flex flex-col items-center justify-center w-full">
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="w-full max-w-5xl glass-panel rounded-sm p-6 md:p-9 shadow-[0_8px_32px_rgba(0,0,0,0.8)] relative z-20"
 >

        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4 mb-8 relative z-20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative group self-start sm:self-auto shrink-0">
              <DsfrutarLogo inline className="text-2xl drop-shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all duration-300 group-hover:scale-105" />
            </div>
            <div className="text-left flex flex-col justify-center min-w-0">
              <h1
                className="text-lg md:text-2xl font-black text-white tracking-widest flex flex-wrap items-center gap-y-2 font-orbitron"
              >
                <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-sm border border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)] mr-2 md:mr-3 inline-block text-[10px] uppercase leading-none shrink-0">BRIEFING</span>
                <span className="truncate">MAINBOARD</span>
                <span className="text-zinc-600 mx-2 md:mx-3 font-normal hidden sm:inline">·</span>
                <span className="hidden sm:inline">SESSION ACTIVE</span>
              </h1>
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 font-mono-custom text-xs">
  {/* Node Status Caps */}
  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-100">
  <span className="relative flex h-1.5 w-1.5">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
  </span>
  NODE: <span className="text-emerald-400 font-bold">{teamId}</span>
  </span>
  {resolvedTeamName && (
  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-slate-300">
  TEAM: <span className="text-white font-bold">{resolvedTeamName}</span>
  </span>
  )}
  </div>
  </div>
  </div>

  <button
  onClick={handleLogout}
  className="group flex items-center justify-center gap-2 text-xs font-bold font-sans text-rose-400 hover:text-white bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/60 px-5 py-2.5 rounded-xl transition-all duration-300 hover:bg-rose-600/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)] cursor-pointer w-fit md:self-center font-mono-custom lab-btn-ripple"
  >
  <LogOut className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
  <span>Logout</span>
  </button>
  </motion.div>

  {/* Stack layout */}
  <div className="flex flex-col gap-6 relative z-20">
        <motion.div
          variants={itemVariants}
          className="w-full glass-panel p-6 rounded-none border border-zinc-800/80 hover:border-yellow-400/30 transition-colors duration-300 flex flex-col"
        >
          <div>
            <h2
              className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2 font-orbitron"
            >
              <span>Contest Overview</span>
            </h2>
            <div className="space-y-4 text-slate-400 font-sans text-sm leading-relaxed">
              <p>
                <span className="text-white font-bold">DSFRUTAR-2K26</span> is an elite national hackathon conclave hosted by the <span className="text-cyan-400 font-semibold">ACM KARE Student Chapter</span>. Teams collaborate, architect cutting-edge intelligence systems, solve complex real-world technological challenges, and build futuristic software and hardware prototypes.
              </p>
              <p>
                During the event, participants will be presented with critical problem statements and telemetry parameters. Analyze requirements, design scalable architectures, and construct your solutions. Stand by for the administrator to trigger the synchronized problem release signal. Once launched, you will transition to the active problem workspace.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Panel 2: Live Team Roster Terminal */}
 <motion.div
 variants={itemVariants}
 className="w-full text-left flex flex-col"
 >
 {/* Roster Header */}
 <div className="flex items-center justify-between mb-4 px-2 text-xs text-yellow-400/80 font-orbitron">
 <div
 className="flex items-center gap-2"
 >
 <span className="font-bold tracking-widest uppercase text-yellow-400">Team Roster</span>
 </div>
 <div className="flex items-center gap-1.5 font-bold">
 <span className="text-emerald-400">STATUS: OK</span>
 </div>
 </div>

 {/* Roster Stream Data Container */}
 <div className="flex-1 transition-all duration-300 min-h-[300px] flex flex-col justify-start">

 {loadingMembers ? (
 <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm text-yellow-400/70 font-mono-custom py-10">
 <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-none animate-spin"></div>
 <span className="tracking-wider uppercase">Loading team roster...</span>
 </div>
 ) : teamMembers.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {teamMembers.map((member, index) => {
 const memberCerts = certificates[member.name] || [];
 const dataAnalyticsCert = memberCerts.find(s3Key => s3Key.toLowerCase().endsWith('_data analytics essentials.pdf'));
 return (
 <motion.div
 key={index}
 initial={{ opacity: 0, x: 10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 className="id-badge p-4"
 >
 <div className="flex items-start gap-4">
 {/* Node Identifier Codebox */}
 <div className="w-10 h-10 rounded-none glass-panel group-hover:border-yellow-400/30 flex flex-col items-center justify-center font-mono-custom transition-colors duration-300">
 <span className="text-[9px] text-slate-500 font-semibold uppercase leading-none">MEM</span>
 <span className="text-xs font-bold text-yellow-400 leading-none mt-1">0{index + 1}</span>
 </div>

 {/* Member Info */}
 <div className="flex-1 min-w-0">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
 <h4 className="text-base font-bold text-white font-mono-custom tracking-wide truncate group-hover:text-yellow-400 transition-colors duration-300">
 {member.name}
 </h4>
 <span className="text-[11px] font-mono-custom font-semibold text-yellow-400 bg-yellow-400/5 px-2 py-0.5 rounded border border-yellow-400/20 self-start sm:self-auto shadow-[0_0_8px_rgba(250,204,21,0.05)]">
 {member.regNo}
 </span>
 </div>

 <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono-custom text-slate-400">
 <div className="truncate flex items-center gap-1">
 <span className="text-slate-600 font-bold">@</span>
 <span className="truncate">{member.email}</span>
 </div>
 <div className="flex items-center gap-1">
 <span className="text-slate-600 font-bold">#</span>
 <span>{member.phone}</span>
 </div>
 <div className="flex items-center gap-1.5 mt-0.5">
 <span className="text-slate-600 font-bold">Year:</span>
 <span className="text-yellow-500 font-bold uppercase">{member.year}</span>
 </div>
 <div className="flex items-center gap-1.5 mt-0.5">
 <span className="text-slate-600 font-bold">Branch:</span>
 <span className="text-emerald-400 font-extrabold uppercase">{member.branch}</span>
 </div>
 </div>
 </div>
 </div>

 {/* Certificate Upload Interface Component */}
 <div className="mt-2 pt-3 border-t border-zinc-900/60 font-mono-custom text-[10px] space-y-2">
 <div className="text-yellow-500 font-bold uppercase tracking-wider mb-1">Course Certificate:</div>

 {/* Data Analytics Essentials Certificate Slot */}
 <div className="flex items-center justify-between p-2 rounded glass-panel text-[11px] text-slate-300">
 <span className="truncate max-w-[200px] flex items-center gap-1">
 {dataAnalyticsCert ? (
 <><span>📄</span> <span className="text-zinc-400 font-medium">{dataAnalyticsCert.substring(dataAnalyticsCert.lastIndexOf('/') + 1)}</span></>
 ) : (
 <span className="text-slate-600 italic">Data Analytics Essentials certificate missing</span>
 )}
 </span>
 {dataAnalyticsCert ? (
 <span className="text-yellow-400 font-bold uppercase glow-yellow-400 text-[10px] flex items-center gap-1">
 <span className="inline-block w-1 h-1 bg-yellow-400 rounded-full"></span>
 Verified
 </span>
 ) : (
 <label className={`cursor-pointer inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-yellow-400/10 border border-yellow-400/30 hover:bg-yellow-400 hover:text-black font-bold uppercase text-[10px] tracking-wider transition-all duration-300 hover:shadow-[0_0_8px_rgba(250,204,21,0.25)] ${uploadingMember === member.name ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
 <BookOpen className="w-3 h-3" />
 <span>Upload Data Analytics Essentials</span>
 <input
 type="file"
 accept="application/pdf"
 className="hidden"
 disabled={uploadingMember === member.name}
 onChange={(e) => {
 if (e.target.files && e.target.files[0]) {
 const confirmed = window.confirm("Are you sure you want to upload this Data Analytics Essentials certificate? Caution: Once it is uploaded it cannot be undone.");
 if (confirmed) {
 handleFileUpload(member.name, e.target.files[0], "Data Analytics Essentials");
 } else {
 e.target.value = '';
 }
 }
 }}
 />
 </label>
 )}
 </div>

 {/* Error Handling State */}
 {uploadErrors[member.name] && (
 <div className="mt-2 p-2 rounded bg-rose-950/20 border border-rose-500/30 text-rose-400 font-semibold text-[11px] uppercase tracking-wider animate-pulse">
 ⚠️ Error: {uploadErrors[member.name]}
 </div>
 )}

 {/* ─── Participation Certificate Section ─── */}
 <div className="mt-3 pt-3 border-t border-zinc-800/60">
 <div className="text-yellow-500 font-bold uppercase tracking-wider mb-2">Participation Certificate:</div>

 {/* Member's FeedbackSubmitted flag (from Members[] map) */}
 {(() => {
 const memberData = teamMembers[index] || {};
 const hasFeedback = !!memberData.FeedbackSubmitted;
 const isDownloading = downloadingMember === member.regNo;

 return (
 <div className="flex flex-col sm:flex-row sm:items-center gap-2">
 {/* Feedback button — only shown when admin enables feedback AND member hasn't submitted yet */}
 {feedbackEnabled && !hasFeedback && (
 <motion.button
 initial={{ opacity: 0, x: -6 }}
 animate={{ opacity: 1, x: 0 }}
 onClick={() => setFeedbackModalTarget({ regNo: member.regNo, memberName: member.name })}
 id={`feedback-btn-${member.regNo}`}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/40 hover:bg-yellow-500/20 hover:border-yellow-400 text-yellow-400 font-bold uppercase text-[8px] tracking-wider transition-all duration-300 cursor-pointer hover:shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:scale-[1.02] active:scale-[0.98]"
 >
 <MessageSquare className="w-3 h-3" />
 Submit Feedback
 </motion.button>
 )}

 {/* Feedback submitted badge */}
 {hasFeedback && (
 <span className="inline-flex items-center gap-1 text-[8px] font-bold text-yellow-400 uppercase tracking-wider">
 <span className="inline-block w-1 h-1 bg-yellow-400 rounded-full"></span>
 Feedback Submitted
 </span>
 )}

 {/* Download Certificate button — only active after feedback */}
 <button
 onClick={() => hasFeedback && handleDownloadCertificate(member.regNo, member.name)}
 disabled={!hasFeedback || isDownloading}
 id={`download-cert-btn-${member.regNo}`}
 title={!hasFeedback ? 'Submit feedback to unlock certificate download' : 'Download your participation certificate'}
 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold uppercase text-[8px] tracking-wider transition-all duration-300 ${hasFeedback
 ? 'bg-yellow-400/10 border border-yellow-400/40 hover:bg-yellow-400 hover:text-black text-yellow-400 cursor-pointer hover:shadow-[0_0_10px_rgba(0,255,65,0.2)] hover:scale-[1.02] active:scale-[0.98]'
 : 'bg-zinc-900/40 border border-zinc-800/60 text-slate-600 cursor-not-allowed opacity-60'
 }`}
 >
 {isDownloading ? (
 <>
 <span className="w-2.5 h-2.5 border border-yellow-400/50 border-t-yellow-400 rounded-full animate-spin" />
 <span>Fetching...</span>
 </>
 ) : (
 <>
 <Download className="w-3 h-3" />
 <span>Download Certificate</span>
 </>
 )}
 </button>

 {/* Locked indicator when feedback not submitted and gate is off */}
 {!feedbackEnabled && !hasFeedback && (
 <span className="text-[8px] text-slate-600 italic font-mono-custom">
 🔒 Feedback gate closed by admin
 </span>
 )}
 </div>
 );
 })()}
 </div>

 </div>
 </motion.div>
 )
 })}
 </div>
 ) : (
 <div className="flex-1 flex items-center justify-center p-6 rounded-lg border border-dashed border-zinc-800 text-sm text-slate-500 font-mono-custom text-center">
 No registered members found for team "{resolvedTeamName || teamId}".
 </div>
 )}
 </div>
 </motion.div>

 {/* [04] Roadmap — Full-width Banner */}
 <motion.div variants={itemVariants}>
 <motion.button
 onClick={onOpenRoadmap}
 whileHover={{ scale: 1.012, y: -3 }}
 whileTap={{ scale: 0.985 }}
 className="w-full text-left cursor-pointer group mt-4"
 >
 <div className="relative overflow-hidden rounded-sm border border-[#0088FF]/50 group-hover:border-[#00AAFF]/90 transition-all duration-300 group-hover:shadow-[0_0_50px_rgba(0,136,255,0.3),0_0_20px_rgba(0,136,255,0.15)]">

 {/* Background — vivid blue-purple gradient that contrasts against dark green theme */}
 <div className="absolute inset-0 bg-gradient-to-r from-[#020818] via-[#030d2a] to-[#0a0520]" />
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,rgba(0,100,255,0.22)_0%,transparent_60%)]" />
 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(120,0,255,0.14)_0%,transparent_55%)]" />

 {/* Top accent line — always visible */}
 <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#0088FF] to-transparent" />

 {/* Hover bottom shimmer */}
 <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#8844FF]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

 {/* Ghost icon */}
 <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] group-hover:opacity-[0.16] transition-opacity duration-500 pointer-events-none">
 <Map className="w-28 h-28 text-[#0088FF]" />
 </div>

 {/* Content */}
 <div className="relative z-10 flex items-center justify-between gap-4 px-6 py-5">
 <div className="flex items-center gap-4">
 <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#0088FF]/15 border border-[#0088FF]/35 group-hover:bg-[#0088FF]/25 group-hover:border-[#0088FF]/60 transition-all duration-300 shrink-0">
 <Map className="w-5 h-5 text-[#4db8ff]" />
 </div>
 <div>
 <div className="flex items-center gap-2 mb-0.5">
 <span className="text-[10px] font-mono text-slate-600">·</span>
 <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">8 phases</span>
 </div>
 <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-orbitron">
 Hackathon Roadmap
 </h3>
 <p className="text-xs text-slate-500 font-sans mt-0.5">Mission timeline &amp; phase tracker</p>
 </div>
 </div>

 {/* Right: CTA button */}
 <div className="shrink-0 flex items-center gap-3">
 <div className="hidden sm:flex flex-col items-end text-[10px] font-mono text-slate-600 uppercase tracking-wider gap-0.5">
 <span>All phases</span>
 <span>Interactive</span>
 </div>
 <motion.div
 whileHover={{ scale: 1.05 }}
 className="flex items-center gap-2 bg-[#00FF66] text-black text-xs font-mono font-black uppercase tracking-widest px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(0,255,102,0.35)] group-hover:shadow-[0_0_30px_rgba(0,255,102,0.55)] transition-shadow duration-300"
 >
 <span>View Roadmap</span>
 <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform duration-200" />
 </motion.div>
 </div>
 </div>
 </div>
 </motion.button>
 </motion.div>

 </div>

 {/* Action Buttons */}
 <motion.div
 variants={itemVariants}
 className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-zinc-800/80 relative z-20 w-full"
 >
 <button
 onClick={onEnterSelection}
 disabled={!hasSelectedProblem && !isSelectionEnabled}
 className={`group relative w-full font-extrabold py-3.5 px-4 rounded-none border transition-all duration-300 font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2 font-mono-custom lab-btn-ripple ${hasSelectedProblem || isSelectionEnabled
 ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-400 hover:border-yellow-400 cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)]'
 : 'bg-[var(--bg-secondary)] text-slate-500 border-zinc-800 cursor-not-allowed opacity-60 shadow-none'
 }`}
 >
 {hasSelectedProblem ? (
 <>
 <Terminal className="w-4 h-4 animate-pulse text-black" />
 <span>Enter Workspace (Dashboard Active)</span>
 </>
 ) : isSelectionEnabled ? (
 <>
 <Terminal className="w-4 h-4 animate-pulse text-black" />
 <span>Enter Workspace (Selection Active)</span>
 </>
 ) : (
 <>
 <Terminal className="w-4 h-4" />
 <span>Selection Locked by Admin</span>
 </>
 )}
 </button>

 <button
 onClick={onNavigateToJudges}
 className="group relative w-full bg-[var(--bg-secondary)] hover:bg-yellow-400 text-yellow-400 hover:text-black font-extrabold py-3.5 px-4 rounded-sm border border-yellow-400/50 hover:border-yellow-400 transition-all duration-300 font-sans text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 lab-btn-ripple"
 >
 <Users className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
 <span>Chief Guests & Judges</span>
 </button>

 <button
 onClick={onNavigateToGfg}
 className="group relative w-full bg-[var(--bg-secondary)] hover:bg-[#00F0FF] text-[#00F0FF] hover:text-black font-extrabold py-3.5 px-4 rounded-sm border border-[#00F0FF]/50 hover:border-[#00F0FF] transition-all duration-300 font-sans text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 lab-btn-ripple"
 >
 <Globe className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
 <span>ACM Chapter</span>
 </button>
 </motion.div>

 </motion.div>

 {/* 🔒 CHIEF GUESTS MODAL OVERLAY */}
 <AnimatePresence>
 {showGuestsModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop blur overlay */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setShowGuestsModal(false)}
 className="absolute inset-0 bg-black/85 "
 />

 {/* Modal Body */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ type: 'spring', duration: 0.4 }}
 className="bg-black/95 border border-cyber-cyan/35 rounded-2xl p-6 md:p-8 max-w-2xl w-full text-left relative shadow-[0_0_40px_rgba(0,243,255,0.15)] z-10 overflow-hidden max-h-[90dvh] overflow-y-auto"
 >
 <div className="cyber-scanline-cyan"></div>

 <h3 className="text-base font-bold text-cyber-cyan uppercase tracking-widest mb-6 pb-2 border-b border-cyber-cyan/20 font-orbitron glow-cyan flex items-center gap-2">
 <Users className="w-4 h-4 text-cyber-cyan" />
 <span>Chief Guests & Judges</span>
 </h3>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 {/* Guest 1 */}
 <div className="bg-zinc-950/60 border border-zinc-900 hover:border-cyber-cyan/35 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 group">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-black to-zinc-800 border-2 border-cyber-cyan/60 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
 <span className="text-xl font-bold font-orbitron text-cyber-cyan">PS</span>
 </div>
 <h4 className="text-sm font-bold text-white uppercase font-sans">Parimal Sesha Sai Adini</h4>
 <p className="text-xs text-cyber-cyan mt-1 font-sans font-semibold">Backend Developer · NOMISO</p>
 </div>

 {/* Guest 2 */}
 <div className="bg-zinc-950/60 border border-zinc-900 hover:border-cyber-cyan/35 rounded-xl p-5 flex flex-col items-center text-center transition-all duration-300 group">
 <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-black to-zinc-800 border-2 border-cyber-cyan/60 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,243,255,0.2)]">
 <span className="text-xl font-bold font-orbitron text-cyber-cyan">PV</span>
 </div>
 <h4 className="text-sm font-bold text-white uppercase font-sans">Premsai Varma Chekuri</h4>
 <p className="text-xs text-cyber-cyan mt-1 font-sans font-semibold">AI Engineer · TCS</p>
 </div>
 </div>

 <div className="flex justify-end pt-4 border-t border-zinc-800/80">
 <button
 onClick={() => setShowGuestsModal(false)}
 className="bg-[var(--bg-secondary)] hover:bg-cyber-cyan/20 hover:text-white border border-zinc-800 hover:border-cyber-cyan/40 text-slate-300 font-sans px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-300 lab-btn-ripple"
 >
 Close
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* 🔒 GFG STUDENT CHAPTER MODAL OVERLAY */}
 <AnimatePresence>
 {showGfgModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop blur overlay */}
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setShowGfgModal(false)}
 className="absolute inset-0 bg-black/85"
 />

 {/* Modal Body */}
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 transition={{ type: 'spring', duration: 0.4 }}
 className="bg-black/95 border border-[#00F0FF]/35 rounded-2xl p-6 max-w-md w-full text-left relative shadow-[0_0_40px_rgba(0,240,255,0.15)] z-10 overflow-hidden max-h-[90dvh] overflow-y-auto"
 >
 <div className="cyber-scanline-cyan"></div>

 <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#00F0FF]/20">
 <AcmLogo className="h-6 w-6" />
 <h3 className="text-base font-bold text-white uppercase tracking-widest font-orbitron glow-cyan">
 ACM KARE Student Chapter
 </h3>
 </div>

 <p className="text-sm text-slate-400 font-sans mb-6 leading-relaxed">
 Connect with the official ACM KARE Student Chapter of our campus. Check out our social handles and official website for dynamic updates.
 </p>

 <div className="space-y-3 mb-6 font-mono-custom">
 <a
 href="https://acm.klu.ac.in"
 target="_blank"
 rel="noreferrer"
 className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:border-[#00F0FF]/45 hover:bg-[#00F0FF]/[0.02] transition-all text-sm text-slate-200 group"
 >
 <span className="flex items-center gap-2">
 <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
 Website
 </span>
 <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1">
 acm.klu.ac.in
 <ExternalLink className="w-2.5 h-2.5" />
 </span>
 </a>
 <a
 href="https://instagram.com/acm_kare"
 target="_blank"
 rel="noreferrer"
 className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:border-[#00F0FF]/45 hover:bg-[#00F0FF]/[0.02] transition-all text-sm text-slate-200 group"
 >
 <span className="flex items-center gap-2">
 <span className="text-[#00F0FF] font-bold">📸</span>
 Instagram
 </span>
 <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1">
 @acm_kare
 <ExternalLink className="w-2.5 h-2.5" />
 </span>
 </a>
 <a
 href="https://linkedin.com/company/acm-kare-student-chapter"
 target="_blank"
 rel="noreferrer"
 className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900/60 hover:border-[#00F0FF]/45 hover:bg-[#00F0FF]/[0.02] transition-all text-sm text-slate-200 group"
 >
 <span className="flex items-center gap-2">
 <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
 LinkedIn
 </span>
 <span className="text-[#00F0FF] group-hover:underline flex items-center gap-1">
 ACM KARE
 <ExternalLink className="w-2.5 h-2.5" />
 </span>
 </a>
 </div>

 <div className="flex justify-end pt-4 border-t border-zinc-800/80">
 <button
 onClick={() => setShowGfgModal(false)}
 className="bg-zinc-900 hover:bg-[#00F0FF]/20 hover:text-white border border-zinc-800 hover:border-[#00F0FF]/40 text-slate-300 font-sans px-5 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-300"
 >
 Close
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* ── Feedback Modal ── */}
 {feedbackModalTarget && (
 <FeedbackModal
 teamId={teamId}
 regNo={feedbackModalTarget.regNo}
 memberName={feedbackModalTarget.memberName}
 onClose={() => setFeedbackModalTarget(null)}
 onSubmitted={() => {
 setFeedbackModalTarget(null);
 // Refresh team data so FeedbackSubmitted flag is read fresh
 fetchTeamDetails();
 }}
 />
 )}

 </div>
 <Footer />
 </div>
 );
}
