import React from 'react';
import DsfrutarLogo from './DsfrutarLogo';
import AcmLogo from './AcmLogo';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.08] bg-[#030712] pt-12 pb-8 px-6 sm:px-12 text-slate-400 font-sans relative z-50 overflow-hidden">
      {/* Top Ambient Glow Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 md:gap-4 mb-12 relative z-10">

        {/* Column 1: Logos and Tagline */}
        <div className="flex flex-col gap-4 md:w-1/3">
          <div className="flex items-center gap-3">
            <AcmLogo className="h-8 w-8" />
            <DsfrutarLogo inline className="text-xl" showSub={false} />
          </div>
          <p className="text-[13px] font-medium text-slate-400 tracking-wide font-sans">
            Ignite Innovation · Break Limits · Experience <span className="text-[#00FFFF] font-bold">DISFRUTAR-2K26</span>.
          </p>
        </div>

        {/* Column 2: Connect */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-bold text-[14px] uppercase tracking-widest font-orbitron">
            Connect With Us
          </h4>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/acmkare/"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 hover:text-[#00F0FF] transition-all group"
              title="Instagram"
            >
              <svg className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a
              href="https://www.linkedin.com/company/acmkare"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 hover:text-[#00F0FF] transition-all group"
              title="LinkedIn"
            >
              <svg className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a
              href="mailto:kareacm@klu.ac.in"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 hover:text-[#00F0FF] transition-all group"
              title="Email"
            >
              <svg className="w-[18px] h-[18px] opacity-70 group-hover:opacity-100 transition-opacity" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </a>
            <a
              href="https://kare.acm.org/"
              target="_blank"
              rel="noreferrer"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/50 text-[#00F0FF] transition-all group p-2 font-mono-custom text-xs font-bold"
              title="ACM Portal"
            >
              &lt;/&gt;
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] uppercase tracking-widest font-mono text-center md:text-left">
        <div className="px-2">&copy; {new Date().getFullYear()} ACM KARE STUDENT CHAPTER · DSFRUTAR-2K26. ALL RIGHTS RESERVED.</div>
        <div className="px-2 text-cyan-400 font-bold">DSFRUTAR-2K26 ACM EDITION</div>
      </div>
    </footer>
  );
}
