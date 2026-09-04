import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, HardDrive, RefreshCw, Cpu, LogOut, Play, Square, Clock, Lock, FileText, UploadCloud, CheckCircle, AlertTriangle, Trash2, X, Star, MessageSquare, ChevronDown, ChevronUp, GitBranch, Download, Link2 } from 'lucide-react';
import AcmLogo from '../AcmLogo';
import { API_BASE_URL } from '../../utils/api';

const ROADMAP_PHASES = [
 { id: '01', name: 'Registration', phase: 'Phase 01' },
 { id: '02', name: 'Problem Statement Selection', phase: 'Phase 02' },
 { id: '03', name: 'Review 1', phase: 'Phase 03' },
 { id: '04', name: 'Review 2', phase: 'Phase 04' },
 { id: '05', name: 'Prototype Development', phase: 'Phase 05' },
 { id: '06', name: 'Review 3', phase: 'Phase 06' },
 { id: '07', name: 'Final Presentation', phase: 'Phase 07' },
 { id: '08', name: 'Winner Announcement', phase: 'Phase 08' }
];

export default function AdminDashboard({ onLock }) {
 const [timerDuration, setTimerDuration] = useState(15); // Default 15 seconds
 const [timerLaunched, setTimerLaunched] = useState(false);
 const [timeLeft, setTimeLeft] = useState(null);
 const [csvTeamCount, setCsvTeamCount] = useState(0);
 const [timerExpiryTime, setTimerExpiryTime] = useState(null);
 const [clockOffset, setClockOffset] = useState(0); // server_time - client_time (in seconds)

 // announcements management state
 const [announcements, setAnnouncements] = useState(() => {
 return JSON.parse(localStorage.getItem('hackathon_announcements') || '[]');
 });
 const [announcementText, setAnnouncementText] = useState('');

 const [teamsList, setTeamsList] = useState([]);
 const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);

 // Delete Protection states
 const [isDeleteProtectionActive, setIsDeleteProtectionActive] = useState(false);

 // Feedback Gate state
 const [isFeedbackEnabled, setIsFeedbackEnabled] = useState(false);

 // Feedback Analytics viewer state
 const [showFeedbackViewer, setShowFeedbackViewer] = useState(false);
 const [expandedFeedback, setExpandedFeedback] = useState(null); // reg_no of expanded card

 // Roadmap Phase management state
 const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);

 // CSV parsing & seeding states
 const [uploadingCsv, setUploadingCsv] = useState(false);
 const [importMessage, setImportMessage] = useState('');
 const [csvError, setCsvError] = useState('');
 const [parsedTeams, setParsedTeams] = useState([]);
 const [parsedParticipants, setParsedParticipants] = useState([]);

 // Delete all teams states
 const [showDeleteModal, setShowDeleteModal] = useState(false);
 const [deletePassword, setDeletePassword] = useState('');
 const [deleteError, setDeleteError] = useState('');
 const [deleteMessage, setDeleteMessage] = useState('');
 const [isDeleting, setIsDeleting] = useState(false);

 // Delete specific certificate states
 const [showCertDeleteModal, setShowCertDeleteModal] = useState(false);
 const [selectedCert, setSelectedCert] = useState(null);
 const [certDeletePassword, setCertDeletePassword] = useState('');
 const [certDeleteError, setCertDeleteError] = useState('');
 const [certDeleteSuccess, setCertDeleteSuccess] = useState('');
 const [isCertDeleting, setIsCertDeleting] = useState(false);

 // Certificate Registry visibility and bulk purge states
 const [showCertCard, setShowCertCard] = useState(true);
 const [showTeamsSection, setShowTeamsSection] = useState(true);
 const [showPurgeAllCertsModal, setShowPurgeAllCertsModal] = useState(false);
 const [purgeCertsPassword, setPurgeCertsPassword] = useState('');
 const [purgeCertsError, setPurgeCertsError] = useState('');
 const [purgeCertsSuccess, setPurgeCertsSuccess] = useState('');
 const [isPurgingCerts, setIsPurgingCerts] = useState(false);
 const [certSortOrder, setCertSortOrder] = useState('none'); // 'none', 'asc', 'desc'

 const toggleCertSort = () => {
 setCertSortOrder((prev) => {
 if (prev === 'none') return 'asc';
 if (prev === 'asc') return 'desc';
 return 'none';
 });
 };

 // Problem Statements CSV upload states
 const [problemsCsvUploaded, setProblemsCsvUploaded] = useState(false);
 const [uploadingProblemsCSV, setUploadingProblemsCSV] = useState(false);
 const [problemsCsvUploadMessage, setProblemsCsvUploadMessage] = useState('');
 const [problemsCsvUploadError, setProblemsCsvUploadError] = useState('');

 // Fetch settings dynamically from backend settings API and poll
 const fetchSettings = async () => {
 try {
 const settingsRes = await fetch(`${API_BASE_URL}/settings`);
 if (settingsRes.ok) {
 const settingsData = await settingsRes.json();
 setIsSelectionEnabled(!!settingsData.SelectionEnabled);
 setTimerLaunched(!!settingsData.TimerLaunched);
 setTimerExpiryTime(settingsData.TimerStartTime ? parseInt(settingsData.TimerStartTime, 10) : null);
 setIsDeleteProtectionActive(!!settingsData.DeleteProtectionActive);
 setProblemsCsvUploaded(!!settingsData.ProblemsCsvUploaded);
 setIsFeedbackEnabled(!!settingsData.FeedbackEnabled);
 setCurrentPhaseIdx(settingsData.CurrentPhaseIndex !== undefined ? parseInt(settingsData.CurrentPhaseIndex, 10) : 0);
 if (settingsData.Announcements) {
 setAnnouncements(settingsData.Announcements);
 localStorage.setItem('hackathon_announcements', JSON.stringify(settingsData.Announcements));
 }
 // Compute clock offset so timer uses server time, not browser time
 if (settingsData.ServerTime) {
 setClockOffset(parseFloat(settingsData.ServerTime) * 1000 - Date.now());
 }
 }
 } catch (err) {
 console.error('Error fetching settings:', err);
 }
 };

 const handleUpdatePhase = async (newIdx) => {
 try {
 const response = await fetch(`${API_BASE_URL}/settings/update-phase`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ phase_index: newIdx })
 });
 if (response.ok) {
 setCurrentPhaseIdx(newIdx);
 } else {
 const errData = await response.json().catch(() => ({}));
 alert(errData.detail || 'Failed to update roadmap phase.');
 }
 } catch (err) {
 console.error('Error updating roadmap phase:', err);
 }
 };

 useEffect(() => {
 fetchSettings();
 const interval = setInterval(fetchSettings, 1500);
 return () => clearInterval(interval);
 }, []);

 // Fetch registered teams dynamically from AWS DynamoDB API and poll
 const fetchTeams = async () => {
 try {
 const response = await fetch(`${API_BASE_URL}/teams/all`);
 if (response.ok) {
 const data = await response.json();
 const items = data.items || [];
 setCsvTeamCount(items.length);
 setTeamsList(items);
 }
 } catch (err) {
 console.error('Error fetching registered teams list from API:', err);
 }
 };

 useEffect(() => {
 fetchTeams();
 const interval = setInterval(fetchTeams, 5000);
 return () => clearInterval(interval);
 }, []);

 // Tick countdown timer locally based on active start time
 useEffect(() => {
 const tick = () => {
 if (timerLaunched && timerExpiryTime) {
 const currentServerMs = Date.now() + clockOffset;
 const targetMs = timerExpiryTime * 1000;
 const diffMs = targetMs - currentServerMs;
 const remaining = Math.max(0, Math.ceil(diffMs / 1000));
 setTimeLeft(remaining);
 } else {
 setTimeLeft(null);
 }
 };

 tick();
 const interval = setInterval(tick, 200);
 return () => clearInterval(interval);
 }, [timerLaunched, timerExpiryTime, clockOffset]);

 const handleLaunchTimer = async () => {
 if (!isSelectionEnabled) {
 alert('Action Denied: The Selection Gate must be enabled before launching the timer. Enable it first.');
 return;
 }
 try {
 const response = await fetch(`${API_BASE_URL}/settings/launch-timer`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ duration: parseInt(timerDuration, 10) })
 });
 if (response.ok) {
 const data = await response.json();
 // Update clock offset from launch response for accuracy
 if (data.ServerTime) {
 setClockOffset(parseFloat(data.ServerTime) * 1000 - Date.now());
 }
 setTimerLaunched(true);
 setTimerExpiryTime(parseInt(data.TimerStartTime, 10));
 } else {
 const errData = await response.json().catch(() => ({}));
 alert(errData.detail || 'Failed to launch timer.');
 }
 } catch (err) {
 console.error('Error launching timer:', err);
 }
 };

 const handleResetTimer = async () => {
 try {
 const response = await fetch(`${API_BASE_URL}/settings/reset-timer`, {
 method: 'POST'
 });
 if (response.ok) {
 setTimerLaunched(false);
 setTimerExpiryTime(null);
 setTimeLeft(null);
 } else {
 alert("Failed to reset timer.");
 }
 } catch (err) {
 console.error("Error resetting timer:", err);
 }
 };

 const handlePublishAnnouncement = async (e) => {
 e.preventDefault();
 if (!announcementText.trim()) return;

 const textToPublish = announcementText.trim();
 setAnnouncementText('');

 const newAnn = {
 id: Date.now(),
 timestamp: new Date().toLocaleTimeString(),
 text: textToPublish
 };

 const updated = [newAnn, ...announcements];
 setAnnouncements(updated);
 localStorage.setItem('hackathon_announcements', JSON.stringify(updated));
 window.dispatchEvent(new Event('announcements_updated'));

 try {
 const res = await fetch(`${API_BASE_URL}/announcements`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ text: textToPublish })
 });
 if (res.ok) {
 const data = await res.json();
 if (data.announcements) {
 setAnnouncements(data.announcements);
 localStorage.setItem('hackathon_announcements', JSON.stringify(data.announcements));
 window.dispatchEvent(new Event('announcements_updated'));
 }
 }
 } catch (err) {
 console.error('Error publishing announcement to API:', err);
 }
 };

 const handleDeleteAnnouncement = async (id) => {
 const updated = announcements.filter(a => a.id !== id);
 setAnnouncements(updated);
 localStorage.setItem('hackathon_announcements', JSON.stringify(updated));
 window.dispatchEvent(new Event('announcements_updated'));

 try {
 const res = await fetch(`${API_BASE_URL}/announcements/${id}`, {
 method: 'DELETE'
 });
 if (res.ok) {
 const data = await res.json();
 if (data.announcements) {
 setAnnouncements(data.announcements);
 localStorage.setItem('hackathon_announcements', JSON.stringify(data.announcements));
 window.dispatchEvent(new Event('announcements_updated'));
 }
 }
 } catch (err) {
 console.error('Error deleting announcement from API:', err);
 }
 };

 const handleRevokeAll = async () => {
 if (isDeleteProtectionActive) {
 alert("Action Denied: Delete Protection is currently active. Disable the Data Lock to modify database selections.");
 return;
 }

 if (!window.confirm("Are you sure you want to revoke all team problem selections? This will force all teams back to the selection screen.")) {
 return;
 }

 try {
 const response = await fetch(`${API_BASE_URL}/problems/revoke-all`, {
 method: 'POST'
 });
 if (response.ok) {
 alert("All problem statement selections have been revoked successfully.");
 fetchTeams();
 } else {
 const data = await response.json();
 alert(data.detail || "Failed to revoke selections.");
 }
 } catch (err) {
 console.error("Error revoking selections:", err);
 alert("Network error revoking selections.");
 }
 };

 const handleToggleSelection = async () => {
 const nextState = !isSelectionEnabled;

 // Gate: can only enable if problems CSV has been uploaded
 if (nextState && !problemsCsvUploaded) {
 alert('Action Denied: You must upload the Problem Statements CSV to S3 before enabling the Selection Gate.');
 return;
 }

 try {
 const response = await fetch(`${API_BASE_URL}/settings/toggle-selection`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ enabled: nextState })
 });
 if (response.ok) {
 setIsSelectionEnabled(nextState);
 } else {
 const errData = await response.json().catch(() => ({}));
 alert(errData.detail || 'Failed to toggle selection access gate.');
 }
 } catch (err) {
 console.error('Error toggling selection gate:', err);
 alert('Network error toggling selection gate.');
 }
 };

 const handleToggleDeleteProtection = async () => {
 const nextState = !isDeleteProtectionActive;
 try {
 const response = await fetch(`${API_BASE_URL}/settings/toggle-delete-protection`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ enabled: nextState })
 });
 if (response.ok) {
 setIsDeleteProtectionActive(nextState);
 } else {
 alert("Failed to toggle delete protection.");
 }
 } catch (err) {
 console.error("Error toggling delete protection:", err);
 alert("Network error toggling delete protection.");
 }
 };

  const handleToggleFeedback = async () => {
    const nextState = !isFeedbackEnabled;
    try {
      const response = await fetch(`${API_BASE_URL}/settings/toggle-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextState })
      });
      if (response.ok) {
        setIsFeedbackEnabled(nextState);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.detail || 'Failed to toggle feedback gate.');
      }
    } catch (err) {
      console.error('Error toggling feedback gate:', err);
      alert('Network error toggling feedback gate.');
    }
  };


  // Upload problems CSV directly to backend / S3
  const handleUploadProblemsCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setProblemsCsvUploadError('Invalid file type. Only .csv files are accepted.');
      return;
    }

    setUploadingProblemsCSV(true);
    setProblemsCsvUploadMessage('');
    setProblemsCsvUploadError('');

    try {
      // Read file content as text
      const csvText = await file.text();
      if (!csvText.trim()) {
        throw new Error('The selected CSV file is empty.');
      }

      // Method 1: Try direct server-side upload to avoid browser S3 CORS issues
      let uploadSuccess = false;
      try {
        const directRes = await fetch(`${API_BASE_URL}/api/problems/upload-direct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv_content: csvText })
        });

        if (directRes.ok) {
          uploadSuccess = true;
        }
      } catch (directErr) {
        console.warn('Direct upload endpoint not reachable, trying presigned URL...', directErr);
      }

      // Method 2: Fallback to presigned S3 PUT URL if direct endpoint was not available
      if (!uploadSuccess) {
        const urlRes = await fetch(`${API_BASE_URL}/api/problems/upload-csv`, {
          method: 'POST'
        });

        if (!urlRes.ok) {
          const errData = await urlRes.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to generate upload URL.');
        }

        const { presigned_url } = await urlRes.json();

        const s3Res = await fetch(presigned_url, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/csv' },
          body: file
        });

        if (!s3Res.ok) {
          throw new Error('S3 upload failed. Please verify bucket CORS or try again.');
        }
      }

      setProblemsCsvUploadMessage(`Problem Statements CSV uploaded successfully. (${file.name})`);
      setProblemsCsvUploaded(true);
      await fetchSettings();
    } catch (err) {
      console.error('Problems CSV upload error:', err);
      // If upload fails, revert the status
      try {
        await fetch(`${API_BASE_URL}/api/problems/reset-csv`, { method: 'POST' });
      } catch (_) { }
      setProblemsCsvUploadError(err.message || 'Failed to upload problems CSV.');
    } finally {
      setUploadingProblemsCSV(false);
      e.target.value = '';
    }
  };

 const handleResetProblems = async () => {
 if (!window.confirm('This will reset the problem statements upload status and disable the Selection Gate. Are you sure?')) return;
 try {
 const res = await fetch(`${API_BASE_URL}/api/problems/reset-csv`, { method: 'POST' });
 if (res.ok) {
 setProblemsCsvUploaded(false);
 setIsSelectionEnabled(false);
 setProblemsCsvUploadMessage('');
 setProblemsCsvUploadError('');
 await fetchSettings();
 }
 } catch (err) {
 console.error('Error resetting problems CSV status:', err);
 }
 };

  const handleDownloadSelectionsCSV = () => {
    if (!teamsList || teamsList.length === 0) {
      alert('No team selection data available to download.');
      return;
    }

    const sortedTeams = [...teamsList].sort((a, b) => (a.TeamID || '').localeCompare(b.TeamID || '', undefined, { numeric: true }));

    const headers = ['Team ID', 'Team Name', 'Leader Name', 'Leader Email', 'Leader Phone', 'Leader RegNo', 'Selected Challenge', 'Status'];

    const rows = sortedTeams.map(t => {
      const problem = t.SelectedProblem || t.selectedProblem || '';
      const status = problem ? 'LOCKED' : 'PENDING';
      const teamId = t.TeamID || '';
      const teamName = t['Team Name'] || t.teamName || t.team_name || '';
      const leaderName = t['Leader Name'] || t.leaderName || '';
      const leaderEmail = t['Leader Email'] || t.leaderEmail || '';
      const leaderPhone = t['Leader Phone'] || t.leaderPhone || '';
      const leaderRegNo = t['Leader RegNo'] || t.leaderRegNo || '';
      const selectedChallenge = problem || 'Awaiting selection...';

      return [
        `"${teamId.replace(/"/g, '""')}"`,
        `"${teamName.replace(/"/g, '""')}"`,
        `"${leaderName.replace(/"/g, '""')}"`,
        `"${leaderEmail.replace(/"/g, '""')}"`,
        `"${leaderPhone.replace(/"/g, '""')}"`,
        `"${leaderRegNo.replace(/"/g, '""')}"`,
        `"${selectedChallenge.replace(/"/g, '""')}"`,
        `"${status}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `disfrutar26_team_selections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Helper to extract CSV fields with BOM handling and case-insensitive key lookup
  const getCSVField = (obj, ...candidateNames) => {
    if (!obj || typeof obj !== 'object') return '';

    for (const candidate of candidateNames) {
      if (obj[candidate] !== undefined && obj[candidate] !== null && String(obj[candidate]).trim() !== '') {
        return String(obj[candidate]).trim();
      }
    }

    for (const candidate of candidateNames) {
      const candidateNorm = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const rawKey in obj) {
        const cleanKey = rawKey.replace(/^\ufeff/, '').trim();
        const keyNorm = cleanKey.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (keyNorm === candidateNorm) {
          const val = obj[rawKey];
          if (val !== undefined && val !== null && String(val).trim() !== '') {
            return String(val).trim();
          }
        }
      }
    }

    return '';
  };

  // Robust CSV parser with BOM stripping
  const parseCSV = (text) => {
    if (!text) return [];
    const cleanText = text.replace(/^\ufeff/, '');
    const lines = cleanText.split(/\r?\n/);
    if (lines.length === 0) return [];

    const rawHeaders = splitCSVLine(lines[0]);
    const headers = rawHeaders.map(h => h.replace(/^\ufeff/, '').replace(/^"|"$/g, '').trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = splitCSVLine(line);
      const obj = {};
      headers.forEach((header, idx) => {
        if (header) {
          obj[header] = fields[idx] !== undefined ? fields[idx] : "";
        }
      });
      result.push(obj);
    }
    return result;
  };

  const splitCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
  };

  const extractTeamsFromParsed = (parsed) => {
    const teamsMap = new Map();

    parsed.forEach(t => {
      // Strictly extract TeamID from explicit TeamID column candidates. NEVER fall back to Team Name.
      const teamId = getCSVField(t, 'TeamID', 'Team ID', 'TeamId', 'team_id', 'teamid', 'Id', 'ID');
      if (!teamId || teamId.toUpperCase() === 'SYSTEM_SETTINGS') return;

      const teamName = getCSVField(t, 'Team Name', 'TeamName', 'team_name', 'teamname') || teamId;
      const password = getCSVField(t, 'Password', 'password', 'Pass', 'pass') || teamId;
      const leaderName = getCSVField(t, 'Leader Name', 'LeaderName', 'leader_name', 'leadername', 'Member Name (Leader Highlighted)', 'Member Name', 'Name', 'name');
      const leaderEmail = getCSVField(t, 'Leader Email', 'LeaderEmail', 'leader_email', 'leaderemail', 'Email', 'email');
      const leaderPhone = getCSVField(t, 'Leader Phone', 'LeaderPhone', 'leader_phone', 'leaderphone', 'Phone', 'phone');
      const leaderRegNo = getCSVField(t, 'Leader RegNo', 'LeaderRegNo', 'leader_reg_no', 'leaderregno', 'Registration No', 'RegNo', 'Reg No', 'regno', 'reg_no');
      const transactionId = getCSVField(t, 'Transaction ID', 'TransactionID', 'transaction_id', 'transactionid', 'TransactionStatus', 'transaction_status');
      const status = getCSVField(t, 'Status', 'status', 'TransactionStatus') || 'SUCCESS';
      const submittedAt = getCSVField(t, 'Submitted At', 'SubmittedAt', 'submitted_at', 'submittedat', 'SubmittedTimestamp', 'submitted_timestamp');

      if (!teamsMap.has(teamId)) {
        teamsMap.set(teamId, {
          TeamID: teamId,
          TeamName: teamName,
          Password: password,
          LeaderName: leaderName,
          LeaderEmail: leaderEmail,
          LeaderPhone: leaderPhone,
          LeaderRegNo: leaderRegNo,
          TransactionID: transactionId,
          Status: status,
          SubmittedAt: submittedAt
        });
      } else {
        const existing = teamsMap.get(teamId);
        if (!existing.TeamName && teamName) existing.TeamName = teamName;
        if (!existing.Password && password) existing.Password = password;
        if (!existing.LeaderName && leaderName) existing.LeaderName = leaderName;
        if (!existing.LeaderEmail && leaderEmail) existing.LeaderEmail = leaderEmail;
        if (!existing.LeaderPhone && leaderPhone) existing.LeaderPhone = leaderPhone;
        if (!existing.LeaderRegNo && leaderRegNo) existing.LeaderRegNo = leaderRegNo;
      }
    });

    return Array.from(teamsMap.values());
  };

  const extractParticipantsFromParsed = (parsed, existingTeams = []) => {
    const teamNameToIdMap = new Map();
    existingTeams.forEach(t => {
      if (t.TeamName && t.TeamID) {
        teamNameToIdMap.set(t.TeamName.toLowerCase().trim(), t.TeamID);
      }
    });

    return parsed.map(p => {
      let teamId = getCSVField(p, 'TeamID', 'Team ID', 'TeamId', 'team_id', 'teamid');
      const teamName = getCSVField(p, 'Team Name', 'TeamName', 'team_name', 'teamname');

      if (!teamId && teamName && teamNameToIdMap.has(teamName.toLowerCase().trim())) {
        teamId = teamNameToIdMap.get(teamName.toLowerCase().trim());
      }
      if (!teamId) {
        teamId = teamName;
      }

      const rawYear = getCSVField(p, 'Year', 'year', 'Department Year');
      let parsedYear = 0;
      if (rawYear) {
        const match = rawYear.match(/\d+/);
        if (match) parsedYear = parseInt(match[0], 10);
      }

      return {
        TeamId: teamId,
        Name: getCSVField(p, 'Name', 'name', 'Member Name (Leader Highlighted)', 'Member Name', 'Participant Name'),
        RegNo: getCSVField(p, 'RegNo', 'Reg No', 'Registration No', 'regno', 'reg_no'),
        Email: getCSVField(p, 'Email', 'email'),
        Phone: getCSVField(p, 'Phone', 'phone', 'Mobile', 'Mobile No'),
        Gender: getCSVField(p, 'Gender', 'gender'),
        Branch: getCSVField(p, 'Branch', 'branch', 'Department', 'Dept'),
        Year: isNaN(parsedYear) ? 0 : parsedYear,
        Accommodation: getCSVField(p, 'Accommodation', 'accommodation', 'Residence Type'),
        HostelName: getCSVField(p, 'Hostel Name', 'HostelName', 'hostel_name', 'hostelname'),
        RoomNo: getCSVField(p, 'Room No', 'Room Number', 'roomno', 'room_no'),
        WardenName: getCSVField(p, 'Warden Name', 'WardenName', 'warden_name', 'wardenname'),
        WardenPhone: getCSVField(p, 'Warden Phone', 'WardenPhone', 'warden_phone', 'wardenphone')
      };
    }).filter(p => p.TeamId);
  };

  const handleTeamsFileChange = (e) => {
    setCsvError('');
    setImportMessage('');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);

        const teamsMapped = extractTeamsFromParsed(parsed);
        const participantsMapped = extractParticipantsFromParsed(parsed, teamsMapped);

        setParsedTeams(teamsMapped);
        if (participantsMapped.length > 0) {
          setParsedParticipants(participantsMapped);
        }
      } catch (err) {
        console.error(err);
        setCsvError('Failed to parse Teams CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleParticipantsFileChange = (e) => {
    setCsvError('');
    setImportMessage('');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);

        const participantsMapped = extractParticipantsFromParsed(parsed, parsedTeams);
        const teamsMapped = extractTeamsFromParsed(parsed);

        setParsedParticipants(participantsMapped);
        if (teamsMapped.length > 0) {
          setParsedTeams(teamsMapped);
        }
      } catch (err) {
        console.error(err);
        setCsvError('Failed to parse Participants CSV file.');
      }
    };
    reader.readAsText(file);
  };

 const handleImportData = async () => {
 if (parsedTeams.length === 0) {
 setCsvError('Please select and parse a Teams CSV file first.');
 return;
 }

 setUploadingCsv(true);
 setImportMessage('');
 setCsvError('');

 try {
 const response = await fetch(`${API_BASE_URL}/admin/import-data`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 teams: parsedTeams,
 participants: parsedParticipants
 })
 });

 const result = await response.json();
 if (response.ok) {
 setImportMessage(result.message || 'Seeding successful.');
 setParsedTeams([]);
 setParsedParticipants([]);
 fetchTeams();
 } else {
 setCsvError(result.detail || 'Failed to import data.');
 }
 } catch (err) {
 console.error(err);
 setCsvError('Network error uploading CSV data payload.');
 } finally {
 setUploadingCsv(false);
 }
 };

 const handleDeleteAllTeams = async () => {
 if (!deletePassword) {
 setDeleteError('Authorization key is required.');
 return;
 }

 setIsDeleting(true);
 setDeleteError('');
 setDeleteMessage('');

 try {
 const response = await fetch(`${API_BASE_URL}/admin/delete-all-teams`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ password: deletePassword })
 });

 const result = await response.json();
 if (response.ok) {
 setDeleteMessage(result.message || 'All records purged successfully.');
 setDeletePassword('');
 fetchTeams();
 setTimeout(() => {
 setShowDeleteModal(false);
 setDeleteMessage('');
 }, 2500);
 } else {
 setDeleteError(result.detail || 'Failed to delete data.');
 }
 } catch (err) {
 console.error(err);
 setDeleteError('Network error purging data.');
 } finally {
 setIsDeleting(false);
 }
 };

 const handleViewCertificate = async (s3Key) => {
 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/certificates/presign-get?s3_key=${encodeURIComponent(s3Key)}`);
 if (res.ok) {
 const data = await res.json();
 window.open(data.url, '_blank');
 } else {
 alert("Failed to generate presigned download URL.");
 }
 } catch (err) {
 console.error("Error viewing certificate:", err);
 alert("Network error occurred.");
 }
 };

 const handleDeleteCertificate = async () => {
 if (!certDeletePassword) {
 setCertDeleteError("Password is required.");
 return;
 }
 setIsCertDeleting(true);
 setCertDeleteError("");
 setCertDeleteSuccess("");

 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/certificates/delete`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({
 team_id: selectedCert.teamId,
 member_name: selectedCert.memberName,
 s3_key: selectedCert.s3Key,
 password: certDeletePassword
 })
 });

 const data = await res.json();
 if (res.ok) {
 setCertDeleteSuccess(data.message || "Certificate successfully deleted.");
 setCertDeletePassword("");
 fetchTeams(); // Reload teams list
 setTimeout(() => {
 setShowCertDeleteModal(false);
 setSelectedCert(null);
 setCertDeleteSuccess("");
 }, 2000);
 } else {
 setCertDeleteError(data.detail || "Failed to delete certificate.");
 }
 } catch (err) {
 console.error("Error deleting certificate:", err);
 setCertDeleteError("Network error occurred.");
 } finally {
 setIsCertDeleting(false);
 }
 };

 const handlePurgeAllCertificates = async () => {
 if (!purgeCertsPassword) {
 setPurgeCertsError("Authorization key is required.");
 return;
 }
 setIsPurgingCerts(true);
 setPurgeCertsError("");
 setPurgeCertsSuccess("");

 try {
 const res = await fetch(`${API_BASE_URL}/api/admin/certificates/delete-all`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json'
 },
 body: JSON.stringify({ password: purgeCertsPassword })
 });

 const data = await res.json();
 if (res.ok) {
 setPurgeCertsSuccess(data.message || "All certificates purged successfully.");
 setPurgeCertsPassword("");
 fetchTeams(); // Reload teams list
 setTimeout(() => {
 setShowPurgeAllCertsModal(false);
 setPurgeCertsSuccess("");
 }, 2500);
 } else {
 setPurgeCertsError(data.detail || "Failed to purge certificates.");
 }
 } catch (err) {
 console.error("Error purging certificates:", err);
 setPurgeCertsError("Network error occurred.");
 } finally {
 setIsPurgingCerts(false);
 }
 };

  // ── GitHub Repo Links Download Helpers ──────────────────────────────────
  const getRepoLinks = () => teamsList
    .filter(t => t['DeployedLink'] && t['TeamID'] !== 'SYSTEM_SETTINGS')
    .sort((a, b) => (a['Team Name'] || a.TeamName || '').localeCompare(b['Team Name'] || b.TeamName || ''));

  const downloadRepoLinksCSV = () => {
    const rows = getRepoLinks();
    const header = 'S.NO,TEAM NAME,REPO URL';
    const body = rows.map((t, i) => {
      const teamName = (t['Team Name'] || t.TeamName || t.TeamID || '').replace(/,/g, ' ');
      const url = (t['DeployedLink'] || '').replace(/,/g, ' ');
      return `${i + 1},"${teamName}","${url}"`;
    }).join('\n');
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `dsfrutar26_github_repos_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const downloadRepoLinksXLS = () => {
    const rows = getRepoLinks();
    let table = '<table><tr><th>S.NO</th><th>TEAM NAME</th><th>REPO URL</th></tr>';
    rows.forEach((t, i) => {
      const teamName = t['Team Name'] || t.TeamName || t.TeamID || '';
      const url = t['DeployedLink'] || '';
      table += `<tr><td>${i + 1}</td><td>${teamName}</td><td>${url}</td></tr>`;
    });
    table += '</table>';
    const xlsContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:excel'><head><meta charset='utf-8'></head><body>${table}</body></html>`;
    const blob = new Blob([xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `dsfrutar26_github_repos_${new Date().toISOString().slice(0,10)}.xls`;
    a.click(); URL.revokeObjectURL(url);
  };

 return (
 <div className="min-h-screen bg-[#06070a] text-slate-100 font-mono-custom flex flex-col">

 {/* Admin Top Header */}
 <header className="border-b border-rose-500/20 bg-[#0c0d12] px-6 py-4 flex items-center justify-between shadow-lg shadow-rose-950/10">
 <div className="flex items-center gap-3">
 <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">
 <Shield className="w-5 h-5 text-rose-500" />
 </div>
 <div className="text-left">
 <h1 className="text-lg font-bold tracking-wider text-rose-400 font-sans uppercase">
 Admin Dashboard
 </h1>
 <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans">
 Hackathon Control Panel
 </p>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <AcmLogo className="h-8 w-8" />
 <button
 onClick={onLock}
 className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/25 px-4 py-2 rounded-xl transition-all hover:bg-rose-500/25 cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>Lock Console</span>
 </button>
 </div>
 </header>

 <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">

 {/* Statistics Grid */}
 <section className="grid grid-cols-1 md:grid-cols-5 gap-6">
 <div className="bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-4">
 <div className="p-3 bg-cyan-500/10 rounded-sm text-cyan-400 border border-cyan-500/50">
 <Users className="w-6 h-6" />
 </div>
 <div className="text-left">
 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">Teams Registered</p>
 <h3 className="text-2xl font-bold font-mono text-white mt-1">{csvTeamCount} Teams</h3>
 </div>
 </div>

 <div className="bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center gap-4">
 <div className={`p-3 rounded-sm border ${isDeleteProtectionActive ? 'bg-rose-500/10 text-rose-400 border-rose-500/50 animate-pulse' : 'bg-blue-500/10 text-[#00FFFF] border-blue-500/50'}`}>
 <Shield className="w-6 h-6" />
 </div>
 <div className="text-left">
 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">Delete Protection</p>
 <h3 className={`text-2xl font-bold font-mono mt-1 ${isDeleteProtectionActive ? 'text-rose-400' : 'text-[#00FFFF]'}`}>
 {isDeleteProtectionActive ? 'LOCKED' : 'MUTABLE'}
 </h3>
 </div>
 </div>





 <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-md flex items-center gap-4">
 <div className={`p-3 rounded-xl border ${isFeedbackEnabled ? 'bg-blue-500/10 text-[#00FFFF] border-blue-500/25 animate-pulse' : 'bg-zinc-800/40 text-slate-500 border-zinc-700/25'}`}>
 <Activity className="w-6 h-6" />
 </div>
 <div className="text-left">
 <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-sans">Feedback Gate</p>
 <h3 className={`text-2xl font-bold font-mono mt-1 ${isFeedbackEnabled ? 'text-[#00FFFF]' : 'text-slate-500'}`}>
 {isFeedbackEnabled ? 'OPEN' : 'CLOSED'}
 </h3>
 </div>
 </div>

 </section>

 {/* Dynamic Controls Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

 {/* ⏱️ TIMER LAUNCH SYSTEM PANEL */}
 <section className="lg:col-span-3 bg-zinc-950 border-2 border-rose-500/50 rounded-sm p-6 shadow-xl relative overflow-hidden text-left">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <Clock className="w-48 h-48 text-rose-500" />
 </div>

 <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5 relative z-10">
 <h2 className="text-md font-bold text-rose-400 uppercase tracking-wider">Telemetry Timer Launch Control</h2>
 <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">UTC SYNCED</span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

 {/* Configuration Inputs */}
 <div>
 <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
 Use this console to launch the official contest synchronized countdown timer. Launching will immediately shift all active team interfaces from the guest information dashboard to the active clock countdown.
 </p>

 {!timerLaunched ? (
 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
 Set Countdown Duration
 </label>
 <select
 value={timerDuration}
 onChange={(e) => setTimerDuration(parseInt(e.target.value, 10))}
 className="w-full py-2.5 px-3 bg-[#0d0e12] border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500/50 text-sm font-mono-custom cursor-pointer"
 >
 <option value={15}>15 Seconds (Default)</option>
 <option value={60}>1 Minute</option>
 <option value={180}>3 Minutes</option>
 <option value={300}>5 Minutes</option>
 <option value={600}>10 Minutes</option>
 </select>
 </div>

 {/* Gate warning if selection not enabled yet */}
 {!isSelectionEnabled && (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#00FFFF] text-[10px] font-sans">
 <Lock className="w-3.5 h-3.5 shrink-0" />
 <span>Selection Gate must be <strong>enabled</strong> before the timer can launch.</span>
 </div>
 )}

 <button
 onClick={handleLaunchTimer}
 disabled={!isSelectionEnabled}
 className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-wider ${isSelectionEnabled
 ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white hover:shadow-rose-500/25 hover:scale-[1.01] cursor-pointer'
 : 'bg-zinc-900 text-slate-600 border border-white/5 cursor-not-allowed shadow-none'
 }`}
 >
 <Play className="w-4 h-4 fill-current" />
 <span>Launch Hackathon Timer</span>
 </button>
 </div>
 ) : (
 <div className="space-y-4">
 <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2.5 font-sans leading-relaxed">
 <span>WARNING: The timer signal is currently broadcasting live. All logged-in user ports are locked into countdown sequence.</span>
 </div>

 <button
 onClick={handleResetTimer}
 className="w-full bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/30 text-rose-400 font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-xs uppercase tracking-wider hover:scale-[1.01]"
 >
 <Square className="w-4 h-4 fill-rose-400" />
 <span>Terminate & Reset Timer</span>
 </button>
 </div>
 )}
 </div>

 {/* Real-time Status Readout */}
 <div className="flex flex-col justify-center items-center p-6 bg-[#0a0b0e] border border-white/5 rounded-2xl">
 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans mb-2">Live Broadcast Status</span>

 {timerLaunched ? (
 <div className="text-center space-y-2">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase animate-pulse">
 Broadcasting Signal
 </span>
 <h3 className="text-3xl font-bold font-mono text-rose-400 tracking-wider">
 {timeLeft !== null && timeLeft > 0 ? (
 `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`
 ) : (
 '00:00 (EXPIRED)'
 )}
 </h3>
 <p className="text-[9px] text-slate-500">Remaining before dashboard decryption</p>
 </div>
 ) : (
 <div className="text-center space-y-2">
 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-white/5 uppercase">
 Signal Dormant
 </span>
 <h3 className="text-2xl font-bold text-slate-500 tracking-widest">AWAITING</h3>
 <p className="text-[9px] text-slate-600">Waiting for trigger credentials</p>
 </div>
 )}
 </div>

 </div>
 </section>

 {/* Server & System status panel */}
 <section className="lg:col-span-1 bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-6 shadow-xl text-left flex flex-col justify-between">
 <div>
 <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
 System Services
 </h3>

 <div className="space-y-4 font-mono text-xs">





 {/* Problems CSV Status */}
 <div className={`flex items-center justify-between p-3 rounded-xl border ${problemsCsvUploaded ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
 <div className="flex items-center gap-2">
 <FileText className={`w-4 h-4 ${problemsCsvUploaded ? 'text-cyan-400' : 'text-[#00FFFF]'}`} />
 <span className="text-xs">Problems CSV</span>
 </div>
 <span className={`text-[10px] font-bold ${problemsCsvUploaded ? 'text-cyan-400' : 'text-[#00FFFF] animate-pulse'}`}>
 {problemsCsvUploaded ? 'UPLOADED' : 'MISSING'}
 </span>
 </div>

 {/* Selection Gate */}
 <div className="flex flex-col gap-2 p-3 bg-[#0d0e12] rounded-xl border border-white/5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Cpu className="w-4 h-4 text-cyan-400" />
 <span>Selection Gate</span>
 </div>
 <span className={`text-[10px] font-bold ${isSelectionEnabled ? 'text-cyan-400' : 'text-rose-400 animate-pulse'}`}>
 {isSelectionEnabled ? 'ENABLED' : 'LOCKED'}
 </span>
 </div>
 {!problemsCsvUploaded && !isSelectionEnabled && (
 <p className="text-[9px] text-[#00FFFF]/70 font-sans italic">Upload Problems CSV first to unlock</p>
 )}
 <button
 onClick={handleToggleSelection}
 disabled={!problemsCsvUploaded && !isSelectionEnabled}
 className={`mt-1.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase ${!problemsCsvUploaded && !isSelectionEnabled
 ? 'bg-zinc-900 text-slate-600 border border-white/5 cursor-not-allowed'
 : isSelectionEnabled
 ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer'
 : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 cursor-pointer'
 }`}
 >
 {isSelectionEnabled ? 'Lock Selection' : 'Enable Selection'}
 </button>
 </div>

 {/* Delete Protection Lock */}
 <div className="flex flex-col gap-2 p-3 bg-[#0d0e12] rounded-xl border border-white/5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Lock className="w-4 h-4 text-cyan-400" />
 <span>Delete Lock</span>
 </div>
 <span className={`text-[10px] font-bold ${isDeleteProtectionActive ? 'text-rose-400 animate-pulse font-extrabold' : 'text-slate-500'}`}>
 {isDeleteProtectionActive ? 'LOCKED' : 'MUTABLE'}
 </span>
 </div>
 <button
 onClick={handleToggleDeleteProtection}
 className={`mt-1.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase cursor-pointer ${isDeleteProtectionActive
 ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/20'
 : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
 }`}
 >
 {isDeleteProtectionActive ? 'Unlock Deletes' : 'Lock Team Data'}
 </button>
 </div>

 {/* Teams Selection Visibility Toggle */}
 <div className="flex flex-col gap-2 p-3 bg-[#0d0e12] rounded-xl border border-white/5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-cyan-400" />
 <span>Team Selections</span>
 </div>
 <span className={`text-[10px] font-bold ${showTeamsSection ? 'text-cyan-400' : 'text-slate-500'}`}>
 {showTeamsSection ? 'VISIBLE' : 'HIDDEN'}
 </span>
 </div>
 <button
 onClick={() => setShowTeamsSection(!showTeamsSection)}
 className={`mt-1.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase cursor-pointer ${showTeamsSection
 ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
 : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
 }`}
 >
 {showTeamsSection ? 'Hide Teams' : 'Show Teams'}
 </button>
 </div>

 {/* Certificate Registry Visibility Toggle */}
 <div className="flex flex-col gap-2 p-3 bg-[#0d0e12] rounded-xl border border-white/5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <HardDrive className="w-4 h-4 text-cyan-400" />
 <span>Cert Registry</span>
 </div>
 <span className={`text-[10px] font-bold ${showCertCard ? 'text-cyan-400' : 'text-slate-500'}`}>
 {showCertCard ? 'VISIBLE' : 'HIDDEN'}
 </span>
 </div>
 <button
 onClick={() => setShowCertCard(!showCertCard)}
 className={`mt-1.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase cursor-pointer ${showCertCard
 ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
 : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
 }`}
 >
 {showCertCard ? 'Hide Registry' : 'Show Registry'}
 </button>
 </div>

 {/* Feedback Gate Toggle */}
 <div className="flex flex-col gap-2 p-3 bg-[#0d0e12] rounded-xl border border-white/5">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Activity className="w-4 h-4 text-[#00FFFF]" />
 <span>Feedback Gate</span>
 </div>
 <span className={`text-[10px] font-bold ${isFeedbackEnabled ? 'text-[#00FFFF] animate-pulse font-extrabold' : 'text-slate-500'
 }`}>
 {isFeedbackEnabled ? 'OPEN' : 'CLOSED'}
 </span>
 </div>
 <button
 id="admin-feedback-gate-toggle"
 onClick={handleToggleFeedback}
 className={`mt-1.5 w-full py-1.5 rounded-xl text-[10px] font-bold transition-all uppercase cursor-pointer ${isFeedbackEnabled
 ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
 : 'bg-blue-500/10 hover:bg-blue-500/20 text-[#00FFFF] border border-blue-500/20'
 }`}
 >
 {isFeedbackEnabled ? 'Close Feedback' : 'Open Feedback'}
 </button>
 </div>

 </div>
 </div>

 <button
 onClick={() => window.location.reload()}
 className="mt-4 w-full flex items-center justify-center gap-2 text-xs border border-white/10 hover:border-white/20 bg-white/5 py-2.5 rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 <span>Force Re-Sync</span>
 </button>
 </section>

 </div>

 {/* 🗺️ ROADMAP TIMELINE CONTROLLER */}
 <section className="bg-zinc-950 border-2 border-blue-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <Cpu className="w-36 h-36 text-[#00FFFF]" />
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-white/5 relative z-10 gap-3">
 <div>
 <h2 className="text-md font-bold text-[#00FFFF] uppercase tracking-wider flex items-center gap-2">
 <span>Roadmap Timeline Controller</span>
 </h2>
 <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">
 Live · synchronize event progress to all participant terminals
 </p>
 </div>

 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${currentPhaseIdx < 8
 ? 'bg-blue-500/10 border-blue-500/20 text-[#00FFFF]'
 : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 font-extrabold animate-pulse'
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${currentPhaseIdx < 8 ? 'bg-blue-400' : 'bg-cyan-400'}`}></span>
 {currentPhaseIdx < 8 ? `ACTIVE PHASE: ${ROADMAP_PHASES[currentPhaseIdx].name.toUpperCase()}` : 'ALL PHASES COMPLETED'}
 </span>

 {currentPhaseIdx > 0 && (
 <button
 onClick={() => handleUpdatePhase(0)}
 className="text-[10px] text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-mono"
 title="Reset roadmap to phase 1"
 >
 Reset Timeline
 </button>
 )}
 </div>
 </div>

 <div className="relative z-10 flex flex-col gap-6">
 {/* Horizontal timeline of steps */}
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
 {ROADMAP_PHASES.map((phase, idx) => {
 const isCompleted = idx < currentPhaseIdx;
 const isCurrent = idx === currentPhaseIdx;

 let cardClass = "bg-[#0d0e12] border-white/5 text-slate-500 hover:border-white/10";
 let statusText = "UPCOMING";
 let badgeClass = "bg-zinc-800 text-slate-500 border-zinc-700/50";

 if (isCompleted) {
 cardClass = "bg-cyan-500/5 border-cyan-500/20 text-cyan-400 hover:border-cyan-500/40";
 statusText = "COMPLETED";
 badgeClass = "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
 } else if (isCurrent) {
 cardClass = "bg-blue-500/10 border-blue-500/40 text-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.15)] ring-1 ring-blue-500/30 hover:border-blue-500/60";
 statusText = "CURRENT";
 badgeClass = "bg-blue-500 text-black border-blue-400 font-extrabold";
 }

 return (
 <button
 key={phase.id}
 onClick={() => handleUpdatePhase(idx)}
 className={`flex flex-col justify-between p-3.5 rounded-xl border text-left transition-all duration-300 cursor-pointer min-h-[100px] ${cardClass}`}
 >
 <div>
 <div className="flex items-center justify-between gap-1 mb-1">
 <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">
 {phase.phase}
 </span>
 <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${badgeClass}`}>
 {statusText}
 </span>
 </div>
 <h4 className="text-xs font-bold text-white uppercase tracking-wide truncate">
 {phase.name}
 </h4>
 </div>
 <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-2 block">
 Click to activate
 </span>
 </button>
 );
 })}
 </div>
 </div>
 </section>
 {/* Announcements Management Section */}
 <section className="bg-zinc-950 border-2 border-rose-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
 <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
 <h2 className="text-md font-bold text-rose-400 uppercase tracking-wider">Mainframe Announcement Broadcasts Control</h2>
 <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-1 rounded">BROADCAST ACTIVE</span>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Announcement Form */}
 <div className="lg:col-span-1 space-y-4">
 <p className="text-xs text-slate-400 leading-relaxed font-sans">
 Compose and publish real-time notifications to the team workspaces. Once broadcasted, all active client consoles will update automatically.
 </p>

 <form onSubmit={handlePublishAnnouncement} className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2" htmlFor="announcement-msg">
 Announcement Message
 </label>
 <textarea
 id="announcement-msg"
 rows={3}
 value={announcementText}
 onChange={(e) => setAnnouncementText(e.target.value)}
 placeholder="ENTER ANNOUNCEMENT TEXT TO BROADCAST..."
 className="w-full py-2.5 px-3 bg-[#0d0e12] border border-white/10 rounded-xl text-white focus:outline-none focus:border-rose-500/50 text-xs font-mono-custom resize-none"
 />
 </div>

 <button
 type="submit"
 className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-sans text-xs uppercase tracking-wider"
 >
 <Play className="w-3.5 h-3.5 fill-white" />
 <span>Broadcast Notice</span>
 </button>
 </form>
 </div>

 {/* Broadcast Feed */}
 <div className="lg:col-span-2 space-y-4">
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5">
 Active Telemetry Signals
 </label>

 <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-none pr-1">
 {announcements.length === 0 ? (
 <div className="text-center py-8 text-slate-500 font-mono-custom text-xs italic">
 No active announcements broadcasted. Compose a notice on the left to start telemetry stream.
 </div>
 ) : (
 announcements.map((item) => (
 <div key={item.id} className="p-3 bg-[#0d0e12] border border-white/5 rounded-xl flex items-start justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 text-[9px] font-mono-custom text-rose-400 mb-1">
 <span className="font-bold">BROADCAST SIGNAL ID: {item.id}</span>
 <span className="text-slate-500">•</span>
 <span>{item.timestamp}</span>
 </div>
 <p className="text-xs text-slate-300 font-sans leading-relaxed font-medium">{item.text}</p>
 </div>

 <button
 type="button"
 onClick={() => handleDeleteAnnouncement(item.id)}
 className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all cursor-pointer text-center"
 title="Delete Announcement"
 >
 <svg className="w-4 h-4 inline-block align-middle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
 </svg>
 </button>
 </div>
 ))
 )}
 </div>
 </div>

 </div>
 </section>


 {/* ⭐ FEEDBACK ANALYTICS SECTION */}
 {(() => {
 // Derive feedback data from live teamsList — no extra API call needed
 const allFeedbacks = [];
 teamsList.forEach(team => {
 (team.Members || []).forEach(member => {
 if (member.FeedbackSubmitted && member.FeedbackData) {
 allFeedbacks.push({
 teamId: team.TeamID,
 teamName: team['Team Name'] || team.TeamName || team.TeamID,
 memberName: member.name,
 regNo: member.regNo,
 ...member.FeedbackData
 });
 }
 });
 });

 const totalResponses = allFeedbacks.length;
 const avgRating = totalResponses > 0
 ? (allFeedbacks.reduce((sum, f) => sum + (f.Rating || 0), 0) / totalResponses)
 : 0;

 // Count per star (1-5)
 const ratingCounts = [1, 2, 3, 4, 5].map(star => ({
 star,
 count: allFeedbacks.filter(f => f.Rating === star).length,
 pct: totalResponses > 0
 ? Math.round((allFeedbacks.filter(f => f.Rating === star).length / totalResponses) * 100)
 : 0
 }));

 const starColor = (star) => {
 if (star <= 2) return { bar: 'bg-rose-500', text: 'text-rose-400', glow: 'shadow-[0_0_6px_rgba(239,68,68,0.4)]' };
 if (star === 3) return { bar: 'bg-blue-500', text: 'text-[#00FFFF]', glow: 'shadow-[0_0_6px_rgba(245,158,11,0.4)]' };
 return { bar: 'bg-cyan-500', text: 'text-cyan-400', glow: 'shadow-[0_0_6px_rgba(16,185,129,0.4)]' };
 };

 const avgColor = avgRating >= 4 ? 'text-cyan-400' : avgRating >= 3 ? 'text-[#00FFFF]' : 'text-rose-400';
 const avgGlow = avgRating >= 4 ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : avgRating >= 3 ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]';

 return (
 <section className="bg-white/5 border border-blue-500/20 rounded-2xl p-6 shadow-xl text-left relative overflow-hidden">
 {/* Ambient glow */}
 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
 <Star className="w-36 h-36 text-[#00FFFF]" />
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-white/5 relative z-10 gap-3">
 <div>
 <h2 className="text-md font-bold text-[#00FFFF] uppercase tracking-wider flex items-center gap-2">
 <Star className="w-5 h-5 text-[#00FFFF] fill-blue-400" />
 <span>Feedback Analytics — Rating Distribution</span>
 </h2>
 <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">
 Live · computed from {totalResponses} participant response{totalResponses !== 1 ? 's' : ''}
 </p>
 </div>
 <button
 id="admin-view-all-feedbacks-btn"
 onClick={() => setShowFeedbackViewer(true)}
 className="flex items-center gap-2 text-[11px] font-bold text-[#00FFFF] hover:text-black bg-blue-500/10 hover:bg-blue-400 border border-blue-500/30 hover:border-blue-400 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
 >
 <MessageSquare className="w-3.5 h-3.5" />
 View All Feedbacks
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

 {/* Average Score Display */}
 <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-blue-500/15 rounded-2xl gap-3">
 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">Overall Average</span>
 <div className={`text-6xl font-black font-mono ${avgColor} ${avgGlow} transition-all duration-500`}>
 {totalResponses > 0 ? avgRating.toFixed(1) : '—'}
 </div>
 {/* Visual star row */}
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map(s => (
 <Star
 key={s}
 className={`w-5 h-5 transition-all duration-300 ${s <= Math.round(avgRating)
 ? 'text-[#00FFFF] fill-blue-400 drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]'
 : 'text-zinc-700 fill-zinc-800'
 }`}
 />
 ))}
 </div>
 <span className="text-[10px] text-slate-500 font-mono">
 {totalResponses} / {teamsList.reduce((s, t) => s + (t.Members || []).length, 0)} responded
 </span>
 </div>

 {/* Rating Bar Chart */}
 <div className="lg:col-span-2 flex flex-col justify-center gap-3">
 {[5, 4, 3, 2, 1].map(star => {
 const d = ratingCounts.find(r => r.star === star);
 const col = starColor(star);
 return (
 <div key={star} className="flex items-center gap-3 group">
 {/* Star label */}
 <div className="flex items-center gap-1 w-10 shrink-0">
 <Star className={`w-3.5 h-3.5 fill-current ${col.text}`} />
 <span className={`text-[11px] font-bold font-mono ${col.text}`}>{star}</span>
 </div>
 {/* Bar track */}
 <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden border border-white/5 relative">
 <div
 className={`h-full ${col.bar} ${col.glow} rounded-lg transition-all duration-700 ease-out flex items-center justify-end pr-2`}
 style={{ width: `${d?.pct || 0}%`, minWidth: d?.count > 0 ? '2rem' : '0' }}
 >
 {(d?.count || 0) > 0 && (
 <span className="text-[9px] font-extrabold text-black/80">{d.count}</span>
 )}
 </div>
 </div>
 {/* Percentage */}
 <span className={`text-[10px] font-bold font-mono w-9 text-right shrink-0 ${col.text}`}>
 {d?.pct || 0}%
 </span>
 </div>
 );
 })}
 </div>

 </div>
 </section>
 );
 })()}

 {/* 🗂️ PROBLEM STATEMENTS CSV UPLOAD ZONE */}
 <section className="bg-zinc-950 border-2 border-blue-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <FileText className="w-36 h-36 text-[#00FFFF]" />
 </div>

 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-white/5 relative z-10 gap-3">
 <div>
 <h2 className="text-md font-bold text-[#00FFFF] uppercase tracking-wider flex items-center gap-2">
 <FileText className="w-5 h-5 text-[#00FFFF]" />
 <span>Problem Statements CSV — S3 Upload</span>
 </h2>
 <p className="text-[10px] text-slate-500 uppercase mt-0.5">
 Step 1 of 3: Upload CSV → Enable Selection → Launch Timer
 </p>
 </div>
 <div className="flex items-center gap-2">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${problemsCsvUploaded
 ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
 : 'bg-blue-500/10 border-blue-500/20 text-[#00FFFF] animate-pulse'
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${problemsCsvUploaded ? 'bg-cyan-400' : 'bg-blue-400'}`}></span>
 {problemsCsvUploaded ? 'CSV UPLOADED TO S3' : 'AWAITING UPLOAD'}
 </span>
 {problemsCsvUploaded && (
 <button
 onClick={handleResetProblems}
 className="text-[10px] text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-mono"
 title="Reset and re-upload problems CSV"
 >
 Reset & Re-upload
 </button>
 )}
 </div>
 </div>

 {problemsCsvUploadError && (
 <div className="mb-5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 font-sans">
 <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
 <span>{problemsCsvUploadError}</span>
 </div>
 )}

 {problemsCsvUploadMessage && (
 <div className="mb-5 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center gap-2.5 font-sans">
 <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
 <span>{problemsCsvUploadMessage}</span>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
 <div>
 <p className="text-slate-400 leading-relaxed text-[13px] font-sans font-medium mb-4">
 Upload the problem statements CSV to S3 (<code className="text-[#00FFFF] text-[11px] font-mono">problemstatements/problems.csv</code>).
 This unlocks the Selection Gate toggle. The CSV must have 4 columns: <code className="text-[#00FFFF]/90 font-mono text-[11px]">title, description, requirements, expectations</code>.
 </p>

 <div className="p-4 bg-black/40 border border-blue-500/15 rounded-xl hover:border-blue-500/35 transition">
 <div className="flex items-center justify-between mb-3">
 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Problem Statements CSV</span>
 {uploadingProblemsCSV && (
 <span className="text-[10px] text-[#00FFFF] font-mono animate-pulse">Uploading to S3...</span>
 )}
 </div>
 <label className={`block cursor-pointer text-center py-3 px-4 rounded-xl border font-bold uppercase text-[10px] tracking-wider transition-all ${uploadingProblemsCSV
 ? 'bg-zinc-900 border-white/5 text-slate-600 cursor-not-allowed'
 : problemsCsvUploaded
 ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20'
 : 'bg-blue-500/10 border-blue-500/25 text-[#00FFFF] hover:bg-blue-500/20'
 }`}>
 <span className="flex items-center justify-center gap-2">
 <UploadCloud className="w-4 h-4" />
 {uploadingProblemsCSV ? 'Uploading...' : problemsCsvUploaded ? 'Re-upload Problems CSV' : 'Select & Upload Problems CSV'}
 </span>
 <input
 type="file"
 accept=".csv"
 className="hidden"
 disabled={uploadingProblemsCSV}
 onChange={handleUploadProblemsCSV}
 />
 </label>
 </div>
 </div>

 {/* Workflow Steps Visual */}
 <div className="p-5 bg-black/30 border border-white/5 rounded-xl">
 <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Admin Workflow Sequence</h3>
 <div className="space-y-3">
 {[
 { step: '01', label: 'Upload Problems CSV to S3', done: problemsCsvUploaded },
 { step: '02', label: 'Enable the Selection Gate', done: isSelectionEnabled },
 { step: '03', label: 'Launch Countdown Timer', done: timerLaunched },
 ].map(({ step, label, done }) => (
 <div key={step} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done
 ? 'bg-cyan-500/5 border-cyan-500/20'
 : 'bg-zinc-950/60 border-zinc-800'
 }`}>
 <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold font-mono border ${done
 ? 'bg-cyan-500 border-cyan-400 text-black'
 : 'bg-zinc-900 border-zinc-700 text-slate-500'
 }`}>
 {done ? '✓' : step}
 </span>
 <span className={`text-xs font-mono ${done ? 'text-cyan-400' : 'text-slate-500'
 }`}>{label}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>

 {/* 📥 CSV DATA INGESTION & SEEDING ZONE */}
 <section className="bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <FileText className="w-36 h-36 text-cyan-400" />
 </div>

 <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5 relative z-10">
 <div>
 <h2 className="text-md font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
 <UploadCloud className="w-5 h-5 text-cyan-400" />
 <span>CSV Ingest & Seeding Core</span>
 </h2>
 <p className="text-[10px] text-slate-500 uppercase mt-0.5">
 Load telemetry matrices directly to DynamoDB
 </p>
 </div>

 {isDeleteProtectionActive && (
 <span className="flex items-center gap-1 px-3 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[9px] uppercase tracking-wider font-extrabold animate-pulse">
 <Lock className="w-3 h-3" />
 <span>Database Write Locked</span>
 </span>
 )}
 </div>

 {csvError && (
 <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 font-sans leading-relaxed">
 <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
 <span>{csvError}</span>
 </div>
 )}

 {importMessage && (
 <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center gap-2.5 font-sans">
 <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
 <span>{importMessage}</span>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 font-sans text-xs">
 {/* Seeder selectors */}
 <div className="space-y-5">
 <p className="text-slate-400 leading-relaxed text-[13px] font-medium">
 Upload your Teams and Participants CSV files to parse them inside your session and update AWS DynamoDB registers.
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-custom">
 {/* Selector 1: Teams CSV */}
 <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl hover:border-cyan-500/30 transition flex flex-col justify-between min-h-[120px]">
 <div>
 <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
 1. Teams CSV Matrix
 </span>
 <span className="text-[11px] text-slate-300 block mb-3 font-sans font-medium">
 Select disfrutar_teams.csv
 </span>
 </div>
 <label className="cursor-pointer bg-white/5 border border-white/10 hover:border-cyan-500 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-400 py-2 px-3 rounded-lg text-center transition font-bold block text-[10px] uppercase">
 Select File
 <input
 type="file"
 accept=".csv"
 className="hidden"
 onChange={handleTeamsFileChange}
 disabled={uploadingCsv}
 />
 </label>
 </div>

 {/* Selector 2: Participants CSV */}
 <div className="p-4 bg-black/40 border border-zinc-800 rounded-xl hover:border-cyan-500/30 transition flex flex-col justify-between min-h-[120px]">
 <div>
 <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
 2. Roster CSV Matrix
 </span>
 <span className="text-[11px] text-slate-300 block mb-3 font-sans font-medium">
 Select dsfrutar26_participants.csv
 </span>
 </div>
 <label className="cursor-pointer bg-white/5 border border-white/10 hover:border-cyan-500 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-400 py-2 px-3 rounded-lg text-center transition font-bold block text-[10px] uppercase">
 Select File
 <input
 type="file"
 accept=".csv"
 className="hidden"
 onChange={handleParticipantsFileChange}
 disabled={uploadingCsv}
 />
 </label>
 </div>
 </div>

 <button
 onClick={handleImportData}
 disabled={isDeleteProtectionActive || uploadingCsv || parsedTeams.length === 0}
 className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-wider cursor-pointer ${isDeleteProtectionActive || parsedTeams.length === 0
 ? 'bg-zinc-900 text-slate-500 border border-white/5 cursor-not-allowed shadow-none'
 : 'bg-cyan-500 text-black hover:bg-cyan-400 hover:scale-[1.01]'
 }`}
 >
 {uploadingCsv ? 'Transmitting Ingestion Packets...' : 'Parse & Seed to DynamoDB'}
 </button>
 </div>

 {/* Readout logs console */}
 <div className="bg-[#07080b] border border-white/5 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
 <div>
 <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 font-mono border-b border-white/5 pb-1.5">
 Ingestion Stream Logs Console
 </span>

 <div className="space-y-2 font-mono text-[10px] text-slate-400">
 <div className="flex gap-2">
 <span className="text-cyan-400">&gt;</span>
 <span>Ready for CSV data ingestion stream.</span>
 </div>

 {parsedTeams.length > 0 && (
 <div className="flex gap-2 text-cyan-400">
 <span>&gt;</span>
 <span>Parsed {parsedTeams.length} team records successfully. Ready to seed.</span>
 </div>
 )}

 {parsedParticipants.length > 0 && (
 <div className="flex gap-2 text-cyan-400">
 <span>&gt;</span>
 <span>Parsed {parsedParticipants.length} roster participant records successfully.</span>
 </div>
 )}

 {uploadingCsv && (
 <div className="flex gap-2 text-[#00FFFF] animate-pulse">
 <span>&gt;</span>
 <span>Synchronizing payload packets with AWS DynamoDB...</span>
 </div>
 )}
 </div>
 </div>

 <div className="border-t border-white/5 pt-3 font-mono text-[9px] text-slate-600 flex justify-between uppercase">
 <span>Ingest Path: /admin/import-data</span>
 <span>Buffer: Ready</span>
 </div>
 </div>
 </div>
 </section>

 {/* 📋 TEAMS & PROBLEM SELECTIONS OVERVIEW */}
 {showTeamsSection && (
 <section className="bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
 <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
 <h2 className="text-md font-bold text-slate-200 uppercase tracking-wider">Active Problem Selections</h2>
 <div className="flex items-center gap-3">
 <button
 onClick={handleDownloadSelectionsCSV}
 className="text-[10px] border px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider font-semibold font-mono-custom text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1.5"
 title="Download team problem selections as CSV"
 >
 <Download className="w-3.5 h-3.5" />
 <span>Download CSV</span>
 </button>
 <button
 onClick={() => setShowTeamsSection(false)}
 className="text-[10px] border px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider font-semibold font-mono-custom text-slate-400 hover:text-slate-200 bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
 >
 Hide Table
 </button>
 <button
 onClick={handleRevokeAll}
 disabled={isDeleteProtectionActive}
 className={`text-[10px] border px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider font-semibold font-mono-custom ${isDeleteProtectionActive
 ? 'bg-zinc-900 text-slate-500 border-white/5 cursor-not-allowed shadow-none'
 : 'text-rose-400 hover:text-rose-300 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 cursor-pointer'
 }`}
 >
 Revoke All Selections
 </button>
 <span className="text-[10px] font-mono text-[#00FFFF] bg-[#00FFFF]/10 px-2 py-1 rounded border border-[#00FFFF]/25 uppercase animate-pulse">Live Sync</span>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left font-sans text-xs border-collapse">
 <thead>
 <tr className="border-b border-white/10 text-slate-400 font-mono-custom uppercase tracking-wider text-[10px]">
 <th className="py-3 px-4">Team ID</th>
 <th className="py-3 px-4">Team Name</th>
 <th className="py-3 px-4">Leader Details</th>
 <th className="py-3 px-4">Selected Challenge</th>
 <th className="py-3 px-4">Status</th>
 </tr>
 </thead>
 <tbody>
 {teamsList.length === 0 ? (
 <tr>
 <td colSpan={5} className="py-8 text-center text-slate-500 font-mono-custom">
 &gt;&gt; Scanning communications array... No teams detected.
 </td>
 </tr>
 ) : (
 [...teamsList].sort((a, b) => (a.TeamID || '').localeCompare(b.TeamID || '')).map((team) => {
 const problem = team.SelectedProblem || team.selectedProblem;
 return (
 <tr key={team.TeamID} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
 <td className="py-3.5 px-4 font-mono-custom text-white font-bold">{team.TeamID}</td>
 <td className="py-3.5 px-4 font-semibold text-slate-200">{team['Team Name'] || team.teamName || team.team_name}</td>
 <td className="py-3.5 px-4 text-left">
 <div className="font-semibold text-slate-300">{team['Leader Name'] || team.leaderName}</div>
 <div className="text-[10px] text-slate-500 font-mono">{team['Leader Email'] || team.leaderEmail}</div>
 </td>
 <td className="py-3.5 px-4">
 {problem ? (
 <span className="text-[#00FFFF] font-mono-custom font-bold uppercase">{problem}</span>
 ) : (
 <span className="text-slate-500 font-mono-custom italic">Awaiting selection...</span>
 )}
 </td>
 <td className="py-3.5 px-4 text-left">
 {problem ? (
 <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#00FFFF]/10 text-[#00FFFF] border border-[#00FFFF]/20 uppercase">Locked</span>
 ) : (
 <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-[#00FFFF] border border-blue-500/20 uppercase">Pending</span>
 )}
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
  </section>
  )}

 {/* 🗄️ MANAGE & PURGE UPLOADED CERTIFICATES */}
 {showCertCard && (() => {
 const certRows = [];
 teamsList.forEach((team) => {
 if (team.Certificates && typeof team.Certificates === 'object') {
 Object.entries(team.Certificates).forEach(([memberName, certList]) => {
 if (Array.isArray(certList)) {
 certList.forEach((s3Key, idx) => {
 certRows.push({
 teamId: team.TeamID || '',
 memberName: memberName,
 s3Key: s3Key,
 idx: idx,
 team: team
 });
 });
 }
 });
 }
 });

 if (certSortOrder !== 'none') {
 certRows.sort((a, b) => {
 if (certSortOrder === 'asc') {
 return a.teamId.localeCompare(b.teamId);
 } else {
 return b.teamId.localeCompare(a.teamId);
 }
 });
 }

 return (
 <section className="bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
 <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/5">
 <div>
 <h2 className="text-md font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
 <HardDrive className="w-5 h-5 text-cyan-400" />
 <span>Uploaded Certificates Registry</span>
 </h2>
 <p className="text-[10px] text-slate-500 uppercase mt-0.5">
 Review and delete telemetry certificates
 </p>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={toggleCertSort}
 className="text-[10px] border px-3 py-1.5 rounded-xl transition-all uppercase tracking-wider font-semibold font-mono-custom text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/20 cursor-pointer"
 >
 Sort by Team ID: {certSortOrder === 'asc' ? 'Ascending' : certSortOrder === 'desc' ? 'Descending' : 'Default'}
 </button>
 <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/25 uppercase">SECURE FS</span>
 </div>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left font-sans text-xs border-collapse">
 <thead>
 <tr className="border-b border-white/10 text-slate-400 font-mono-custom uppercase tracking-wider text-[10px]">
 <th className="py-3 px-4">
 <button
 onClick={toggleCertSort}
 className="flex items-center gap-1 font-bold uppercase tracking-wider text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
 >
 Team ID {certSortOrder === 'asc' ? '▲' : certSortOrder === 'desc' ? '▼' : '↕'}
 </button>
 </th>
 <th className="py-3 px-4">Participant Name</th>
 <th className="py-3 px-4">Uploaded File</th>
 <th className="py-3 px-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {certRows.length === 0 ? (
 <tr>
 <td colSpan={4} className="py-8 text-center text-slate-500 font-mono-custom">
 &gt;&gt; No uploaded team certificates detected.
 </td>
 </tr>
 ) : (
 certRows.map(({ teamId, memberName, s3Key, idx }) => {
 const filename = s3Key.substring(s3Key.lastIndexOf('/') + 1);
 return (
 <tr key={`${teamId}-${memberName}-${idx}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
 <td className="py-3.5 px-4 font-mono-custom text-white font-bold">{teamId}</td>
 <td className="py-3.5 px-4 font-semibold text-slate-300">{memberName}</td>
 <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">{filename}</td>
 <td className="py-3.5 px-4 text-right space-x-2">
 <button
 onClick={() => handleViewCertificate(s3Key)}
 className="px-3 py-1.5 rounded-lg border border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500 hover:text-black font-semibold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
 >
 View File
 </button>
 <button
 onClick={() => {
 setSelectedCert({
 teamId: teamId,
 memberName: memberName,
 s3Key: s3Key
 });
 setCertDeletePassword('');
 setCertDeleteError('');
 setCertDeleteSuccess('');
 setShowCertDeleteModal(true);
 }}
 className="px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500 hover:text-white font-semibold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
 >
 Delete
 </button>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>
 </section>
 );
 })()}

  {/* ─────────────────────────────────────────── */}
  {/* 🔗 GITHUB REPO LINKS SECTION */}
  {/* ─────────────────────────────────────────── */}
  <section className="bg-zinc-950 border-2 border-cyan-500/50 rounded-sm p-6 shadow-xl text-left relative overflow-hidden">
    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
      <GitBranch className="w-40 h-40 text-cyan-400" />
    </div>

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-white/5 relative z-10 gap-4">
      <div>
        <h2 className="text-md font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          GitHub Repo Links
        </h2>
        <p className="text-[10px] text-slate-500 uppercase mt-0.5 tracking-wider">
          {getRepoLinks().length} submission{getRepoLinks().length !== 1 ? 's' : ''} · updates every 5s
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={downloadRepoLinksCSV}
          disabled={getRepoLinks().length === 0}
          className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-black bg-cyan-500/10 hover:bg-cyan-400 border border-cyan-500/30 hover:border-cyan-400 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          Download CSV
        </button>
        <button
          onClick={downloadRepoLinksXLS}
          disabled={getRepoLinks().length === 0}
          className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 hover:text-black bg-cyan-500/10 hover:bg-cyan-400 border border-cyan-500/30 hover:border-cyan-400 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          Download XLS
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="relative z-10 overflow-x-auto">
      {getRepoLinks().length === 0 ? (
        <div className="py-12 text-center text-slate-600 font-mono text-xs italic">
          No GitHub repository links submitted yet.
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 pr-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12">S.NO</th>
              <th className="pb-3 pr-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Team Name</th>
              <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Repo URL</th>
            </tr>
          </thead>
          <tbody>
            {getRepoLinks().map((team, idx) => (
              <tr key={team.TeamID}
                className="border-b border-white/5 hover:bg-cyan-500/5 transition-colors group"
              >
                <td className="py-3.5 pr-4 text-xs font-mono text-slate-500 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                <td className="py-3.5 pr-4">
                  <span className="text-white font-bold font-mono text-xs uppercase tracking-wide">
                    {team['Team Name'] || team.TeamName || team.TeamID}
                  </span>
                </td>
                <td className="py-3.5">
                  <a
                    href={team.DeployedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 group-hover:underline break-all"
                  >
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    {team.DeployedLink}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </section>


 {/* 🔴 DANGER ZONE - DELETE ALL DATA */}
 <section className="bg-rose-950/20 border-2 border-rose-500/80 rounded-sm p-6 shadow-[0_4px_16px_rgba(225,29,72,0.4)] text-left relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <Trash2 className="w-36 h-36 text-rose-500" />
 </div>

 <div className="flex justify-between items-center mb-4 pb-3 border-b border-rose-500/15 relative z-10">
 <div>
 <h2 className="text-md font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
 <Trash2 className="w-5 h-5 text-rose-500" />
 <span>Danger Zone</span>
 </h2>
 <p className="text-[10px] text-rose-400/60 uppercase mt-0.5">
 Irreversible database operations
 </p>
 </div>
 </div>

 <div className="flex flex-col gap-6 relative z-10">
 {/* Action 1: Purge All Data */}
 <div className="flex items-center justify-between border-b border-rose-500/10 pb-4">
 <div className="text-left max-w-lg">
 <p className="text-xs text-slate-400 leading-relaxed font-sans">
 Permanently delete <strong className="text-rose-400">all team records</strong> from DynamoDB. This action is irreversible and requires a deletion authorization key. System settings will be preserved.
 </p>
 </div>
 <button
 onClick={() => {
 setShowDeleteModal(true);
 setDeletePassword('');
 setDeleteError('');
 setDeleteMessage('');
 }}
 disabled={isDeleteProtectionActive}
 className={`shrink-0 ml-6 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 uppercase text-xs tracking-wider ${isDeleteProtectionActive
 ? 'bg-zinc-900 text-slate-500 border border-white/5 cursor-not-allowed shadow-none'
 : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-500/10 hover:shadow-rose-500/25 hover:scale-[1.01]'
 }`}
 >
 <Trash2 className="w-4 h-4" />
 <span>Purge All Data</span>
 </button>
 </div>

 {/* Action 2: Purge All Certificates */}
 <div className="flex items-center justify-between">
 <div className="text-left max-w-lg">
 <p className="text-xs text-slate-400 leading-relaxed font-sans">
 Permanently delete <strong className="text-rose-400">all uploaded certificate files</strong> from AWS S3 and clear references from the database. This action is irreversible and requires a deletion authorization key.
 </p>
 </div>
 <button
 onClick={() => {
 setShowPurgeAllCertsModal(true);
 setPurgeCertsPassword('');
 setPurgeCertsError('');
 setPurgeCertsSuccess('');
 }}
 disabled={isDeleteProtectionActive}
 className={`shrink-0 ml-6 font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 uppercase text-xs tracking-wider ${isDeleteProtectionActive
 ? 'bg-zinc-900 text-slate-500 border border-white/5 cursor-not-allowed shadow-none'
 : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-lg shadow-rose-500/10 hover:shadow-rose-500/25 hover:scale-[1.01]'
 }`}
 >
 <Trash2 className="w-4 h-4" />
 <span>Purge All Certificates</span>
 </button>
 </div>
 </div>

 {isDeleteProtectionActive && (
 <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 font-sans leading-relaxed relative z-10">
 <Lock className="w-4 h-4 text-rose-400 shrink-0" />
 <span>Delete Protection is active. Unlock it from System Services before purging data.</span>
 </div>
 )}
 </section>

 {/* CERTIFICATE DELETION CONFIRMATION MODAL */}
 {showCertDeleteModal && selectedCert && (
 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
 <div className="w-full max-w-md bg-[#0a0c10] border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative">
 <button
 onClick={() => {
 setShowCertDeleteModal(false);
 setSelectedCert(null);
 }}
 className="absolute top-4 right-4 text-slate-500 hover:text-white transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center p-3.5 bg-rose-500/15 border border-rose-500/25 rounded-full mb-4">
 <Trash2 className="w-6 h-6 text-rose-500" />
 </div>
 <h3 className="text-lg font-bold text-rose-400 tracking-wider uppercase">
 Confirm Certificate Purge
 </h3>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
 This action is permanent and irreversible
 </p>
 </div>

 <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6 text-xs text-rose-300 font-sans leading-relaxed text-left">
 <strong>WARNING:</strong> This will permanently delete the certificate file (<strong>{selectedCert.s3Key.substring(selectedCert.s3Key.lastIndexOf('/') + 1)}</strong>) of member <strong>{selectedCert.memberName}</strong> (Team: <strong>{selectedCert.teamId}</strong>) from AWS S3 and remove the reference from the database.
 </div>

 {certDeleteError && (
 <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-sans">
 <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
 <span>{certDeleteError}</span>
 </div>
 )}

 {certDeleteSuccess && (
 <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center gap-2 font-sans">
 <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
 <span>{certDeleteSuccess}</span>
 </div>
 )}

 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
 Deletion Authorization Key
 </label>
 <input
 type="password"
 value={certDeletePassword}
 onChange={(e) => setCertDeletePassword(e.target.value)}
 placeholder="ENTER DELETION KEY..."
 className="w-full text-center py-3 bg-[#0d0f14] border border-rose-500/20 rounded-xl text-rose-400 placeholder-slate-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono text-sm tracking-widest uppercase"
 disabled={isCertDeleting}
 autoFocus
 onKeyDown={(e) => e.key === 'Enter' && handleDeleteCertificate()}
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => {
 setShowCertDeleteModal(false);
 setSelectedCert(null);
 }}
 className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handleDeleteCertificate}
 disabled={isCertDeleting || !certDeletePassword}
 className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {isCertDeleting ? (
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>
 <Trash2 className="w-3.5 h-3.5" />
 <span>Purge File</span>
 </>
 )}
 </button>
 </div>
 </div>

 <div className="mt-6 pt-3 border-t border-white/5 text-[9px] text-slate-600 text-center font-mono uppercase tracking-widest">
 DESTRUCTIVE OPERATION • REQUIRES AUTH KEY
 </div>
 </div>
 </div>
 )}

 {/* BULK CERTIFICATE PURGE CONFIRMATION MODAL */}
 {showPurgeAllCertsModal && (
 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
 <div className="w-full max-w-md bg-[#0a0c10] border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative">
 <button
 onClick={() => setShowPurgeAllCertsModal(false)}
 className="absolute top-4 right-4 text-slate-500 hover:text-white transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center p-3.5 bg-rose-500/15 border border-rose-500/25 rounded-full mb-4">
 <Trash2 className="w-6 h-6 text-rose-500" />
 </div>
 <h3 className="text-lg font-bold text-rose-400 tracking-wider uppercase">
 Confirm Bulk Certificates Purge
 </h3>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
 This action is permanent and irreversible
 </p>
 </div>

 <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6 text-xs text-rose-300 font-sans leading-relaxed text-left">
 <strong>WARNING:</strong> This will permanently delete <strong>ALL</strong> uploaded certificate files from AWS S3 and clear all certificate references from the database. System records and team rosters will be preserved.
 </div>

 {purgeCertsError && (
 <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-sans">
 <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
 <span>{purgeCertsError}</span>
 </div>
 )}

 {purgeCertsSuccess && (
 <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center gap-2 font-sans">
 <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
 <span>{purgeCertsSuccess}</span>
 </div>
 )}

 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
 Deletion Authorization Key
 </label>
 <input
 type="password"
 value={purgeCertsPassword}
 onChange={(e) => setPurgeCertsPassword(e.target.value)}
 placeholder="ENTER DELETION KEY..."
 className="w-full text-center py-3 bg-[#0d0f14] border border-rose-500/20 rounded-xl text-rose-400 placeholder-slate-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono text-sm tracking-widest uppercase"
 disabled={isPurgingCerts}
 autoFocus
 onKeyDown={(e) => e.key === 'Enter' && handlePurgeAllCertificates()}
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => setShowPurgeAllCertsModal(false)}
 className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handlePurgeAllCertificates}
 disabled={isPurgingCerts || !purgeCertsPassword}
 className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {isPurgingCerts ? (
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>
 <Trash2 className="w-3.5 h-3.5" />
 <span>Purge All</span>
 </>
 )}
 </button>
 </div>
 </div>

 <div className="mt-6 pt-3 border-t border-white/5 text-[9px] text-slate-600 text-center font-mono uppercase tracking-widest">
 DESTRUCTIVE OPERATION • REQUIRES AUTH KEY
 </div>
 </div>
 </div>
 )}

 {/* DELETE CONFIRMATION MODAL */}
 {showDeleteModal && (
 <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
 <div className="w-full max-w-md bg-[#0a0c10] border border-rose-500/30 rounded-2xl p-8 shadow-2xl relative">
 <button
 onClick={() => setShowDeleteModal(false)}
 className="absolute top-4 right-4 text-slate-500 hover:text-white transition cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>

 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center p-3.5 bg-rose-500/15 border border-rose-500/25 rounded-full mb-4">
 <Trash2 className="w-6 h-6 text-rose-500" />
 </div>
 <h3 className="text-lg font-bold text-rose-400 tracking-wider uppercase">
 Confirm Data Purge
 </h3>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
 This action is permanent and irreversible
 </p>
 </div>

 <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6 text-xs text-rose-300 font-sans leading-relaxed text-left">
 <strong>WARNING:</strong> This will permanently delete all team records, participant data, problem selections, deployed links, and evaluation records from DynamoDB. Only SYSTEM_SETTINGS will be preserved.
 </div>

 {deleteError && (
 <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-sans">
 <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
 <span>{deleteError}</span>
 </div>
 )}

 {deleteMessage && (
 <div className="mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xs flex items-center gap-2 font-sans">
 <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
 <span>{deleteMessage}</span>
 </div>
 )}

 <div className="space-y-4">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
 Deletion Authorization Key
 </label>
 <input
 type="password"
 value={deletePassword}
 onChange={(e) => setDeletePassword(e.target.value)}
 placeholder="ENTER DELETION KEY..."
 className="w-full text-center py-3 bg-[#0d0f14] border border-rose-500/20 rounded-xl text-rose-400 placeholder-slate-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono text-sm tracking-widest uppercase"
 disabled={isDeleting}
 autoFocus
 onKeyDown={(e) => e.key === 'Enter' && handleDeleteAllTeams()}
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <button
 onClick={() => setShowDeleteModal(false)}
 className="py-2.5 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
 >
 Cancel
 </button>
 <button
 onClick={handleDeleteAllTeams}
 disabled={isDeleting || !deletePassword}
 className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {isDeleting ? (
 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>
 <Trash2 className="w-3.5 h-3.5" />
 <span>Purge Records</span>
 </>
 )}
 </button>
 </div>
 </div>

 <div className="mt-6 pt-3 border-t border-white/5 text-[9px] text-slate-600 text-center font-mono uppercase tracking-widest">
 DESTRUCTIVE OPERATION • REQUIRES AUTH KEY
 </div>
 </div>
 </div>
 )}

 </main>

 {/* ─────────────────────────────────────────── */}
 {/* 📋 FEEDBACK VIEWER MODAL */}
 {/* ─────────────────────────────────────────── */}
 {showFeedbackViewer && (() => {
 // Re-derive feedback list inside modal scope
 const allFeedbacks = [];
 teamsList.forEach(team => {
 (team.Members || []).forEach(member => {
 if (member.FeedbackSubmitted && member.FeedbackData) {
 allFeedbacks.push({
 teamId: team.TeamID,
 teamName: team['Team Name'] || team.TeamName || team.TeamID,
 memberName: member.name,
 regNo: member.regNo,
 branch: member.branch,
 year: member.year,
 ...member.FeedbackData
 });
 }
 });
 });

 const totalResponses = allFeedbacks.length;
 const avgRating = totalResponses > 0
 ? (allFeedbacks.reduce((s, f) => s + (f.Rating || 0), 0) / totalResponses).toFixed(1)
 : '—';

 const starBadgeColor = (r) => {
 if (r >= 4) return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400';
 if (r === 3) return 'bg-blue-500/15 border-blue-500/30 text-[#00FFFF]';
 return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
 };

 return (
 <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 overflow-y-auto bg-black/90 ">
 <div className="relative w-full max-w-5xl my-6 bg-[#0a0b0e] border border-blue-500/25 rounded-2xl shadow-[0_0_60px_rgba(0,255,255,0.08)] overflow-hidden">

 {/* Modal Header */}
 <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0c0d10] border-b border-white/5">
 <div>
 <h2 className="text-sm font-bold text-[#00FFFF] uppercase tracking-wider flex items-center gap-2">
 <MessageSquare className="w-4 h-4" />
 All Participant Feedbacks
 </h2>
 <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-mono">
 {totalResponses} response{totalResponses !== 1 ? 's' : ''} · Avg rating: {avgRating} ★
 </p>
 </div>
 <button
 onClick={() => { setShowFeedbackViewer(false); setExpandedFeedback(null); }}
 className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="p-6">
 {totalResponses === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
 <MessageSquare className="w-10 h-10 text-slate-700" />
 <p className="text-sm text-slate-500 font-sans">No feedback submissions yet.</p>
 <p className="text-xs text-slate-600 font-sans">Enable the Feedback Gate and wait for participants to respond.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {allFeedbacks.map((fb, i) => {
 const isExpanded = expandedFeedback === `${fb.regNo}-${i}`;
 const key = `${fb.regNo}-${i}`;

 const textFields = [
 { label: 'How was the event?', value: fb.HowWasEvent },
 { label: 'Improvements needed?', value: fb.Improvements },
 { label: 'Discomfort?', value: fb.Discomfort },
 { label: 'Other', value: fb.Other }
 ].filter(f => f.value && f.value.trim());

 return (
 <div
 key={key}
 className="bg-white/[0.03] border border-white/8 rounded-xl overflow-hidden transition-all duration-300 hover:border-blue-500/20"
 >
 {/* Card Header — always visible */}
 <button
 className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer group"
 onClick={() => setExpandedFeedback(isExpanded ? null : key)}
 >
 <div className="flex items-center gap-4 flex-wrap">
 {/* Index Badge */}
 <span className="text-[9px] font-bold text-slate-600 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
 #{String(i + 1).padStart(3, '0')}
 </span>
 {/* Member Info */}
 <div className="text-left">
 <p className="text-sm font-bold text-white font-mono-custom group-hover:text-[#00FFFF] transition-colors">
 {fb.memberName}
 </p>
 <div className="flex items-center gap-2 mt-0.5 flex-wrap">
 <span className="text-[9px] text-cyber-cyan font-mono">{fb.regNo}</span>
 <span className="text-[9px] text-slate-600">·</span>
 <span className="text-[9px] text-slate-400 font-sans">{fb.teamName}</span>
 {fb.branch && (
 <>
 <span className="text-[9px] text-slate-600">·</span>
 <span className="text-[9px] text-slate-500">{fb.branch} Y{fb.year}</span>
 </>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 shrink-0">
 {/* Star Rating Badge */}
 <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-extrabold font-mono ${starBadgeColor(fb.Rating)}`}>
 <Star className="w-3 h-3 fill-current" />
 {fb.Rating}/5
 </div>
 {/* Expand/Collapse chevron */}
 {isExpanded
 ? <ChevronUp className="w-4 h-4 text-slate-500" />
 : <ChevronDown className="w-4 h-4 text-slate-500" />
 }
 </div>
 </button>

 {/* Expanded Content */}
 {isExpanded && (
 <div className="px-5 pb-5 border-t border-white/5">
 {/* Inline star row */}
 <div className="flex items-center gap-1 my-4">
 {[1, 2, 3, 4, 5].map(s => (
 <Star
 key={s}
 className={`w-5 h-5 ${s <= fb.Rating
 ? 'text-[#00FFFF] fill-blue-400 drop-shadow-[0_0_3px_rgba(0,255,255,0.4)]'
 : 'text-zinc-700 fill-zinc-800'
 }`}
 />
 ))}
 <span className="ml-2 text-xs text-slate-400 font-mono">
 {fb.Rating === 5 ? 'Excellent' : fb.Rating === 4 ? 'Great' : fb.Rating === 3 ? 'Good' : fb.Rating === 2 ? 'Fair' : 'Poor'}
 </span>
 </div>

 {textFields.length > 0 ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
 {textFields.map(({ label, value }) => (
 <div key={label} className="p-4 bg-black/30 border border-white/5 rounded-xl">
 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
 <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">{value}</p>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-600 italic font-sans">No text responses provided.</p>
 )}
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}
 </div>

 </div>
 </div>
 );
 })()}

 </div>
 );
}

