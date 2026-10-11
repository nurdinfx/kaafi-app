import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'DukaamiOnline Super Admin — Xarunta Maamulka Guud',
  description: 'Xarunta Maamulka Sare ee DukaamiOnline: Xakameynta Dhaqdhaqaaqa Lacagaha, Dalabyada, Meheradaha, iyo Isticmaalayaasha.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* Top OS System Strip */}
      <header suppressHydrationWarning className="h-10 bg-[#040810] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-50">
        <div suppressHydrationWarning className="flex items-center gap-3">
          <div suppressHydrationWarning className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-200">DUKAAMI-OS / SUPER-ADMIN</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">System: Mobile App (Flutter) &amp; Web Sync: ACTIVE</span>
        </div>
        <div suppressHydrationWarning className="flex items-center gap-4">
          <span className="hidden md:inline text-emerald-400">● Escrow Vault Secured</span>
          <span className="hidden lg:inline text-slate-500">Mogadishu / Garoowe / Hargeisa</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 underline underline-offset-2"
          >
            <span>Suuqa Guud (Marketplace Web)</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div suppressHydrationWarning className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
