/**
 * Simulates fetching the hackathon start time (Unix timestamp) from the synchronized backend.
 * Checks localStorage for the timestamp set by the administrative console launch action.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const fetchStartTime = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (response.ok) {
      const data = await response.json();
      // Compute and store clock offset globally for use in countdowns
      if (data.ServerTime) {
        const serverMs = parseFloat(data.ServerTime) * 1000;
        window.__timerClockOffsetMs = serverMs - Date.now();
      }
      if (data.TimerLaunched) {
        return {
          timestamp: parseInt(data.TimerStartTime, 10),
          serverTime: parseInt(data.ServerTime, 10) || null
        };
      }
      return { timestamp: null, serverTime: null };
    }
  } catch (err) {
    console.error("Error fetching start time:", err);
  }
  return { timestamp: null, serverTime: null };
};

