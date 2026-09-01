import React, { useState, useEffect } from react;
import { Lock, Shield, LogOut } from lucide-react;
import { logoutTeam } from ../../utils/auth;

export default function TimerExpiredLockScreen({ onLogout }) {
 const [pulse, setPulse] = useState(false);

 useEffect(() => {
 const id = setInterval(() => setPulse(p => !p), 1200);
 return () => clearInterval(id);
 }, []);

 const handleLogout = () => {
 logoutTeam();
 onLogout();
 };

 return null;
}
