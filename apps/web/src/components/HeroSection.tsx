'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_SEARCHES = [
  'Toyota Prado Garoowe', 'iPhone Garoowe', 'Guri Ijar Garoowe',
  'Dhul Guri Garoowe', 'Generator Garoowe', 'Land Cruiser Somalia',
];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Garoowe');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city && city !== 'All Somalia') params.set('city', city);
    router.push(`/listings?${params}`);
  };

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
      {/* Animated background */}
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(12,143,226,0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(249,115,22,0.05) 0%, transparent 50%)
        `,
      }} />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(12,143,226,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(12,143,226,0.15) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: 'rgba(12,143,226,0.15)', border: '1px solid rgba(12,143,226,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-semibold text-blue-300">
              🇸🇴 Somalia&apos;s Leading Digital Marketplace
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}>
            Wax kasta{' '}
            <span className="relative">
              <span style={{
                background: 'linear-gradient(135deg, #0c8fe2, #7cc8fb)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Iib & Iibso
              </span>
            </span>
            <br />
            <span className="text-2xl sm:text-3xl font-semibold" style={{ color: '#94b4d0' }}>
              Garoowe, Puntland, Somalia
            </span>
          </h1>

          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: '#94b4d0' }}>
            Vehicles · Real Estate · Electronics · Services · Wholesale · Land — All in one marketplace
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="relative">
            <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl"
              style={{ background: 'rgba(15,32,64,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
              {/* City selector */}
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="sm:w-40 px-4 py-3 rounded-xl text-sm font-medium outline-none appearance-none"
                style={{ background: 'rgba(22,45,86,0.8)', color: '#7cc8fb', border: '1px solid rgba(12,143,226,0.2)' }}
              >
                <option value="Garoowe">📍 Garoowe</option>
                <option value="Bosaso">📍 Bosaso</option>
                <option value="Garowe">📍 Garowe</option>
                <option value="All Somalia">🌍 All Somalia</option>
              </select>

              {/* Text input */}
              <input
                id="hero-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Raadi... iPhone, Toyota, Guriga, Dhul..."
                className="flex-1 px-4 py-3 rounded-xl text-sm outline-none text-white placeholder-blue-900"
                style={{ background: 'transparent' }}
              />

              <button
                type="submit"
                id="hero-search-btn"
                className="sm:w-auto px-8 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #0c8fe2, #005899)',
                  boxShadow: '0 4px 16px rgba(12,143,226,0.35)',
                  whiteSpace: 'nowrap',
                }}
              >
                🔍 Search
              </button>
            </div>
          </form>

          {/* Quick search pills */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {QUICK_SEARCHES.map((s) => (
              <button
                key={s}
                onClick={() => { setQuery(s); }}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  background: 'rgba(12,143,226,0.1)',
                  border: '1px solid rgba(12,143,226,0.2)',
                  color: '#7cc8fb',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-12 grid grid-cols-3 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: 'Listings', value: '2,400+', icon: '📦' },
            { label: 'Sellers', value: '380+', icon: '🤝' },
            { label: 'Verified Stores', value: '45+', icon: '✅' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-2xl"
              style={{ background: 'rgba(12,143,226,0.08)', border: '1px solid rgba(12,143,226,0.15)' }}>
              <div className="text-xl mb-0.5">{stat.icon}</div>
              <div className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: '#94b4d0' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
