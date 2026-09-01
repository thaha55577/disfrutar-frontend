import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, ArrowRight, Server } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

export default function AdminGateway() {
 const [password, setPassword] = useState('');
 const [isAuthenticated, setIsAuthenticated] = useState(false);
 const [error, setError] = useState('');
 const [isLoading, setIsLoading] = useState(false);

 // Check if admin is already authenticated in this session
 useEffect(() => {
 const authStatus = sessionStorage.getItem('admin_authenticated');
 if (authStatus === 'true') {
 setIsAuthenticated(true);
 }
 }, []);

 const handleSubmit = (e) => {
 e.preventDefault();
 setError('');
 
 if (!password) {
 setError('Password is required.');
 return;
 }

 setIsLoading(true);

 // Simulate decrypt authentication delay
 setTimeout(() => {
 setIsLoading(false);
 if (password === 'admin123' || password === 'dsfrutar26' || password === 'ob26acm' || password === 'ob26gfg') {
 setIsAuthenticated(true);
 sessionStorage.setItem('admin_authenticated', 'true');
 } else {
 setError('Unauthorized: Incorrect administrative access token.');
 setPassword('');
 }
 }, 600);
 };

 const handleLock = () => {
 setIsAuthenticated(false);
 sessionStorage.removeItem('admin_authenticated');
 };

 // Render Admin Dashboard directly if authenticated
 if (isAuthenticated) {
 return <AdminDashboard onLock={handleLock} />;
 }

 return (
 <div className="min-h-screen flex items-center justify-center px-4 bg-[#050608] relative overflow-hidden font-mono">
 {/* Background terminal/matrix grid effect */}
 <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full -z-10 animate-pulse-slow"></div>

 {/* Admin Gateway Prompt Card */}
 <div className="w-full max-w-md bg-[#0a0c10]/95 border border-rose-500/20 rounded-2xl p-8 shadow-2xl relative z-10">
 
 {/* Warning Indicator */}
 <div className="text-center mb-6">
 <div className="inline-flex items-center justify-center p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-full mb-4 animate-pulse">
 <Lock className="w-6 h-6 text-rose-500" />
 </div>
 <h2 className="text-lg font-bold text-rose-400 tracking-wider">
 ADMIN SYSTEM ENTRY
 </h2>
 <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
 Restricted Console Access · ACM KARE
 </p>
 </div>


 {/* Error Notification */}
 {error && (
 <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 leading-relaxed text-left font-sans animate-shake">
 <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {/* Password Form */}
 <form onSubmit={handleSubmit} className="space-y-5">
 <div>
 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2" htmlFor="admin-pass">
 System Access Token
 </label>
 <input
 id="admin-pass"
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="ENTER ADMINISTRATIVE KEY"
 className="w-full text-center py-3 bg-[#0d0f14] border border-white/10 rounded-xl text-rose-400 placeholder-slate-700 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono text-sm tracking-widest uppercase"
 disabled={isLoading}
 autoFocus
 />
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
 >
 {isLoading ? (
 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <>
 <span>Request Authorization</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>

 {/* Footer info */}
 <div className="mt-8 pt-4 border-t border-white/5 text-[9px] text-slate-600 text-center font-mono uppercase tracking-widest">
 SECURE ENCRYPTED NODE ID: OX-982-A
 </div>
 </div>
 </div>
 );
}
