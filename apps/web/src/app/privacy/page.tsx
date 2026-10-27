'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1">
        {/* Header */}
        <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-4xl mx-auto text-center space-y-3">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
              Amniga Xogtaada
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
              Siyaasadda Xog-ilaalinta (Privacy Policy)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Waxaa la cusbooneysiiyay: Janaayo 2026 • DukaamiOnline
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-sm text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                1. Xogta Aan Ururinno
              </h2>
              <p>
                Waxaan ururinnaa macluumaadka lagama maarmaanka u ah adeegsiga suuqa, sida:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                <li>Lambarka taleefankaaga gacanta iyo magacaaga diiwaangelinta.</li>
                <li>Goobta aad ku sugan tahay (Magaalada iyo Degmada) si lagugu gaarsiiyo dalabkaaga.</li>
                <li>Xogta meheraddaada haddii aad tahay iibiye (Magaca dukaanka, cinwaanka, sawirada alaabta).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                2. Sida Aan U Isticmaalno Xogtaada
              </h2>
              <p>
                Macluumaadkaaga waxaa loo adeegsadaa oo kaliya in lagu fududeeyo iibka, xaqiijinta koontadaada, gaarsiinta badeecadaha, iyo la xiriirka macaamiisha. Marna kama iibino mana la wadaagno xogtaada cid saddexaad oo aan shaqo ku lahayn fulinta adeeggaaga.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                3. Ilaalinta Amniga Xogta
              </h2>
              <p>
                Dhammaan xogta u dhaxeysa browser-kaaga iyo adeegaha DukaamiOnline waxaa lagu qabtaa hab sireysan (SSL / TLS Encryption). Nidaamyadayada sirta ah waxay ka hortagaan in cid aan loo oggolayn ay wax ka beddesho ama daawato macluumaadkaaga shakhsiga ah.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2 font-display">
                4. Xuquuqdaada
              </h2>
              <p>
                Waxaad xaq u leedahay inaad wax ka beddesho, cusbooneysiiso, ama tirtirto koontadaada iyo dhammaan macluumaadka kugu saabsan adigoo la xiriiraya maamulka ama ka samaynaya bogga koontadaada.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-500">
                Wixii faahfaahin ah oo ku saabsan xog-ilaalinta, la xiriir: privacy@dukaamionline.com
              </p>
              <Link
                href="/terms"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline"
              >
                Eeg Shuruudaha Adeegga →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
