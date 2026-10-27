'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1">
        {/* Header */}
        <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <span className="text-orange-400 font-bold text-xs uppercase tracking-widest">
              Xeerarka & Qawaaniinta
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              Shuruudaha Adeegga (Terms of Service)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Waxaa la cusbooneysiiyay: Janaayo 2026 • DukaamiOnline & Hudi-Soft Technologies
            </p>
          </div>
        </section>

        {/* Legal Text */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                1. Hordhac iyo Oggolaansho
              </h2>
              <p>
                Markaad isticmaasho DukaamiOnline (Website-ka ama App-ka), waxaad si buuxda u oggolaanaysaa inaad u hoggaansanto dhammaan qodobada, shuruudaha, iyo siyaasadaha ku xusan heshiiskan. Haddii aadan ku qanacsanayn qodobadan, fadlan ha isticmaalin madashan.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                2. Diiwaangelinta Koontada
              </h2>
              <p>
                Qof kasta oo is-diiwaangeliya waa inuu bixiyaa macluumaad sax ah oo run ah sida lambarka taleefanka gacanta, magaca dhabta ah, iyo magaalada uu ku nool yahay. Waxaad adigu shakhsiyan mas'uul ka tahay ilaalinta sirta koontadaada iyo OTP-yada laguugu soo diro SMS.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                3. Shuruudaha Meheradaha & Dukaamada (Store Owners)
              </h2>
              <p>
                Ganacsatada dhisaya dukaamadooda (Store Builder) waxaa laga rabaa:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                <li>Inay bixiyaan xog sugan oo ku saabsan ganacsiga, alaabta, iyo qiimaha dhabta ah.</li>
                <li>In aysan soo dhigin alaabo mamnuuc ah sida maandooriyaha, hubka, ama wax kasta oo ka soo horjeeda diinta Islaamka iyo shuruucda dalka.</li>
                <li>Dukaanku wuxuu noqonayaa mid firfircoon kadib marka maamulku xaqiijiyo (Admin Verification).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                4. Lacag-bixinta & Nidaamka Escrow
              </h2>
              <p>
                Dhammaan wax-iibsiga waxaa lagula talinayaa in lagu saleeyo nidaamka xaqiijinta DukaamiOnline (Escrow). Shirkaddu mas'uul kama noqon doonto wax kasta oo ka dhasha heshiisyo qarsoodi ah oo lagu sameeyay meel ka baxsan madashan.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                5. Joojinta Koontada & Xadgudubyada
              </h2>
              <p>
                DukaamiOnline waxay xaq u leedahay inay tirtirto ama xayirto koonto kasta ama dukaan kasta oo ku kaca khayaano, cabashooyin badan ka yimaadaan, ama jabiya shuruudaha adeegga iyada oo aan digniin hore la siin.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Haddii aad qabto wax su'aalo ah oo ku saabsan shuruudahan, fadlan nagala soo xiriir: <a href="mailto:support@dukaamionline.com" className="text-orange-600 font-semibold underline">support@dukaamionline.com</a>
              </p>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
