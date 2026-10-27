'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#050c15] via-[#091b2e] to-[#050c15] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="relative max-w-4xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <span>🛡️</span>
              <span>Amniga Macaamiisha & Ganacsatada</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Badbaadada & Amniga <span className="text-[#0052cc]">Dukaami</span><span className="text-[#ff6a00]">Online</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Waxaan dhisnay nidaam adag oo dhowraya xuquuqda iibiyaha iyo iibsadaha, anagoo ka hortagayna khayaanada iyo been-abuurka.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          {/* Escrow System */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0 font-bold">
                💰
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  1. Nidaamka Lacag-Dhigashada (Escrow Protection)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Markaad alaab ka iibsanayso meherad ama shakhsi, lacagtaadu waxay toos ugu dhacaysaa boorsada dhexe ee amaanada (Escrow Wallet). Iibiyuhu ma heli karo lacagta ilaa aad alaabta gacanta ku dhigto oo aad hubiso in ay sax tahay. Haddii ay khalad tahay ama aadan helin, lacagtaada 100% dib baa lagugu celinayaa.
                </p>
              </div>
            </div>
          </div>

          {/* Merchant Verification */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl flex-shrink-0 font-bold">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  2. Hubinta Shahaadada Meheradaha (Admin Verified Stores)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dukaamada ku jira DukaamiOnline ma noqdaan kuwo dadweynaha u muuqda ilaa maamulka sare (Admin) uu xaqiijiyo aqoonsiga milkiilaha, goobta ganacsiga (Landmark & City), iyo shatiga ganacsi. Waxaad ku garan kartaa calaamadda cagaaran ama buluugga ah ee "Verified Merchant".
                </p>
              </div>
            </div>
          </div>

          {/* Tips for Buyers */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
              <span>💡</span>
              <span>Talooyinka Badbaadada ee Macaamiisha</span>
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Ha bixin lacag shakhsi ah inta aadan adeegsan nidaamka Escrow-ga rasmiga ah ee DukaamiOnline.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Hubi faallooyinka (Reviews) iyo ratings-ka dukaanka kahor intaadan wax dalban.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Wadahadalka ku hay gudaha madasha (Chat) si haddii khilaaf yimaado maamulku u xaqiijiyo xaqiiqda.</span>
              </li>
            </ul>
          </div>

          {/* Report an issue */}
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-amber-900 text-sm">Ma aragtay wax shaki kugu abuuraya ama khayaano ah?</h4>
              <p className="text-xs text-amber-700 mt-1">Kooxdayada amniga ayaa 24/7 diyaar u ah inay baaraan wixii cabasho ah.</p>
            </div>
            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap shadow-xs transition-colors"
            >
              Nala Soo Xiriir / Cabasho
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
