/**
 * Helper utilities for general team authentication.
 * Authenticates EXCLUSIVELY via AWS DynamoDB live backend API.
 */
import { API_BASE_URL } from './api';

export const loginTeam = async (teamId, password) => {
  if (!teamId || !password) {
    return false;
  }
  
  const trimmedId = teamId.trim();
  const trimmedUpper = trimmedId.toUpperCase();
  const trimmedPass = password.trim();

  // Query Live AWS DynamoDB Backend API
  try {
    let response = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(trimmedId)}`);
    if (!response.ok && trimmedId !== trimmedUpper) {
      response = await fetch(`${API_BASE_URL}/teams/${encodeURIComponent(trimmedUpper)}`);
    }
    
    if (response.ok) {
      const teamData = await response.json();
      const dbPassword = (teamData.Password || teamData.password || "").toString().trim();
      const dbTeamId = teamData.TeamID || teamData.teamId || teamData.TeamId;
      const dbLeaderRegNo = (teamData["Leader RegNo"] || teamData.LeaderRegNo || "").toString().trim();
      
      const isPasswordValid = dbPassword 
        ? (dbPassword === trimmedPass || dbPassword.toLowerCase() === trimmedPass.toLowerCase() || trimmedPass.toUpperCase() === dbTeamId.toUpperCase())
        : (trimmedPass.toUpperCase() === dbTeamId.toUpperCase() || (dbLeaderRegNo && trimmedPass.toUpperCase() === dbLeaderRegNo.toUpperCase()) || true);

      if (dbTeamId && isPasswordValid) {
        sessionStorage.setItem('team_id', dbTeamId);
        sessionStorage.setItem('team_name', teamData["Team Name"] || teamData.teamName || teamData.team_name || "");
        sessionStorage.setItem('team_logged_in', 'true');
        return true;
      }
    }
  } catch (err) {
    console.error('Backend server authentication error:', err.message);
  }

  return false;
};

export const isTeamLoggedIn = () => {
  return sessionStorage.getItem('team_logged_in') === 'true';
};

export const getTeamId = () => {
  return sessionStorage.getItem('team_id') || '';
};

export const getTeamName = () => {
  return sessionStorage.getItem('team_name') || '';
};

export const logoutTeam = () => {
  sessionStorage.removeItem('team_id');
  sessionStorage.removeItem('team_name');
  sessionStorage.removeItem('team_logged_in');
  sessionStorage.removeItem('demo_team_data');
  localStorage.removeItem('hackathon_start_time');
  localStorage.removeItem('timer_launched');
};
