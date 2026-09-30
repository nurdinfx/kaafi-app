'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useStore } from '../../context/StoreContext';

export default function StoresDirectoryPage() {
  const { stores } = useStore();
  const [filterCity, setFilterCity] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredStores = stores.filter((s) => {
    const matchCity = filterCity === 'ALL' || s.city.toLowerCase() === filterCity.toLowerCase();
    const matchSearch =
      !search.trim() ||
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.tagline.toLowerCase().includes(search.toLowerCase()) ||
      s.categories.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    return matchCity && matchSearch;
  });

  return (
    <main className="min-h-screen bg-slate-100/70 text-slate-800">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <span>🏬</span>
            <span>Meheradaha Shahaadada Leh ee Soomaaliya</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white">
            Ka Dukaameyso Meheradaha Caanka ah
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Daawo dukaamada xaqiijisan ee ku yaalla Muqdisho (Bakaaraha), Garoowe, Hargeisa, iyo Bosaso. Qof kasta wuxuu leeyahay brand iyo stock u gaar ah.
          </p>

          <div className="pt-2">
            <Link
              href="/seller/store-builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-xl shadow-orange-500/30 transition-transform hover:-translate-y-0.5"
            >
              <span>✨</span>
              <span>Adiguna Fur Store-kaaga Sida Shopify</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* City Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide">
            {['ALL', 'Garoowe', 'Muqdisho', 'Hargeisa', 'Bosaso'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCity(c)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterCity === c
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c === 'ALL' ? '🌍 Dhammaan Magaalooyinka' : `📍 ${c}`}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Raadi magaca store-ka ama alaabta..."
              className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-orange-500 bg-slate-50"
            />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.slug}`}
              className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              {/* Cover Banner */}
              <div className="relative h-36 w-full overflow-hidden bg-slate-800">
                <img
                  src={store.bannerUrl}
                  alt={store.businessName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {store.isVerified && (
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    ✓ Verified Store
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-5 pt-0 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-end gap-3 -mt-8 mb-3">
                    <img
                      src={store.logoUrl}
                      alt={store.businessName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 bg-white shadow-lg flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-base font-display truncate group-hover:text-orange-600 transition-colors">
                        {store.businessName}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">
                        📍 {store.city} {store.district ? `• ${store.district}` : ''}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {store.tagline || store.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {store.categories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    <strong className="text-slate-800">{store.products.length}</strong> alaab ah
                  </span>
                  <span className="text-orange-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Booqo Store-ka →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <Footer />
    </main>
  );
}
