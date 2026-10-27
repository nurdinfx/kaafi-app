'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#050c15] via-[#0b1a2f] to-[#050c15] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ff6a00_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/30">
              <span>🚀</span>
              <span>Suuqa Casriga ah ee Soomaaliya</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
              Ku Saabsan <span className="text-[#0052cc]">Dukaami</span><span className="text-[#ff6a00]">Online</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              DukaamiOnline waa madal ganacsi casri ah (e-commerce & marketplace) oo loogu talagalay in ay isku xirto ganacsatada, shirkadaha, iyo macaamiisha ku nool dhammaan gobollada Soomaaliya iyo qurbajoogta.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl mb-4 font-bold">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">
                Hadafkayaga (Our Mission)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Inaan fududeyno ganacsiga gudaha Soomaaliya annagoo siinayna ganacsade kasta qalab casri ah (Shopify-style Storefronts) oo u saamaxaya inuu meheraddiisa ku maamulo online, badeecadahana gaarsiiyo macaamiil cusub si badbaado leh.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-4 font-bold">
                🌟
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 font-display">
                Aragtidada (Our Vision)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Inaan noqonno suuqa digital-ka ah ee ugu kalsoonida badan Bariga Afrika, halkaas oo lacag bixinta, hubinta tayada badeecada, iyo gaarsiinta (logistics) ay ku saleysan yihiin nidaam casri ah oo sugan.
              </p>
            </div>
          </div>

          {/* Core Pillars */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                Maxaa DukaamiOnline Ka Duwaya Kuwa Kale?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Adeegyada gaarka ah ee aan u diyaarinay macaamiisha iyo ganacsatada
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="text-3xl mb-3">🛡️</div>
                <h4 className="font-bold text-slate-900 mb-2 text-base">Amniga Escrow</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lacagtaada waxay ku jirtaa aamin ilaa aad alaabtaada ka hesho oo aad ka qanacdo, kadibna iibiyuhu qaadanayaa lacagta.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="text-3xl mb-3">🏪</div>
                <h4 className="font-bold text-slate-900 mb-2 text-base">Store-yaalka Ganacsatada</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dukaamiye kasta wuxuu yeelanayaa website u gaar ah (Brand storefront) oo leh magaciisa, alaabtiisa, iyo qiimaha jumlada/takoorka.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="font-bold text-slate-900 mb-2 text-base">Degdeg & Fudeyd</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Isku xirka tooska ah ee WhatsApp, taleefan, iyo chat live ah oo u dhaxeeya iibiyaha iyo iibsadaha iyadoo aan la dhex marin cid kale.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-center shadow-lg">
            <h3 className="text-2xl font-bold font-display mb-2">Diyaar ma u tahay inaad ganacsigaaga kobciso?</h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto mb-6">
              Fur store-kaaga maanta bilaash, kaddibna bilow inaad alaabtaada ku iibiso dhammaan magaalooyinka Soomaaliya.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/seller/store-builder"
                className="px-6 py-3 rounded-xl bg-white text-orange-600 font-bold text-xs sm:text-sm hover:bg-orange-50 shadow transition-all"
              >
                ✨ Dhis Store-kaaga Hadda
              </Link>
              <Link
                href="/listings"
                className="px-6 py-3 rounded-xl bg-orange-700/50 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm transition-all"
              >
                Eeg Suuqa Guud →
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
