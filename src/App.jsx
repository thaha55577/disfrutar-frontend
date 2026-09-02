import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Login from './components/user/Login';
import AnimatedBackground from './components/AnimatedBackground';
import BroadcastListener from './components/user/BroadcastListener';

const HackathonDetails = React.lazy(() => import('./components/user/HackathonDetails'));
const WaitingRoom = React.lazy(() => import('./components/user/WaitingRoom'));
const ProblemDashboard = React.lazy(() => import('./components/user/ProblemDashboard'));
const RoadmapPage = React.lazy(() => import('./components/user/RoadmapPage'));
const AdminGateway = React.lazy(() => import('./components/admin/AdminGateway'));
const TelemetryPendingScreen = React.lazy(() => import('./components/user/TelemetryPendingScreen'));
const GfgScreen = React.lazy(() => import('./components/user/GfgScreen'));
const JudgesPanel = React.lazy(() => import('./components/user/JudgesPanel'));
import { isTeamLoggedIn, logoutTeam } from './utils/auth';
import { API_BASE_URL } from './utils/api';

const LoadingFallback = () => (
  <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#010c18]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B82F6]"></div>
    <p className="mt-4 text-[#3B82F6] font-mono tracking-widest text-sm uppercase">Optimizing Sequence...</p>
  </div>
);

/**
 * Orchestrates the General User Flow states:
 * 1. If not authenticated -> Login
 * 2. If authenticated -> Mainboard Hub (HackathonDetails)
 * 3. From Mainboard, infinite navigation back & forth to:
 *    - GfgScreen (GFG chapter portal)
 *    - JudgesPanel (Chief Guests & Live Evaluations)
 *    - Problem Workspace loop (Selection grid / Dashboard)
 * 4. Workspace gatekeeping processes countdown and capacity checks.
 */
function GeneralUserFlow() {
  const [isLoggedIn, setIsLoggedIn] = useState(isTeamLoggedIn());
  const [isTimerLaunched, setIsTimerLaunched] = useState(false);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [hasSelectedProblem, setHasSelectedProblem] = useState(false);
  const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);

  // Navigation sub-view controller
  const [activeScreen, setActiveScreen] = useState('main'); // 'main', 'gfg', 'judges', 'workspace'

  // Periodically synchronize state values (timer, selection configurations, team selection)
  useEffect(() => {
    const syncStates = async () => {
      const loggedIn = isTeamLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        // Sync setting configuration
        let launched = false;
        let startTime = 0;
        try {
          const settingsRes = await fetch(`${API_BASE_URL}/settings`);
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            setIsSelectionEnabled(!!settingsData.SelectionEnabled);
            launched = !!settingsData.TimerLaunched;
            startTime = settingsData.TimerStartTime ? parseInt(settingsData.TimerStartTime, 10) : 0;
            setTimerStartTime(startTime);
            // Sync clock offset so expiry checks use server time
            if (settingsData.ServerTime) {
              const serverMs = parseFloat(settingsData.ServerTime) * 1000;
              window.__timerClockOffsetMs = serverMs - Date.now();
            }
          }
        } catch (err) {
          console.error('Error syncing settings in App.jsx:', err);
        }

        // Sync team selected problem
        const teamId = sessionStorage.getItem('team_id');
        if (teamId) {
          try {
            const teamRes = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(teamId)}`);
            if (teamRes.ok) {
              const teamData = await teamRes.json();
              const selected = teamData.SelectedProblem || teamData.selectedProblem;
              setHasSelectedProblem(!!selected);
            }
          } catch (err) {
            console.error('Error syncing team selection in App.jsx:', err);
          }
        } else {
          setHasSelectedProblem(false);
        }

        setIsTimerLaunched(launched);

        if (launched && startTime > 0) {
          const offsetMs = window.__timerClockOffsetMs || 0;
          const currentServerMs = Date.now() + offsetMs;
          const diffMs = (startTime * 1000) - currentServerMs;
          if (diffMs <= 0) {
            setIsTimerExpired(true);
          } else {
            setIsTimerExpired(false);
          }
        } else {
          setIsTimerExpired(false);
        }
      } else {
        setHasSelectedProblem(false);
        setIsTimerExpired(false);
        setIsSelectionEnabled(false);
        setActiveScreen('main');
      }
    };

    let syncTimeout;
    const syncStatesLoop = async () => {
      await syncStates();
      // Fast sync: 1500ms base delay + up to 1000ms jitter for quick dynamic updates
      const delay = 1500 + Math.random() * 1000;
      syncTimeout = setTimeout(syncStatesLoop, delay);
    };

    // Initial call
    syncStatesLoop();

    return () => clearTimeout(syncTimeout);
  }, []);

  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);
    setActiveScreen('main');
    try {
      const settingsRes = await fetch(`${API_BASE_URL}/settings`);
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setIsSelectionEnabled(!!settingsData.SelectionEnabled);
        const launched = !!settingsData.TimerLaunched;
        setIsTimerLaunched(launched);
        if (launched && settingsData.TimerStartTime) {
          const remaining = parseInt(settingsData.TimerStartTime, 10) - Math.floor(Date.now() / 1000);
          setIsTimerExpired(remaining <= 0);
        } else {
          setIsTimerExpired(false);
        }
      }
    } catch (err) {
      console.error('Error in handleLoginSuccess:', err);
    }
  };

  const handleLogout = () => {
    logoutTeam(); // Clear authentication tokens from storage
    setIsLoggedIn(false);
    setIsTimerLaunched(false);
    setIsTimerExpired(false);
    setHasSelectedProblem(false);
    setIsSelectionEnabled(false);
    setActiveScreen('main');
  };

  const handleTimerComplete = () => {
    setIsTimerExpired(true);
  };

  const handleEnterSelection = () => {
    setActiveScreen('workspace');
  };

  const handleBackToMainboard = () => {
    setActiveScreen('main');
  };

  // Renders the correct view based on credentials and active signals
  const renderView = () => {
    if (!isLoggedIn) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    if (activeScreen === 'gfg') {
      return <GfgScreen onBack={handleBackToMainboard} />;
    }

    if (activeScreen === 'judges') {
      return <JudgesPanel onBack={handleBackToMainboard} />;
    }

    if (activeScreen === 'roadmap') {
      return <RoadmapPage onBack={() => setActiveScreen('main')} />;
    }

    if (activeScreen === 'workspace') {
      // Gate 1: Timer not launched yet — show pending screen
      if (!isTimerLaunched) {
        return (
          <TelemetryPendingScreen
            onBack={handleBackToMainboard}
            onLogout={handleLogout}
          />
        );
      }

      // Gate 2: Timer launched but still counting down — show waiting room
      if (isTimerLaunched && !isTimerExpired) {
        return (
          <WaitingRoom
            initialStartTime={timerStartTime}
            onTimerComplete={handleTimerComplete}
            onLogout={handleLogout}
            onBack={handleBackToMainboard}
          />
        );
      }

      // Gate 3: Timer has expired — show problem dashboard
      return (
        <ProblemDashboard
          onLogout={handleLogout}
          onBack={handleBackToMainboard}
        />
      );
    }

    return (
      <HackathonDetails
        onLogout={handleLogout}
        isSelectionEnabled={isSelectionEnabled}
        onEnterSelection={handleEnterSelection}
        onNavigateToGfg={() => setActiveScreen('gfg')}
        onNavigateToJudges={() => setActiveScreen('judges')}
        onOpenRoadmap={() => setActiveScreen('roadmap')}
        hasSelectedProblem={hasSelectedProblem}
      />
    );
  };

  return (
    <div className="relative min-h-[100dvh] bg-black no-select">
      {isLoggedIn && <BroadcastListener />}
      <AnimatedBackground />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <React.Suspense fallback={<LoadingFallback />}>
              {renderView()}
            </React.Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<GeneralUserFlow />} />
          <Route path="/adminacm" element={<AdminGateway />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
}
