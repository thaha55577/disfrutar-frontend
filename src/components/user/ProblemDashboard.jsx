import AnimatedBackground from '../AnimatedBackground';
import DsfrutarLogo from '../DsfrutarLogo';
import AcmLogo from '../AcmLogo';
import Footer from '../Footer';
import React, { useState, useEffect, useCallback, memo, useRef } from 'react';
import {
 LogOut, ListChecks, Award, BookOpen, ArrowLeft, Send,
 CheckCircle, AlertTriangle, Users, Map, FileText,
 Globe, ExternalLink, MessageSquare, Lock
} from 'lucide-react';
import { getTeamId } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// ─── Animation Variants (GPU-only: transform + opacity) ─────────────────────
const fadeUp = {
 hidden: { opacity: 0, y: 18 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
 exit: { opacity: 0, y: -12, transition: { duration: 0.22, ease: 'easeIn' } },
};

const fadeIn = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { duration: 0.35 } },
 exit: { opacity: 0, transition: { duration: 0.18 } },
};

const scaleIn = {
 hidden: { opacity: 0, scale: 0.95 },
 visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
 exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2 } },
};

const stagger = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const cardV = {
 hidden: { opacity: 0, y: 20, scale: 0.98 },
 visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Shared Glass Panel ───────────────────────────────────────────────────────
const GlassPanel = memo(({ children, className = '', neonColor = 'white', ...props }) => {
 const borders = {
 green: 'border-[#3B82F6]/50 shadow-[0_0_25px_rgba(0,255,255,0.15)]',
 cyan: 'border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]',
 yellow: 'border-blue-500/50 shadow-[0_0_25px_rgba(0,255,255,0.15)]',
 white: 'border-white/30',
 rose: 'border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.15)]',
 };
 return (
 <div
 className={`glass-panel rounded-xl border relative ${borders[neonColor] ?? borders.white} ${className}`}
 {...props}
 >
 <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
 {children}
 </div>
 );
});



// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = memo(({ children, color = 'green', pulse = false, className = '' }) => {
 const v = {
 green: 'bg-[#3B82F6]/15 border-[#3B82F6]/30 text-[#00FFFF]',
 cyan: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
 yellow: 'bg-blue-500/10 border-blue-500/25 text-[#00FFFF]',
 rose: 'bg-rose-500/10 border-rose-500/25 text-rose-400',
 slate: 'bg-slate-900/80 border-zinc-800 text-slate-400',
 };
 return (
 <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${v[color] ?? v.slate} ${pulse ? 'animate-pulse' : ''} ${className}`}>
 {children}
 </span>
 );
});

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = memo(({ icon: Icon, iconColor = 'text-[#00FFFF]', children, rightSlot, index }) => (
 <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
 <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
 <Icon className={`w-4 h-4 ${iconColor}`} />
 {index && <span className="text-[#00FFFF]/60">[{String(index).padStart(2, '0')}]</span>}
 <span>{children}</span>
 </h3>
 {rightSlot}
 </div>
));

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
 <div className="py-16 flex flex-col items-center justify-center gap-4 text-cyan-400">
 <div className="relative flex items-center justify-center w-12 h-12">
 <motion.div
 className="absolute inset-0 border-2 border-[#3B82F6] rounded-full mix-blend-screen"
 animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
 transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
 />
 <div className="w-4 h-4 bg-[#3B82F6] rounded-full shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
 </div>
 <p className="text-xs font-mono uppercase tracking-widest animate-pulse text-[#00FFFF]">
 Decrypting Challenge Matrix...
 </p>
 </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProblemDashboard({ onLogout, onBack }) {
 const teamId = getTeamId();

 const [problemsList, setProblemsList] = useState([]);
 const [csvLoadError, setCsvLoadError] = useState('');
 const [csvLoading, setCsvLoading] = useState(true);

 const [selectedProblem, setSelectedProblem] = useState(() => {
 const saved = localStorage.getItem(`selected_problem_${teamId}`);
 return saved ? JSON.parse(saved) : null;
 });

 const [confirmSelectionProb, setConfirmSelectionProb] = useState(null);
 const [isLocking, setIsLocking] = useState(false);
 const [selectionCounts, setSelectionCounts] = useState({});
 const [errorMessage, setErrorMessage] = useState('');

 const [teamData, setTeamData] = useState(null);
 const [loadingTeam, setLoadingTeam] = useState(true);

 const [repoLinkInput, setRepoLinkInput] = useState('');
 const [submittingLink, setSubmittingLink] = useState(false);
 const [linkSuccess, setLinkSuccess] = useState('');
 const [linkError, setLinkError] = useState('');

 const [uploadingMember, setUploadingMember] = useState(null);
 const [uploadErrors, setUploadErrors] = useState({});

 const [announcements, setAnnouncements] = useState(() =>
 JSON.parse(localStorage.getItem('hackathon_announcements') || '[]')
 );

  // ── API Helpers ──────────────────────────────────────────────────────────
  const fetchTeamDetails = useCallback(async (list = problemsList) => {
    if (!teamId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}`);
      if (res.ok) {
        const data = await res.json();
        setTeamData(data);
        if (data.DeployedLink) setRepoLinkInput(data.DeployedLink);
        const dbSelection = data.SelectedProblem || data.selectedProblem;
        if (dbSelection) {
          const dbTitleNorm = typeof dbSelection === 'string' ? dbSelection.trim().toLowerCase() : (dbSelection.title || '').trim().toLowerCase();
          const activeList = (list && list.length > 0) ? list : problemsList;
          const matched = activeList.find(p => (p.title || '').trim().toLowerCase() === dbTitleNorm);
          const finalProb = matched || (typeof dbSelection === 'object' ? dbSelection : { title: dbSelection, description: '' });
          setSelectedProblem(finalProb);
          localStorage.setItem(`selected_problem_${teamId}`, JSON.stringify(finalProb));
        } else {
          setSelectedProblem(null);
          localStorage.removeItem(`selected_problem_${teamId}`);
        }
      }
    } catch (err) {
      console.error('Error fetching team details in ProblemDashboard:', err);
    } finally {
      setLoadingTeam(false);
    }
  }, [teamId, problemsList]);

 const fetchCounts = useCallback(async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/problems/selection-counts`);
 if (res.ok) setSelectionCounts(await res.json());
 } catch (err) {
 console.error('Error fetching selection counts:', err);
 }
 }, []);

  const PROBLEMS_CACHE_KEY = 'problems_csv_cache';
  const PROBLEMS_CACHE_TTL_MS = 0; // Caching disabled: always fetch fresh problem CSV data from backend

  // RFC 4180 compliant CSV parser capable of handling multi-line quoted fields
  const parseProblemsCsv = (csvText) => {
    if (!csvText || !csvText.trim()) return [];

    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentField);
          currentField = '';
        } else if (char === '\r') {
          // ignore CR
        } else if (char === '\n') {
          currentRow.push(currentField);
          currentField = '';
          if (currentRow.some(f => f.trim())) {
            rows.push(currentRow);
          }
          currentRow = [];
        } else {
          currentField += char;
        }
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(f => f.trim())) {
        rows.push(currentRow);
      }
    }

    if (rows.length === 0) return [];

    // Determine if first row is header
    let startIdx = 0;
    const firstRowStr = rows[0].join(',').toLowerCase();
    if (firstRowStr.includes('title') || firstRowStr.includes('description')) {
      startIdx = 1;
    }

    const list = [];
    for (let i = startIdx; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0) continue;
      const title = (r[0] || '').trim();
      if (!title) continue;

      list.push({
        title: title,
        description: (r[1] || '').trim(),
        requirements: (r[2] || '').replace(/\\n/g, '\n').trim(),
        expectations: (r[3] || '').replace(/\\n/g, '\n').trim(),
      });
    }

    return list;
  };

  useEffect(() => {
    const loadProblemData = async () => {
      setCsvLoading(true);
      setCsvLoadError('');
      try {
        const raw = sessionStorage.getItem(PROBLEMS_CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          const age = Date.now() - (cached.timestamp || 0);
          if (age < PROBLEMS_CACHE_TTL_MS && Array.isArray(cached.list) && cached.list.length > 0) {
            setProblemsList(cached.list);
            setCsvLoading(false);
            await fetchCounts();
            await fetchTeamDetails(cached.list);
            return;
          }
        }
      } catch (_) { sessionStorage.removeItem(PROBLEMS_CACHE_KEY); }

      try {
        let csvText = '';
        try {
          const rawRes = await fetch(`${API_BASE_URL}/api/problems/raw-csv`);
          if (rawRes.ok) {
            const rawData = await rawRes.json();
            if (rawData.csv_content) {
              csvText = rawData.csv_content;
            }
          }
        } catch (_) { }

        if (!csvText) {
          const urlRes = await fetch(`${API_BASE_URL}/api/problems/csv`);
          if (urlRes.ok) {
            const { presigned_url } = await urlRes.json();
            const response = await fetch(presigned_url);
            if (response.ok) {
              csvText = await response.text();
            }
          }
        }

        const list = csvText ? parseProblemsCsv(csvText) : [];
        if (list.length > 0) {
          try { sessionStorage.setItem(PROBLEMS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), list })); } catch (_) { }
          setProblemsList(list);
          setCsvLoadError('');
          await fetchCounts();
          await fetchTeamDetails(list);
        } else {
          setProblemsList([]);
          setCsvLoadError('No problem statements uploaded yet by administrator.');
          await fetchCounts();
          await fetchTeamDetails([]);
        }
      } catch (err) {
        console.warn('Error loading problem statements CSV:', err);
        setProblemsList([]);
        setCsvLoadError('Failed to load uploaded problem statements.');
        await fetchCounts();
        await fetchTeamDetails([]);
      } finally {
        setCsvLoading(false);
      }
    };
    loadProblemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProblemCount = useCallback((probTitle) => {
    if (!probTitle) return 0;
    const targetNorm = probTitle.trim().toLowerCase();
    for (const [key, count] of Object.entries(selectionCounts || {})) {
      if (key.trim().toLowerCase() === targetNorm) {
        return Number(count) || 0;
      }
    }
    return 0;
  }, [selectionCounts]);

  useEffect(() => {
    let pollTimeout;
    const pollLoop = async () => {
      await fetchCounts();
      await fetchTeamDetails();
      // High-concurrency safe: Base 6000ms delay + up to 4000ms random jitter
      const delay = 6000 + Math.random() * 4000;
      pollTimeout = setTimeout(pollLoop, delay);
    };

    pollLoop();
    return () => clearTimeout(pollTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemsList]);

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem('hackathon_announcements');
      setAnnouncements(saved ? JSON.parse(saved) : []);
    };
    sync();
    window.addEventListener('announcements_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('announcements_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // ── Action Handlers ──────────────────────────────────────────────────────
  const handleLockSelection = async () => {
    if (!confirmSelectionProb || isLocking) return;
    setIsLocking(true);
    setErrorMessage('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${encodeURIComponent(teamId)}/select-problem`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ problem_title: confirmSelectionProb.title }) }
      );
      const result = await response.json();
      if (response.ok) {
        localStorage.setItem(`selected_problem_${teamId}`, JSON.stringify(confirmSelectionProb));
        setSelectedProblem(confirmSelectionProb);
        setConfirmSelectionProb(null);
        await fetchTeamDetails();
      } else {
        const lockedTitle = result.selected_problem;
        if (lockedTitle) {
          const matched = problemsList.find(p => p.title.trim().toLowerCase() === lockedTitle.trim().toLowerCase());
          const probObj = matched || { title: lockedTitle, description: '' };
          localStorage.setItem(`selected_problem_${teamId}`, JSON.stringify(probObj));
          setSelectedProblem(probObj);
          setConfirmSelectionProb(null);
          await fetchTeamDetails();
        } else {
          setErrorMessage(result.detail || 'Could not select challenge. Please try again.');
          setConfirmSelectionProb(null);
          await fetchCounts();
        }
      }
    } catch (err) {
      console.error('Lock selection network error:', err);
      setErrorMessage('Network error locking in challenge. Please try again.');
    } finally {
      setIsLocking(false);
    }
  };



  const handleSubmitLink = async (e) => {
    e.preventDefault();
    if (!repoLinkInput.trim()) return;
    setSubmittingLink(true); setLinkSuccess(''); setLinkError('');
    try {
      const response = await fetch(
        `${API_BASE_URL}/teams/${encodeURIComponent(teamId)}/submit-link`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deployed_link: repoLinkInput.trim() }) }
      );
      const data = await response.json();
      if (response.ok) { setLinkSuccess('GitHub repository link submitted successfully.'); await fetchTeamDetails(); }
      else { setLinkError(data.detail || 'Failed to submit link. Please try again.'); }
    } catch (err) {
      setLinkError('Network error submitting repository link.');
    } finally { setSubmittingLink(false); }
  };

  const activeSelectedProblem = React.useMemo(() => {
    if (!selectedProblem) return null;
    const titleToMatch = typeof selectedProblem === 'string' ? selectedProblem.trim().toLowerCase() : (selectedProblem.title || '').trim().toLowerCase();
    const matched = problemsList.find(p => p.title.trim().toLowerCase() === titleToMatch);

    if (matched) {
      return {
        ...matched,
        ...(typeof selectedProblem === 'object' ? selectedProblem : {}),
        requirements: (typeof selectedProblem === 'object' && selectedProblem.requirements) || matched.requirements || '',
        expectations: (typeof selectedProblem === 'object' && selectedProblem.expectations) || matched.expectations || '',
      };
    }
    return typeof selectedProblem === 'object' ? selectedProblem : { title: selectedProblem, description: '' };
  }, [selectedProblem, problemsList]);

  const activeProb = activeSelectedProblem || selectedProblem;
  const si = problemsList.findIndex(p => p.title === activeProb?.title);
 

 // ── Render ────────────────────────────────────────────────────────────────
 return (
 <div className="min-h-screen text-slate-100 flex flex-col relative font-mono-custom overflow-x-hidden">
 <AnimatedBackground phase={selectedProblem ? "phase5" : "phase4"} />

 {/* ── Header ────────────────────────────────────────────────────────── */}
 <motion.header
 initial={{ opacity: 0, y: -16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
 className="border-b border-white/[0.06] bg-black/60 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between"
 >
        <div className="flex items-center gap-3">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.15 }}
            className="group flex items-center justify-center p-2 rounded-lg border border-zinc-800 hover:border-[#3B82F6]/60 bg-white/[0.03] text-slate-400 hover:text-[#00FFFF] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </motion.button>

          <AcmLogo className="h-7 w-7" />

          <div className="flex flex-col gap-1">
            <DsfrutarLogo inline className="text-lg" showSub={false} />
            <span className="text-[10px] text-[#00FFFF]/80 font-mono tracking-widest uppercase leading-none mt-0.5">DSFRUTAR-2K26 WORKSPACE</span>
          </div>

 <Badge color="green" className="hidden sm:inline-flex">Broadcasting Active</Badge>
 </div>

 <div className="flex items-center gap-4">
 <div className="hidden md:flex flex-col text-right text-[11px] text-slate-500">
 <span>TEAM_REF: <span className="text-[#00FFFF] font-bold">{teamId}</span></span>
 <span>SECURE_SHELL: <span className="text-cyan-400">ACTIVE</span></span>
 </div>

 <motion.button
 onClick={onLogout}
 whileHover={{ scale: 1.04 }}
 whileTap={{ scale: 0.96 }}
 transition={{ duration: 0.15 }}
 className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/[0.08] border border-rose-500/20 hover:border-rose-500/40 px-3.5 py-2 rounded-xl transition-colors cursor-pointer font-sans"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">Terminate Session</span>
 </motion.button>
 </div>
 </motion.header>

 {/* ── Main ──────────────────────────────────────────────────────────── */}
 <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
 <AnimatePresence mode="wait">

 {!selectedProblem ? (
 /* PATH A: Problem Selection */
 <motion.section
 key="problem-selection"
 variants={fadeUp} initial="hidden" animate="visible" exit="exit"
 className="w-full text-left"
 >
 <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4">
 <h2 className="text-sm font-bold text-[#00FFFF] uppercase tracking-widest flex items-center gap-2 font-mono">
 <BookOpen className="w-4 h-4" />
 Select Your Hackathon Challenge Statement
 </h2>
 <motion.button
 onClick={onBack}
 whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
 className="text-xs text-slate-400 hover:text-[#00FFFF] border border-zinc-800 hover:border-blue-400/50 bg-white/[0.02] px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold lab-btn-ripple"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Return to Mainboard
 </motion.button>
 </div>

 <motion.div variants={fadeUp} className="mb-6 p-4 bg-blue-500/[0.05] border border-blue-500/20 rounded-2xl text-xs leading-relaxed text-slate-400 font-sans font-medium flex items-start gap-3">
 <AlertTriangle className="w-4 h-4 text-[#00FFFF] shrink-0 mt-0.5" />
 <div>
 <span className="font-extrabold text-[#00FFFF] uppercase block tracking-wider mb-0.5 text-xs">CAPACITY GUARDRAILS IN EFFECT</span>
 Each challenge track is capped at a maximum of <strong>3 teams</strong>. Once a track reaches 3 teams, it locks automatically. Choose carefully — problem statement selections are irreversible once locked.
 </div>
 </motion.div>

 <AnimatePresence>
 {errorMessage && (
 <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit"
 className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs flex items-center gap-3 font-sans ">
 <span className="font-semibold uppercase tracking-wider bg-rose-500/20 px-2.5 py-1 rounded text-[11px]">Error</span>
 <span>{errorMessage}</span>
 </motion.div>
 )}
 </AnimatePresence>

 {csvLoading && <Spinner />}

 {!csvLoading && csvLoadError && (
 <motion.div variants={fadeUp} className="py-16 flex flex-col items-center justify-center gap-4">
 <AlertTriangle className="w-10 h-10 text-rose-400" />
 <p className="text-sm font-bold text-rose-400 uppercase tracking-wider">Challenge Matrix Unavailable</p>
 <p className="text-xs text-slate-500 font-sans">{csvLoadError}</p>
 </motion.div>
 )}

 {!csvLoading && !csvLoadError && (
 problemsList.filter(p => getProblemCount(p.title) < 3).length === 0 ? (
 <div className="py-16 text-center text-slate-500 font-mono text-xs italic">
 All challenge tracks have reached maximum capacity (3 teams each).
 </div>
 ) : (
 <motion.div variants={stagger} initial="hidden" animate="visible"
 className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {problemsList.map((prob, idx) => {
  const count = getProblemCount(prob.title);
  if (count >= 3) return null;

  const problemNumber = String(idx + 1).padStart(2, '0');

  return (
  <motion.div
  key={idx}
  variants={cardV}
  layout
  className="group relative rounded-xl cursor-pointer glass-capsule flex flex-col justify-between problem-card-hover overflow-hidden border border-white/10 bg-black/40 hover:border-[#3B82F6]/40 transition-all p-6"
  >
  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5 group-hover:ring-[#3B82F6]/20 transition-all duration-300" />

  <div className="flex flex-col gap-4">
  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
  <span className="text-[#00FFFF] font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-1.5">
  <BookOpen className="w-4 h-4" />
  Problem Statement {problemNumber}
  </span>
  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider border ${count === 2 ? 'bg-blue-500/10 border-blue-500/20 text-[#00FFFF] font-bold' : 'bg-[#3B82F6]/10 border-[#3B82F6]/20 text-[#00FFFF]'}`}>
  {count}/3 Slots Claimed
  </span>
  </div>

  <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
  <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-2xl font-extrabold font-orbitron text-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.15)] group-hover:scale-105 transition-transform">
  #{problemNumber}
  </div>
  <h3 className="text-base font-extrabold text-white font-orbitron uppercase tracking-wide px-2">
  {prob.title || `Problem Statement ${problemNumber}`}
  </h3>
  <p className="text-xs text-slate-400 font-sans max-w-xs line-clamp-3">
  {prob.description || `Select this track to lock your problem statement. Full description and requirements will be revealed upon confirmation.`}
  </p>
  </div>
  </div>

  <div className="pt-4 border-t border-white/[0.05]">
  <motion.button
  onClick={() => setConfirmSelectionProb(prob)}
  className="w-full font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest bg-[#3B82F6] text-slate-950 hover:bg-blue-400 cursor-pointer shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_20px_rgba(0,255,255,0.5)] lab-btn-ripple relative z-10"
  >
  <Lock className="w-3.5 h-3.5" />
  Select Problem Statement {problemNumber}
  </motion.button>
  </div>
  </motion.div>
  );
  })}
 </motion.div>
 )
 )}
 </motion.section>

 ) : (
 /* PATH B: Team Dashboard */
 <motion.div
 key="team-dashboard"
 variants={fadeUp} initial="hidden" animate="visible" exit="exit"
 className="flex flex-col gap-6 text-left w-full"
 >
 {/* LEFT COLUMN */}
 <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full space-y-6">

 {/* [01] Selected Problem */}
 <motion.div variants={cardV}>
 <GlassPanel neonColor="green" className="p-6 md:p-8">
 <div className="absolute top-4 right-4 opacity-[0.04] pointer-events-none">
 <BookOpen className="w-32 h-32 text-[#00FFFF]" />
 </div>
 <SectionHeader icon={BookOpen} iconColor="text-[#00FFFF]" index={1} rightSlot={<Badge color="green" pulse>Locked Track</Badge>}>
 Selected Challenge Track
 </SectionHeader>

 <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 font-orbitron uppercase tracking-wide animate-holographic-reveal">{activeProb?.title}</h2>
 <p className="text-slate-300 leading-relaxed text-base font-sans font-medium mb-5 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>{activeProb?.description}</p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.05]">
 {activeProb?.requirements && (
 <div>
 <h3 className="text-sm font-bold text-[#00FFFF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <ListChecks className="w-4 h-4" />Execution Requirements
 </h3>
 <ul className="space-y-2 text-sm text-slate-400 leading-relaxed font-sans font-medium">
 {activeProb.requirements.split('\n').filter(Boolean).map((req, i) => (
 <li key={i} className="flex gap-2 items-start">
 <span className="text-[#00FFFF] font-mono font-bold mt-0.5 shrink-0">•</span><span>{req.trim()}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 {activeProb?.expectations && (
 <div>
 <h3 className="text-sm font-bold text-[#00FFFF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <Award className="w-4 h-4" />Submission Expectations
 </h3>
 <ul className="space-y-2 text-sm text-slate-400 leading-relaxed font-sans font-medium">
 {activeProb.expectations.split('\n').filter(Boolean).map((exp, i) => (
 <li key={i} className="flex gap-2 items-start">
 <span className="text-[#00FFFF] font-mono font-bold mt-0.5 shrink-0">•</span><span>{exp.trim()}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </GlassPanel>
 </motion.div>

 {/* [02] Announcements */}
 <motion.div variants={cardV}>
 <GlassPanel className="p-6">
 <SectionHeader icon={MessageSquare} iconColor="text-[#00FFFF]" index={2} rightSlot={<Badge color="yellow" pulse>Live Feed</Badge>}>
 Global Announcements
 </SectionHeader>
 <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-none pr-1">
 <AnimatePresence>
 {announcements.length === 0 ? (
 <motion.div variants={fadeIn} initial="hidden" animate="visible"
 className="text-center py-8 text-slate-600 font-mono text-xs italic">
 &gt;&gt; Stand by for administrative broadcast feeds... No notices active.
 </motion.div>
 ) : announcements.map((item, idx) => (
 <motion.div key={item.id} variants={fadeUp} initial="hidden" animate="visible"
 className="p-3 bg-blue-400/[0.04] border-l-2 border-blue-400 rounded-r-xl">
 <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-cyan-400">
 <span className="font-bold">BROADCAST #{announcements.length - idx}</span>
 <span>{item.timestamp}</span>
 </div>
 <p className="text-slate-300 font-sans leading-relaxed font-medium text-sm">{item.text}</p>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </GlassPanel>
 </motion.div>


 {/* [03] Team Members */}
 <motion.div variants={cardV}>
 <GlassPanel className="p-6">
 <SectionHeader icon={Users} iconColor="text-[#00FFFF]" index={3}>
 Team Participants
 </SectionHeader>

 {loadingTeam ? (
 <div className="py-6 text-center text-sm text-slate-500 font-mono animate-pulse">&gt;&gt; Retrieving roster matrix...</div>
 ) : teamData?.Members?.length > 0 ? (
 <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {teamData.Members.map((member, index) => {
 return (
 <motion.div key={index} variants={cardV} layout
 className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div className="flex items-center gap-3">
 <span className="w-7 h-7 rounded bg-black/60 border border-[#3B82F6]/20 text-[#00FFFF] flex items-center justify-center text-sm font-bold font-mono shrink-0">
 {String(index + 1).padStart(2, '0')}
 </span>
 <h4 className="text-base font-bold text-white uppercase tracking-wide font-mono">{member.name}</h4>
 </div>
 <Badge color="slate">RegID: {member.regNo}</Badge>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono text-slate-400 mt-2 p-3 bg-black/40 rounded-lg border border-white/5">
 <div className="truncate flex items-center gap-2">
 <span className="text-[9px] text-[#00FFFF]/70 uppercase tracking-widest font-bold w-10">Mail</span>
 <span className="truncate text-white/80">{member.email}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-[#00FFFF]/70 uppercase tracking-widest font-bold w-10">Phone</span>
 <span className="text-white/80">{member.phone}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-[#00FFFF]/70 uppercase tracking-widest font-bold w-10">Dept</span>
 <span className="text-cyan-400 font-bold uppercase">{member.year} • {member.branch}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-[#00FFFF]/70 uppercase tracking-widest font-bold w-10">Stay</span>
 <span className="text-[#00FFFF] font-bold uppercase">{member.accommodation || 'Dayscholar'}</span>
 </div>
 </div>

 </motion.div>
 );
 })}
 </motion.div>
 ) : (
 <div className="py-6 text-center text-sm text-slate-500 italic">No registered team members found.</div>
 )}
 </GlassPanel>
 </motion.div>






 </motion.div>

  {/* RIGHT COLUMN */}
  <motion.div variants={stagger} initial="hidden" animate="visible" className="w-full space-y-6">
  {/* [05] Submit GitHub Repo Link */}
  <motion.div variants={cardV}>
  <GlassPanel neonColor="yellow" className="p-6">
  <SectionHeader icon={Globe} iconColor="text-[#00FFFF]" index={5} rightSlot={<Badge color="yellow">Repo Link</Badge>}>
  GitHub Repository Link
  </SectionHeader>
  <p className="text-sm text-slate-400 font-sans leading-relaxed mb-4 font-medium">
  Submit the GitHub repository URL for your project. This link will be used by evaluators to review your codebase and submission.
  </p>
  <AnimatePresence>
  {linkSuccess && (
  <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit"
  className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold rounded-xl text-sm flex items-center gap-2">
  <CheckCircle className="w-4 h-4 shrink-0" />{linkSuccess}
  </motion.div>
  )}
  {linkError && (
  <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit"
  className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold rounded-xl text-sm flex items-center gap-2">
  <AlertTriangle className="w-4 h-4 shrink-0" />{linkError}
  </motion.div>
  )}
  </AnimatePresence>
  <form onSubmit={handleSubmitLink} className="space-y-3">
  <input type="url" required value={repoLinkInput} onChange={e => setRepoLinkInput(e.target.value)}
  placeholder="https://github.com/your-team/dsfrutar26-project"
  className="w-full px-4 py-3 bg-black/40 border border-white/10 focus:border-blue-400/60 rounded-xl text-white placeholder-slate-700 focus:outline-none text-sm font-mono transition-colors" />
  <motion.button type="submit" disabled={submittingLink}
  whileHover={{ scale: submittingLink ? 1 : 1.01 }} whileTap={{ scale: submittingLink ? 1 : 0.99 }}
  className="w-full bg-blue-400 hover:bg-blue-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-sm uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 lab-btn-ripple">
  <Send className="w-4 h-4" />
  {submittingLink ? 'Submitting...' : 'Submit Repository'}
  </motion.button>
  </form>
  {teamData?.DeployedLink && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  className="mt-4 pt-3 border-t border-white/[0.05] text-xs font-mono flex items-center justify-between text-slate-500">
  <span>Submitted Repo:</span>
  <a href={teamData.DeployedLink} target="_blank" rel="noreferrer"
  className="text-[#00FFFF] hover:underline flex items-center gap-1 font-semibold">
  View Repository<ExternalLink className="w-3 h-3 shrink-0" />
  </a>
  </motion.div>
  )}
  </GlassPanel>
  </motion.div>
  </motion.div>
  </motion.div>
 )}
 </AnimatePresence>
 </main>

 {/* ── Footer ────────────────────────────────────────────────────────── */}
 <Footer />

 {/* ── Confirmation Modal ─────────────────────────────────────────────── */}
 <AnimatePresence>
 {confirmSelectionProb && (
 <motion.div key="confirm-modal" variants={fadeIn} initial="hidden" animate="visible" exit="exit"
 className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 className="absolute inset-0 bg-black/75"
 onClick={() => setConfirmSelectionProb(null)} />
 <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit" className="relative w-full max-w-md">
 <GlassPanel neonColor="green" className="p-7 text-center shadow-2xl">
 <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#00FFFF] flex items-center justify-center mx-auto mb-5">
 <Lock className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Confirm Challenge Selection</h3>
  <p className="text-[11px] text-slate-400 font-sans mb-6 leading-relaxed">
  You are about to lock in{' '}
  <span className="text-white font-bold font-mono">
  "Problem Statement {String((problemsList.findIndex(p => p.title === confirmSelectionProb.title) !== -1 ? problemsList.findIndex(p => p.title === confirmSelectionProb.title) : 0) + 1).padStart(2, '0')}"
  </span>.
  <br /><br />
  <span className="text-rose-400 font-semibold font-mono uppercase text-[10px]">⚠ WARNING: This decision is irreversible.</span>
  {' '}You will not be able to change your problem statement once selection is locked.
  </p>
 <div className="flex gap-3">
 <motion.button onClick={() => setConfirmSelectionProb(null)}
 whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
 className="flex-1 border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.07] text-white font-mono py-2.5 rounded-xl text-[10px] cursor-pointer transition-colors font-semibold">
 Cancel
 </motion.button>
 <motion.button onClick={handleLockSelection} disabled={isLocking}
 whileHover={{ scale: isLocking ? 1 : 1.03 }} whileTap={{ scale: isLocking ? 1 : 0.97 }}
 className={`flex-1 ${isLocking ? 'bg-zinc-600 opacity-50 cursor-not-allowed text-white' : 'bg-[#3B82F6] hover:bg-blue-400 hover:text-black text-slate-950 cursor-pointer'} font-extrabold py-2.5 rounded-xl text-[10px] uppercase transition-colors flex items-center justify-center gap-1.5`}>
 <Lock className="w-3 h-3" />{isLocking ? 'Locking...' : 'Lock Selection'}
 </motion.button>
 </div>
 </GlassPanel>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
