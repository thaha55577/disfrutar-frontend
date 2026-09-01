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
 green: 'border-[#00FF66]/50 shadow-[0_0_25px_rgba(0,255,102,0.15)]',
 cyan: 'border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.15)]',
 yellow: 'border-yellow-500/50 shadow-[0_0_25px_rgba(234,179,8,0.15)]',
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

// ─── Default Problems Catalog (Offline / Deployed Fallback) ────────────────
const DEFAULT_PROBLEMS = [
  {
    title: "FactoryFlow - Autonomous Production Schedule Recovery Agent",
    description: "A manufacturing company has a production schedule containing jobs with different deadlines, priorities, machine requirements, processing times, and dependencies. During production, machine downtime, urgent orders, material shortages, or unexpected processing delays can invalidate the original plan. Build an AI system that detects disruptions, reconstructs the production plan, simulates alternatives, and autonomously selects the recovery strategy that minimizes late orders, downtime, and cost.",
    requirements: "1. Implement at least five meaningful intelligence components: job completion-time prediction, machine availability/failure-risk prediction, order-priority prediction, delay propagation, business-impact prediction, plus a scheduling/optimization component.\n2. Maintain an internal production-state representation.\n3. Implement a team-built agent/controller that generates and compares multiple recovery strategies.\n4. Support at least two disruption types and machine/job constraints.\n5. Provide a simulation mode where a judge can inject a disruption during the demo.\n6. Expose the agent's evidence, decisions, and re-planning logic.",
    expectations: "1. Dashboard must show production schedule, machine utilization, bottlenecks, jobs at risk, and expected delays.\n2. Show current plan vs proposed plan, predicted cost, and late-order reduction.\n3. Show the agent's decision trace and why the selected schedule was preferred.\n4. Demonstrate re-planning after a second disruption.\n5. Measure improvement against a fixed-rule or original-schedule baseline."
  },
  {
    title: "ReleaseSentinel - Autonomous Software Release Risk Planner",
    description: "Software releases combine code changes, test results, dependencies, historical incidents, ownership information, and service criticality. A release can pass standard checks and still cause production failures. Build an AI system that estimates release risk, identifies likely failure modes, evaluates rollout strategies, and determines whether the release should proceed, be staged, delayed, or prepared for rollback.",
    requirements: "1. Implement at least five meaningful intelligence components: change-risk analysis, test-failure prediction, defect/affected-module prediction, historical-incident similarity, production-impact prediction, plus rollout-risk optimization.\n2. Represent the current release state and affected services/modules.\n3. Build an agent that selects additional evidence, generates rollout strategies, and compares their predicted outcomes.\n4. Support staged-rollout scenarios such as 10%, 50%, and 100%.\n5. Use a small prepared incident history and inject known risky releases for evaluation.\n6. Do not use an external LLM as the primary release decision engine.",
    expectations: "1. Dashboard must show release readiness, risk by module, predicted failure modes, similar incidents, rollout strategy comparison, and final recommendation.\n2. Show expected impact of each rollout strategy.\n3. Show evidence behind the release decision.\n4. Evaluate earlier detection against a simple pass/fail CI baseline.\n5. Demonstrate re-evaluation after simulated production feedback."
  },
  {
    title: "InvoiceMind - Autonomous Accounts-Payable Investigation Agent",
    description: "Organizations process large numbers of invoices containing prices, quantities, vendor information, purchase orders, taxes, and payment history. Manual review is expensive, while simple rules generate too many false positives. Build an AI system that investigates invoices before payment, determines whether an anomaly is legitimate, estimates financial risk, and chooses approve, hold, verify, or escalate.",
    requirements: "1. Implement invoice-field extraction, duplicate detection, price/quantity anomaly detection, vendor behavior risk, payment risk, and financial-impact estimation.\n2. Maintain invoice, purchase-order, and vendor history.\n3. Build an agent that selectively investigates related records instead of inspecting everything equally.\n4. Support duplicate, price, quantity, and vendor-history anomaly scenarios.\n5. Include simulated reviewer feedback.\n6. Track review effort and money at risk.",
    expectations: "1. Dashboard must show total invoices, auto-approved vs reviewed, money at risk, duplicate clusters, vendor risk, and investigation queue.\n2. Show evidence used for each decision.\n3. Show financial impact and confidence.\n4. Compare agent-assisted review against simple rules.\n5. Measure reduction in review effort while controlling false approvals."
  },
  {
    title: "ReturnWise - Autonomous E-Commerce Returns Investigator",
    description: "Online businesses lose money when legitimate returns are mixed with repeated abuse, damaged-item claims, incorrect-product claims, and unusual customer behavior. Build an AI investigation system that determines whether a return should be approved, inspected, exchanged, restricted, or escalated while balancing customer experience and business loss.",
    requirements: "1. Implement return-reason classification, customer behavior modeling, product-defect patterns, return-abuse risk, resale-value prediction, and expected-loss estimation.\n2. Combine current return evidence with customer and product history.\n3. Build an agent that investigates context, simulates possible actions, and selects one under business constraints.\n4. Support multiple return scenarios and changing customer/product history.\n5. Allow a judge to modify history and rerun the decision.\n6. Include an explicit loss-vs-customer-impact trade-off.",
    expectations: "1. Dashboard must show return risk, customer/product factors, estimated financial impact, recommended action, and decision evidence.\n2. Show how the decision changes when context changes.\n3. Show trends in return abuse and product defects.\n4. Compare against a simple rule baseline.\n5. Report prevented-loss or expected-loss reduction."
  },
  {
    title: "ShiftPilot - Autonomous Service-Center Queue Orchestrator",
    description: "Customer-service centers face unpredictable demand and limited staffing. Predicting call volume alone does not solve the problem. Build an AI system that forecasts workload, predicts queue delays, estimates SLA risk, and dynamically determines how available agents should be allocated across queues.",
    requirements: "1. Implement arrival-volume forecasting, service-time prediction, queue-delay prediction, customer-priority prediction, agent-skill matching, and SLA-risk prediction.\n2. Represent queue state, agent capacity, skills, and current assignments.\n3. Build an agent that generates alternative staffing allocations and simulates waiting-time/SLA outcomes.\n4. Support demand spikes and agent unavailability.\n5. Compare dynamic allocation with a fixed staffing policy.\n6. Allow re-planning when new demand arrives.",
    expectations: "1. Dashboard must show queue health, predicted arrivals, wait-time forecasts, SLA risk, agent utilization, and current vs proposed allocation.\n2. Show before/after simulation for a disruption.\n3. Display the selected allocation and its expected improvement.\n4. Measure waiting-time and SLA-risk reduction.\n5. Show agent decision history."
  },
  {
    title: "Adaptive Story Challenge - Autonomous Learning Strategy Engine",
    description: "Conventional learning systems often present the same content sequence to every learner. Build an adaptive learning environment that maintains an evolving representation of learner knowledge and chooses the next learning intervention expected to maximize mastery within a limited interaction or time budget.",
    requirements: "1. Implement knowledge-state estimation, concept mastery prediction, misconception detection, difficulty estimation, learning-gain prediction, and content/branch ranking.\n2. Maintain a structured concept graph and learner state.\n3. Build an agent that chooses among revision, new concept, hint, explanation, easier/harder challenge, or scenario branch.\n4. Track correctness, response time, repeated errors, and simulated learner profiles.\n5. Give the agent a limited teaching budget.\n6. Compare adaptive learning against a fixed sequence.",
    expectations: "1. Dashboard must show mastery graph, misconception map, learning trajectory, chosen interventions, difficulty progression, and predicted final mastery.\n2. Show how the strategy changes for different learner states.\n3. Show before/after learning outcome.\n4. Measure expected or simulated learning-gain improvement over baseline.\n5. Keep the experience interactive rather than a generic chatbot."
  },
  {
    title: "StockShield - Inventory Disruption Recovery Agent",
    description: "Retail businesses often discover stock problems too late. A product can look healthy while demand shifts, suppliers delay shipments, or a region consumes inventory faster. Build an AI system that predicts upcoming inventory failures and autonomously creates recovery strategies.",
    requirements: "1. Implement demand forecasting, stockout probability, supplier-delay prediction, regional demand-shift detection, recovery-outcome prediction, and lost-revenue prediction.\n2. Model products, suppliers, regions, lead times, and inventory capacity.\n3. Build an agent that generates reorder, transfer, allocation, or supplier-switch strategies.\n4. Simulate the outcome of competing recovery strategies.\n5. Support at least two disruption types.\n6. Allow a judge to inject a demand or supplier shock.",
    expectations: "1. Dashboard must show products at risk, stockout dates, supplier risk, regional demand, expected lost revenue, and strategy comparison.\n2. Show the recommended recovery action.\n3. Show current vs recovered inventory state.\n4. Compare against a fixed reorder-point baseline.\n5. Measure stockouts or expected lost revenue avoided."
  },
  {
    title: "ClaimCheck - Autonomous Insurance Claim Investigation Simulator",
    description: "Insurance operations receive claims containing narratives, invoices, timelines, prior claim history, and supporting evidence. Simple rules create excessive false positives while manual review is expensive. Build an AI investigation system that determines which claims can be processed quickly, which require more evidence, and which require human investigation.",
    requirements: "1. Implement claim-type classification, narrative inconsistency detection, historical-claim similarity, fraud/anomaly risk, claim-cost prediction, and evidence-priority ranking.\n2. Build an agent that chooses which evidence source to inspect next.\n3. Maintain an investigation state and update claim risk after new evidence.\n4. Use synthetic or public claim-style data only.\n5. Include simulated reviewer feedback.\n6. Treat the system as an operational simulation, not real insurance adjudication.",
    expectations: "1. Dashboard must show claims queue, risk score, estimated financial exposure, evidence inspected, investigation path, final action, and confidence.\n2. Show which evidence changed the decision.\n3. Measure analyst-review reduction and false-positive trade-off.\n4. Demonstrate selective investigation rather than full review for every claim.\n5. Compare with a rule-based triage baseline."
  },
  {
    title: "ProcurementPilot - Intelligent Supplier Strategy Agent",
    description: "A company must procure materials from several suppliers under uncertain price, quality, delivery, and capacity conditions. Build an AI system that predicts supplier performance and creates procurement strategies that minimize total business risk and cost.",
    requirements: "1. Implement price prediction, supplier reliability prediction, delivery-time prediction, quality-risk prediction, capacity prediction, and procurement cost/risk optimization.\n2. Use at least three suppliers with minimum/maximum order constraints.\n3. Build an agent that generates multiple allocation strategies and simulates their outcomes.\n4. Support supplier disruption such as price, capacity, or reliability changes.\n5. Track historical supplier performance.\n6. Re-plan dynamically when supplier conditions change.",
    expectations: "1. Dashboard must show supplier risk matrix, recommended allocation, expected cost, delivery risk, quality risk, and scenario comparison.\n2. Show agent strategy history.\n3. Compare against a single-supplier or rule-based baseline.\n4. Measure expected cost/risk improvement under changing conditions.\n5. Explain why the allocation was selected."
  },
  {
    title: "ProcessX - Autonomous Business Bottleneck Investigator",
    description: "A company notices that a critical business process has become slower or more expensive but does not know which stage is responsible or what intervention will provide the best return. Build an AI system that investigates the process, identifies bottlenecks, generates hypotheses, simulates interventions, and recommends the highest-impact improvement.",
    requirements: "1. Implement process-time prediction, bottleneck detection, process anomaly detection, delay-cause prediction, intervention-impact prediction, and ROI optimization.\n2. Use event-log style process data with at least five stages.\n3. Build an agent that chooses which stage or factor to investigate next.\n4. Generate at least two intervention options with different costs and expected effects.\n5. Simulate intervention outcomes before recommending one.\n6. Support a second bottleneck appearing after the first intervention.",
    expectations: "1. Dashboard must show process map, stage health, bottleneck ranking, delay causes, investigation tree, intervention simulation, expected improvement, and ROI.\n2. Show the investigation path used by the agent.\n3. Compare against fixed-rule bottleneck analysis.\n4. Measure expected cycle-time or cost improvement.\n5. Demonstrate re-planning after a new bottleneck appears."
  },
  {
    title: "SOCPilot - Autonomous Security Alert Investigation Agent",
    description: "Security teams receive large volumes of alerts, but many are low-value or duplicate signals. Build an AI security-operations agent that groups related alerts into probable incidents, investigates the most important evidence, and prioritizes what analysts should handle first.",
    requirements: "1. Implement alert classification, alert clustering/relatedness, user/device behavior anomaly detection, threat-severity prediction, incident correlation, and risk-priority scoring.\n2. Generate at least 100 simulated alerts with known multi-alert incident groups.\n3. Build an investigation state and agent that chooses what to inspect next.\n4. Support escalation, grouping, suppression, and analyst-review outcomes.\n5. Include analyst feedback simulation.\n6. Measure noise reduction without losing true simulated incidents.",
    expectations: "1. Dashboard must show alert volume, incident clusters, threat severity, investigation graph/timeline, analyst priority queue, agent actions, and supporting evidence.\n2. Show alert-to-incident compression.\n3. Show why each incident received its priority.\n4. Compare against raw-alert severity sorting.\n5. Measure analyst workload reduction and incident preservation."
  },
  {
    title: "SLAShield - Security SLA Breach Prevention Agent",
    description: "Security incidents can become business failures when response or resolution SLAs are missed. Build an AI system that predicts which tickets are likely to breach SLA and autonomously recommends re-assignment, escalation, or prioritization actions.",
    requirements: "1. Implement incident-severity classification, resolution-time prediction, SLA-breach probability, analyst workload prediction, queue-delay prediction, and escalation-priority scoring.\n2. Use synthetic security tickets with configurable SLA rules.\n3. Model analyst capacity, current queue, ticket severity, and historical resolution times.\n4. Build an agent that simulates reassignments/escalations before deciding.\n5. Allow tickets and workload to change during the demo.\n6. Compare against first-come-first-served or static severity rules.",
    expectations: "1. Dashboard must show active tickets, SLA countdowns, breach probabilities, analyst capacity, escalation queue, breach trend, and breaches avoided.\n2. Show before/after queue state.\n3. Show the reason for escalation or reassignment.\n4. Measure expected SLA breaches avoided and workload balance.\n5. Demonstrate live re-planning as the queue changes."
  },
  {
    title: "IdentityShield - Autonomous Account Compromise Investigator",
    description: "Account compromise rarely appears as a single obvious event. A risky incident may consist of an unusual login, a new device, abnormal access patterns, a privilege change, and unusual data activity. Build an AI investigation system that estimates compromise probability and determines what evidence should be examined next.",
    requirements: "1. Implement login anomaly detection, device-behavior modeling, access-pattern anomaly detection, privilege-change risk, data-access anomaly detection, and account-compromise probability.\n2. Create normal behavior profiles from historical simulated activity.\n3. Inject several compromise patterns.\n4. Build an agent that selects evidence sources and updates account risk.\n5. Include time, location, device, endpoint, privilege, and data-access signals.\n6. Link decisions to evidence.",
    expectations: "1. Dashboard must show account risk, normal vs current behavior, incident timeline, evidence inspected, affected resources, compromise probability, and containment priority.\n2. Show which signal combinations increased the risk.\n3. Measure detection lead time and false-alert trade-off.\n4. Compare against independent rule alerts.\n5. Demonstrate investigation of an unseen compromise pattern."
  },
  {
    title: "SupplyGuard - Autonomous Software Supply-Chain Compromise Investigator",
    description: "A software dependency can be vulnerable or compromised without being directly imported by an important application path. Build an AI system that determines the real blast radius of a suspicious dependency and selects the safest remediation strategy.",
    requirements: "1. Implement dependency/component extraction, vulnerability classification, reachability/impact analysis, exploitability prediction, application-impact prediction, and remediation-risk modeling.\n2. Accept package manifests and a prepared vulnerability dataset.\n3. Construct a direct and transitive dependency graph.\n4. Inject a vulnerable or suspicious dependency.\n5. Build an agent that compares upgrade, isolation, replacement, or monitoring strategies.\n6. Calculate before/after exposure.",
    expectations: "1. Dashboard must show dependency graph, vulnerable components, affected features, reachability score, blast radius, remediation comparison, and before/after risk.\n2. Explain why a vulnerable component is or is not high priority.\n3. Measure prioritization accuracy on injected scenarios.\n4. Measure reduced unnecessary remediation compared with severity-only ranking.\n5. Show the agent's remediation reasoning path."
  },
  {
    title: "PhishChain - Social-Engineering Attack Progression Analyzer",
    description: "Sophisticated social-engineering attacks may unfold through a sequence of messages: trust-building, urgency, impersonation, information requests, and escalation. Build an AI system that models the conversation as an evolving threat state rather than classifying each message independently.",
    requirements: "1. Implement message intent classification, social-engineering stage detection, sender-relationship modeling, URL/attachment risk, conversation anomaly detection, and attack-progression scoring.\n2. Use synthetic or public example conversations.\n3. Track sender relationship and conversation metadata.\n4. Inject staged attack patterns.\n5. Build an agent that updates the threat state and selects evidence.\n6. Identify the messages that caused the risk state to change.",
    expectations: "1. Dashboard must show threat score over time, manipulation stages, suspicious messages, sender relationship, evidence indicators, attack progression graph, and recommended action.\n2. Compare conversation-level analysis with message-by-message classification.\n3. Measure earlier detection of multi-stage attacks.\n4. Explain the transition from normal conversation to high-risk interaction.\n5. Show agent evidence-selection steps."
  },
  {
    title: "BreachScope - Autonomous Security Incident Impact Estimator",
    description: "After a security incident is detected, responders need to know what has actually been affected: users, applications, data categories, and business services. Build an AI system that estimates incident impact and investigates the evidence required to reduce uncertainty.",
    requirements: "1. Implement security-event classification, asset relationship/impact modeling, lateral-impact prediction, data-sensitivity classification, business-impact prediction, and incident-severity modeling.\n2. Use simulated authentication, process, file, network, and asset relationship data.\n3. Include several incident scenarios with known ground truth.\n4. Build an agent that traces impact paths and selectively requests evidence.\n5. Represent asset criticality and data sensitivity.\n6. Link every conclusion to supporting evidence.",
    expectations: "1. Dashboard must show incident map, affected assets, data categories, business-impact score, attack/impact timeline, uncertainty zones, containment priority, and evidence graph.\n2. Show how new evidence reduces uncertainty.\n3. Measure affected-asset recall against synthetic ground truth.\n4. Measure analyst time saved compared with manual impact reconstruction.\n5. Keep all inputs simulated or authorized."
  },
  {
    title: "VulnOps - Autonomous Vulnerability Remediation Planner",
    description: "A company may have hundreds of known vulnerabilities but limited engineering capacity. The difficult problem is deciding what to fix first, which remediation strategy to use, and how much risk the company will remove by doing so. Build a security planning system that treats remediation as a constrained optimization problem.",
    requirements: "1. Implement vulnerability severity modeling, exploitability prediction, asset-exposure modeling, business-criticality prediction, fix-impact prediction, and remediation-priority optimization.\n2. Use a prepared vulnerability dataset with asset, exposure, criticality, exploitability, and estimated effort.\n3. Give the system a limited remediation budget.\n4. Build an agent that compares remediation alternatives.\n5. Inject a new high-priority vulnerability during the planning cycle.\n6. Re-plan the queue without restarting.",
    expectations: "1. Dashboard must show vulnerability heatmap, business exposure, exploitability, priority queue, engineering effort, predicted risk reduction, before/after simulation, and agent planning trace.\n2. Compare against severity-only prioritization.\n3. Measure expected risk reduction per unit of engineering effort.\n4. Show how the plan changes when the remediation budget changes.\n5. Show why the final queue is optimal or preferable under the defined objective."
  }
];

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = memo(({ children, color = 'green', pulse = false, className = '' }) => {
 const v = {
 green: 'bg-[#00FF66]/15 border-[#00FF66]/30 text-[#00FF66]',
 cyan: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
 yellow: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400',
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
const SectionHeader = memo(({ icon: Icon, iconColor = 'text-[#00FF66]', children, rightSlot, index }) => (
 <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
 <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
 <Icon className={`w-4 h-4 ${iconColor}`} />
 {index && <span className="text-[#00FF66]/60">[{String(index).padStart(2, '0')}]</span>}
 <span>{children}</span>
 </h3>
 {rightSlot}
 </div>
));

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Spinner = () => (
 <div className="py-16 flex flex-col items-center justify-center gap-4 text-emerald-400">
 <div className="relative flex items-center justify-center w-12 h-12">
 <motion.div
 className="absolute inset-0 border-2 border-[#00FF66] rounded-full mix-blend-screen"
 animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.4, 0] }}
 transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
 />
 <div className="w-4 h-4 bg-[#00FF66] rounded-full shadow-[0_0_15px_rgba(0,255,102,0.8)]" />
 </div>
 <p className="text-xs font-mono uppercase tracking-widest animate-pulse text-[#00FF66]">
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
        if (dbSelection && list.length > 0) {
          const matched = list.find(p => p.title === dbSelection);
          if (matched) {
            setSelectedProblem(matched);
            localStorage.setItem(`selected_problem_${teamId}`, JSON.stringify(matched));
          }
        } else if (!dbSelection) {
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

 const parseProblemsCsv = (csvText) => {
 const lines = csvText.split('\n');
 const list = [];
 for (let i = 1; i < lines.length; i++) {
 const line = lines[i].trim();
 if (!line) continue;
 const content = line.replace(/^"/, '').replace(/"$/, '');
 const fields = content.split('","');
 if (fields.length >= 4) {
 list.push({
 title: fields[0].trim(),
 description: fields[1].trim(),
 requirements: fields[2].replace(/\\n/g, '\n').trim(),
 expectations: fields[3].replace(/\\n/g, '\n').trim(),
 });
 }
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
 const finalList = list.length > 0 ? list : DEFAULT_PROBLEMS;
 try { sessionStorage.setItem(PROBLEMS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), list: finalList })); } catch (_) { }

 setProblemsList(finalList);
 await fetchCounts();
 await fetchTeamDetails(finalList);
 } catch (err) {
 console.warn('Problem CSV Load Notice: Falling back to default challenge catalog.', err);
 setProblemsList(DEFAULT_PROBLEMS);
 setCsvLoadError('');
 await fetchCounts();
 await fetchTeamDetails(DEFAULT_PROBLEMS);
 } finally {
 setCsvLoading(false);
 }
 };
 loadProblemData();
 }, []);

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
 setErrorMessage(result.detail || 'Could not select challenge. Please try again.');
 setConfirmSelectionProb(null);
 await fetchCounts();
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

 const handleFileUpload = async (memberName, file) => {
 if (!file) return;
 if (file.type !== 'application/pdf') { setUploadErrors(p => ({ ...p, [memberName]: 'Invalid format. Only PDF files are allowed.' })); return; }
 if (file.size > 5 * 1024 * 1024) { setUploadErrors(p => ({ ...p, [memberName]: 'File is too large. Maximum size is 5 MB.' })); return; }
 setUploadErrors(p => ({ ...p, [memberName]: null }));
 setUploadingMember(memberName);
 try {
 const response = await fetch(`${API_BASE_URL}/api/certificates/generate-upload-url`, {
 method: 'POST', headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ team_id: teamId, member_name: memberName, file_name: file.name, cert_type: 'Data Analytics Essentials' }),
 });
 if (!response.ok) throw new Error('Failed to generate presigned upload URL.');
 const { presigned_url } = await response.json();
 const s3Response = await fetch(presigned_url, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: file });
 if (!s3Response.ok) throw new Error('S3 Upload Failed.');
 await fetchTeamDetails();
 } catch (err) {
 setUploadErrors(p => ({ ...p, [memberName]: err.message || 'Failed to complete upload request.' }));
 } finally { setUploadingMember(null); }
 };

 // ── Metadata Helpers ─────────────────────────────────────────────────────
 const getDifficulty = (idx) => {
 const labels = ['Hard', 'Medium', 'Hard', 'Medium', 'Insane'];
 const label = labels[idx] ?? 'Insane';
 const colors = {
 Hard: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
 Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
 Insane: 'text-red-400 bg-red-500/10 border-red-500/25',
 };
 return { label, color: colors[label] };
 };
 const getPoints = i => (['500 PTS', '300 PTS', '450 PTS', '350 PTS', '600 PTS'])[i] ?? '600 PTS';
 const getCategory = i => (['Cryptography', 'Network Sync', 'Reverse Eng.', 'Security Protocol', 'Smart Contracts'])[i] ?? 'Smart Contracts';
 const getEntrypoint = i => (['satellite_sub_dev_04', 'dynamic_salt_buffer', 'router_telemetry_parser', 'sat_link_mainframe', 'ledger_smart_contract'])[i] ?? 'ledger_smart_contract';
 const getVector = i => (['0x7FFF98AC8210', '0x7FFF98AC8220', '0x7FFF98AC8230', '0x7FFF98AC8240', '0x7FFF98AC8250'])[i] ?? '0x7FFF98AC8250';
 const getSeed = i => (['0xDEADC0DE_FEEDFACE', '0xDEADC0DE_FEED1234', '0xDEADC0DE_FEED5678', '0xDEADC0DE_FEED90AB', '0xDEADC0DE_FEEDCDEF'])[i] ?? '0xDEADC0DE_FEEDCDEF';

 const activeSelectedProblem = React.useMemo(() => {
 if (!selectedProblem) return null;
 const searchList = problemsList.length > 0 ? problemsList : DEFAULT_PROBLEMS;
 const titleToMatch = typeof selectedProblem === 'string' ? selectedProblem.trim().toLowerCase() : (selectedProblem.title || '').trim().toLowerCase();
 const matched = searchList.find(p => p.title.trim().toLowerCase() === titleToMatch) ||
 DEFAULT_PROBLEMS.find(p => p.title.trim().toLowerCase() === titleToMatch);

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
 const si = (problemsList.length > 0 ? problemsList : DEFAULT_PROBLEMS).findIndex(p => p.title === activeProb?.title);
 const selectedDifficulty = getDifficulty(si !== -1 ? si : 0);
 const selectedPoints = getPoints(si !== -1 ? si : 0);
 const selectedCategory = getCategory(si !== -1 ? si : 0);
 const selectedEntrypoint = getEntrypoint(si !== -1 ? si : 0);
 const selectedVector = getVector(si !== -1 ? si : 0);
 const selectedSeed = getSeed(si !== -1 ? si : 0);

 const getRoadmapPhases = () => {
 const isSubmitted = !!teamData?.DeployedLink;
 const reviewStatus = teamData?.EvaluationStatus || 'Pending Review';
 return [
 { name: 'Challenge Selected', desc: selectedProblem?.title || 'None Selected', status: selectedProblem ? 'completed' : 'pending' },
 { name: 'Review 1: Strategy', desc: 'Architecture & schemas evaluation.', status: reviewStatus !== 'Pending Review' ? 'completed' : 'current' },
 { name: 'Review 2: Prototype', desc: 'Functional APIs & network sync check.', status: reviewStatus === 'Approved' ? 'completed' : 'pending' },
 { name: 'Final Review: Demo', desc: 'Product demonstrations & benchmarks.', status: reviewStatus === 'Approved' ? 'completed' : 'pending' },
 { name: 'Submit GitHub Repo Link', desc: isSubmitted ? 'Repository link submitted' : 'Awaiting GitHub repository URL', status: isSubmitted ? 'completed' : 'current' },
 ];
 };

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
            className="group flex items-center justify-center p-2 rounded-lg border border-zinc-800 hover:border-[#00FF66]/60 bg-white/[0.03] text-slate-400 hover:text-[#00FF66] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </motion.button>

          <AcmLogo className="h-7 w-7" />

          <div className="flex flex-col gap-1">
            <DsfrutarLogo inline className="text-lg" showSub={false} />
            <span className="text-[10px] text-[#00FF66]/80 font-mono tracking-widest uppercase leading-none mt-0.5">DSFRUTAR-2K26 WORKSPACE</span>
          </div>

 <Badge color="green" className="hidden sm:inline-flex">Broadcasting Active</Badge>
 </div>

 <div className="flex items-center gap-4">
 <div className="hidden md:flex flex-col text-right text-[11px] text-slate-500">
 <span>TEAM_REF: <span className="text-[#00FF66] font-bold">{teamId}</span></span>
 <span>SECURE_SHELL: <span className="text-emerald-400">ACTIVE</span></span>
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
 <h2 className="text-sm font-bold text-[#00FF66] uppercase tracking-widest flex items-center gap-2 font-mono">
 <BookOpen className="w-4 h-4" />
 Select Your Hackathon Challenge Statement
 </h2>
 <motion.button
 onClick={onBack}
 whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
 className="text-xs text-slate-400 hover:text-yellow-400 border border-zinc-800 hover:border-yellow-400/50 bg-white/[0.02] px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer font-sans font-semibold lab-btn-ripple"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 Return to Mainboard
 </motion.button>
 </div>

 <motion.div variants={fadeUp} className="mb-6 p-4 bg-yellow-500/[0.05] border border-yellow-500/20 rounded-2xl text-xs leading-relaxed text-slate-400 font-sans font-medium flex items-start gap-3">
 <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
 <div>
 <span className="font-extrabold text-yellow-500 uppercase block tracking-wider mb-0.5 text-xs">CAPACITY GUARDRAILS IN EFFECT</span>
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
 problemsList.filter(p => (selectionCounts[p.title] || 0) < 3).length === 0 ? (
 <div className="py-16 text-center text-slate-500 font-mono text-xs italic">
 All challenge tracks have reached maximum capacity (3 teams each).
 </div>
 ) : (
 <motion.div variants={stagger} initial="hidden" animate="visible"
 className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {problemsList.map((prob, idx) => {
  const count = selectionCounts[prob.title] || 0;
  if (count >= 3) return null;

  const problemNumber = String(idx + 1).padStart(2, '0');

  return (
  <motion.div
  key={idx}
  variants={cardV}
  layout
  className="group relative rounded-xl cursor-pointer glass-capsule flex flex-col justify-between problem-card-hover overflow-hidden border border-white/10 bg-black/40 hover:border-[#00FF66]/40 transition-all p-6"
  >
  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#00FF66]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5 group-hover:ring-[#00FF66]/20 transition-all duration-300" />

  <div className="flex flex-col gap-4">
  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
  <span className="text-[#00FF66] font-mono text-xs uppercase font-bold tracking-widest flex items-center gap-1.5">
  <BookOpen className="w-4 h-4" />
  Problem Statement {problemNumber}
  </span>
  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider border ${count === 2 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 font-bold' : 'bg-[#00FF66]/10 border-[#00FF66]/20 text-[#00FF66]'}`}>
  {count}/3 Slots Claimed
  </span>
  </div>

  <div className="py-6 flex flex-col items-center justify-center text-center gap-3">
  <div className="w-16 h-16 rounded-2xl bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center justify-center text-2xl font-extrabold font-orbitron text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.15)] group-hover:scale-105 transition-transform">
  #{problemNumber}
  </div>
  <h3 className="text-base font-extrabold text-white font-orbitron uppercase tracking-wide">
  Problem Statement {problemNumber}
  </h3>
  <p className="text-xs text-slate-400 font-sans max-w-xs">
  Select this number to lock your problem statement. Full problem description and requirements will be revealed upon confirmation.
  </p>
  </div>
  </div>

  <div className="pt-4 border-t border-white/[0.05]">
  <motion.button
  onClick={() => setConfirmSelectionProb(prob)}
  className="w-full font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest bg-[#00FF66] text-slate-950 hover:bg-yellow-400 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] lab-btn-ripple relative z-10"
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
 <BookOpen className="w-32 h-32 text-yellow-400" />
 </div>
 <SectionHeader icon={BookOpen} iconColor="text-yellow-400" index={1} rightSlot={<Badge color="green" pulse>Locked Track</Badge>}>
 Selected Challenge Track
 </SectionHeader>

 <h2 className="text-xl md:text-2xl font-extrabold text-white mb-3 font-orbitron uppercase tracking-wide animate-holographic-reveal">{activeProb?.title}</h2>
 <p className="text-slate-300 leading-relaxed text-base font-sans font-medium mb-5 animate-slide-up-fade" style={{ animationDelay: '0.2s' }}>{activeProb?.description}</p>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/[0.05]">
 {activeProb?.requirements && (
 <div>
 <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <ListChecks className="w-4 h-4" />Execution Requirements
 </h3>
 <ul className="space-y-2 text-sm text-slate-400 leading-relaxed font-sans font-medium">
 {activeProb.requirements.split('\n').filter(Boolean).map((req, i) => (
 <li key={i} className="flex gap-2 items-start">
 <span className="text-yellow-400 font-mono font-bold mt-0.5 shrink-0">•</span><span>{req.trim()}</span>
 </li>
 ))}
 </ul>
 </div>
 )}
 {activeProb?.expectations && (
 <div>
 <h3 className="text-sm font-bold text-[#00FF66] uppercase tracking-wider mb-2 flex items-center gap-1.5">
 <Award className="w-4 h-4" />Submission Expectations
 </h3>
 <ul className="space-y-2 text-sm text-slate-400 leading-relaxed font-sans font-medium">
 {activeProb.expectations.split('\n').filter(Boolean).map((exp, i) => (
 <li key={i} className="flex gap-2 items-start">
 <span className="text-[#00FF66] font-mono font-bold mt-0.5 shrink-0">•</span><span>{exp.trim()}</span>
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
 <SectionHeader icon={MessageSquare} iconColor="text-yellow-400" index={2} rightSlot={<Badge color="yellow" pulse>Live Feed</Badge>}>
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
 className="p-3 bg-yellow-400/[0.04] border-l-2 border-yellow-400 rounded-r-xl">
 <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-emerald-400">
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
 <SectionHeader icon={Users} iconColor="text-yellow-400" index={3}>
 Team Participants
 </SectionHeader>

 {loadingTeam ? (
 <div className="py-6 text-center text-sm text-slate-500 font-mono animate-pulse">&gt;&gt; Retrieving roster matrix...</div>
 ) : teamData?.Members?.length > 0 ? (
 <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {teamData.Members.map((member, index) => {
 const uploadErr = uploadErrors[member.name];
 const memberCerts = teamData.Certificates?.[member.name] || [];
 return (
 <motion.div key={index} variants={cardV} layout
 className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div className="flex items-center gap-3">
 <span className="w-7 h-7 rounded bg-black/60 border border-[#00FF66]/20 text-[#00FF66] flex items-center justify-center text-sm font-bold font-mono shrink-0">
 {String(index + 1).padStart(2, '0')}
 </span>
 <h4 className="text-base font-bold text-white uppercase tracking-wide font-mono">{member.name}</h4>
 </div>
 <Badge color="slate">RegID: {member.regNo}</Badge>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono text-slate-400 mt-2 p-3 bg-black/40 rounded-lg border border-white/5">
 <div className="truncate flex items-center gap-2">
 <span className="text-[9px] text-yellow-500/70 uppercase tracking-widest font-bold w-10">Mail</span>
 <span className="truncate text-white/80">{member.email}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-yellow-500/70 uppercase tracking-widest font-bold w-10">Phone</span>
 <span className="text-white/80">{member.phone}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-yellow-500/70 uppercase tracking-widest font-bold w-10">Dept</span>
 <span className="text-emerald-400 font-bold uppercase">{member.year} • {member.branch}</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[9px] text-yellow-500/70 uppercase tracking-widest font-bold w-10">Stay</span>
 <span className="text-[#00FF66] font-bold uppercase">{member.accommodation || 'Dayscholar'}</span>
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
  <SectionHeader icon={Globe} iconColor="text-yellow-400" index={5} rightSlot={<Badge color="yellow">Repo Link</Badge>}>
  GitHub Repository Link
  </SectionHeader>
  <p className="text-sm text-slate-400 font-sans leading-relaxed mb-4 font-medium">
  Submit the GitHub repository URL for your project. This link will be used by evaluators to review your codebase and submission.
  </p>
  <AnimatePresence>
  {linkSuccess && (
  <motion.div variants={scaleIn} initial="hidden" animate="visible" exit="exit"
  className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-xl text-sm flex items-center gap-2">
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
  className="w-full px-4 py-3 bg-black/40 border border-white/10 focus:border-yellow-400/60 rounded-xl text-white placeholder-slate-700 focus:outline-none text-sm font-mono transition-colors" />
  <motion.button type="submit" disabled={submittingLink}
  whileHover={{ scale: submittingLink ? 1 : 1.01 }} whileTap={{ scale: submittingLink ? 1 : 0.99 }}
  className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-sm uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 lab-btn-ripple">
  <Send className="w-4 h-4" />
  {submittingLink ? 'Submitting...' : 'Submit Repository'}
  </motion.button>
  </form>
  {teamData?.DeployedLink && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
  className="mt-4 pt-3 border-t border-white/[0.05] text-xs font-mono flex items-center justify-between text-slate-500">
  <span>Submitted Repo:</span>
  <a href={teamData.DeployedLink} target="_blank" rel="noreferrer"
  className="text-yellow-400 hover:underline flex items-center gap-1 font-semibold">
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
 <div className="w-12 h-12 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/25 text-[#00FF66] flex items-center justify-center mx-auto mb-5">
 <Lock className="w-5 h-5" />
 </div>
 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Confirm Challenge Selection</h3>
  <p className="text-[11px] text-slate-400 font-sans mb-6 leading-relaxed">
  You are about to lock in{' '}
  <span className="text-white font-bold font-mono">
  "Problem Statement {String(((problemsList.length > 0 ? problemsList : DEFAULT_PROBLEMS).findIndex(p => p.title === confirmSelectionProb.title) !== -1 ? (problemsList.length > 0 ? problemsList : DEFAULT_PROBLEMS).findIndex(p => p.title === confirmSelectionProb.title) : 0) + 1).padStart(2, '0')}"
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
 className={`flex-1 ${isLocking ? 'bg-zinc-600 opacity-50 cursor-not-allowed text-white' : 'bg-[#00FF66] hover:bg-yellow-400 hover:text-black text-slate-950 cursor-pointer'} font-extrabold py-2.5 rounded-xl text-[10px] uppercase transition-colors flex items-center justify-center gap-1.5`}>
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
