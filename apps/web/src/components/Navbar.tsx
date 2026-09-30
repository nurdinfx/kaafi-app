'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import VisualSearchModal from './VisualSearchModal';

const CATEGORIES_ORANGE_BAR = [
  { label: 'Taleefannada & Qalab Dheeraad ah', slug: 'electronics' },
  { label: 'Caafimaadka, Qurxinta & Timaha', slug: 'health-beauty' },
  { label: 'Dahab & Saacadaha', slug: 'wholesale' },
  { label: 'Elektarooniyada Macmiilka', slug: 'electronics' },
  { label: 'Baakooyin & Kabo', slug: 'fashion' },
  { label: 'Guriga, Beeraha & Cabiriyooyinka', slug: 'real-estate' },
  { label: 'Bajaj', slug: 'vehicles' },
];

export default function Navbar() {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('hudisoft_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hudisoft_token');
    localStorage.removeItem('hudisoft_user');
    setUser(null);
    setUserDropdown(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-sm bg-white">

        {/* ── TOP ANNOUNCEMENT TICKER BAR ── */}
        <div className="w-full bg-slate-900 text-white text-[11px] sm:text-xs font-semibold py-1.5 overflow-hidden">
          <div className="animate-marquee gap-16 items-center">
            {[
              '🚚 Gaarsiin Degdeg ah dhammaan Gobollada Soomaaliya',
              '💳 Lacag bixin: EVC Plus · ZAAD · SAHAL · eDahab',
              '🏬 Fur Store-kaaga Online sida Shopify — BILAASH!',
              '⭐ Tayo la hubiyay — Dammaanad 7 Maalmood ah',
              '📦 Dalabso haddeer — ka Hel Galabta',
              '🔥 Qiimaha ugu hooseeya guaranteed — Price Match!',
              '🚚 Gaarsiin Degdeg ah dhammaan Gobollada Soomaaliya',
              '💳 Lacag bixin: EVC Plus · ZAAD · SAHAL · eDahab',
              '🏬 Fur Store-kaaga Online sida Shopify — BILAASH!',
              '⭐ Tayo la hubiyay — Dammaanad 7 Maalmood ah',
              '📦 Dalabso haddeer — ka Hel Galabta',
              '🔥 Qiimaha ugu hooseeya guaranteed — Price Match!',
            ].map((msg, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-10 sm:px-14 whitespace-nowrap">
                {msg}
              </span>
            ))}
          </div>
        </div>

        
        {/* ROW 1: White Main Navigation Bar (Matching Screenshot Exactly) */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* Left: Brand Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <img
                src="/kaafi_logo.png"
                alt="Kaafi-App Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline font-black tracking-tight font-display text-xl sm:text-2xl leading-none">
                  <span className="text-slate-900">Kaafi-</span>
                  <span className="text-orange-500">App</span>
                </div>
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest leading-none mt-0.5">
                  ONLINE
                </span>
              </div>
            </Link>

            {/* Quick Links next to logo (Matching Screenshot: "Kuwa Ugu Iibka Badan", "Kuwa Cusub") */}
            <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
              <Link
                href="/#bestsellers"
                className="hover:text-orange-600 transition-colors"
              >
                Kuwa Ugu Iibka Badan
              </Link>
              <Link
                href="/#essentials"
                className="hover:text-orange-600 transition-colors"
              >
                Kuwa Cusub
              </Link>
              <Link
                href="/stores"
                className="hover:text-orange-600 transition-colors text-slate-600 font-medium"
              >
                🏬 Meheradaha
              </Link>
              <Link
                href="/seller/store-builder"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all font-bold text-xs"
              >
                <span>✨</span> Fur Store
              </Link>
            </div>

            {/* Center: Search Bar with Camera Icon (Matching Screenshot Form) */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-1 sm:mx-4">
              <div className="relative flex items-center">
                {/* Search Icon */}
                <span className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>

                {/* Input */}
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Raadi badeecooyinka..."
                  className="w-full pl-9 sm:pl-10 pr-11 py-2 sm:py-2.5 rounded-full border border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-white"
                />

                {/* Orange Camera Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsVisualSearchOpen(true)}
                  className="absolute right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title="Raadi Sawir ahaan (Visual Search)"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right Tools: SO Language, Shopping Cart Icon, Gal User Menu */}
            <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
              
              {/* Language SO */}
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 cursor-pointer hover:text-orange-600 transition-colors">
                <span className="text-base">🌐</span>
                <span className="hidden sm:inline">SO</span>
              </div>

              {/* Shopping Cart (Shopping Trolley Icon with badge) */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 sm:p-2 text-slate-700 hover:text-orange-600 transition-colors"
                aria-label="View Cart"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>

                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Gal Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:border-orange-500 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>👤</span>
                  <span>{user ? user.fullName?.split(' ')[0] : 'Gal'}</span>
                  <span className="text-[10px] text-slate-400">▾</span>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50 text-slate-700 text-xs font-medium animate-slide-up">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-bold text-slate-900">{user.fullName}</p>
                          <p className="text-[11px] text-slate-400">{user.email || user.phoneNumber}</p>
                        </div>
                        <Link
                          href="/orders"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600"
                        >
                          📦 Dalabyadayda (Orders)
                        </Link>
                        <Link
                          href="/seller/store-builder"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 font-bold text-orange-600"
                        >
                          ✨ Store Builder (Sida Shopify)
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 border-t border-slate-100"
                        >
                          Ka Bax (Logout)
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 font-bold text-orange-600"
                        >
                          Gal / Diiwaangeli (Login / Sign Up)
                        </Link>
                        <Link
                          href="/seller/store-builder"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 text-slate-700 font-semibold"
                        >
                          🏬 Fur Store-kaaga Sida Shopify
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

            </div>

          </div>
        </div>

        {/* ROW 2: Vibrant Orange Category Bar (Matching Screenshot Exactly) */}
        <div className="bg-[#ea580c] text-white text-xs font-bold py-2 sm:py-2.5 px-4 overflow-x-auto scrollbar-hide shadow-inner">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            
            {/* Horizontal Categories */}
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
              {CATEGORIES_ORANGE_BAR.map((cat) => (
                <Link
                  key={cat.label}
                  href={`/listings?categorySlug=${cat.slug}`}
                  className="hover:text-amber-200 transition-colors text-[11px] sm:text-xs tracking-tight whitespace-nowrap"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {/* Pill on the Right: Dhammaan Qaybaha → */}
            <Link
              href="/listings"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-white text-xs font-bold border border-white/40 hover:bg-white/10 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <span>Dhammaan Qaybaha</span>
              <span>→</span>
            </Link>

          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2 text-xs font-semibold text-slate-700">
            <Link href="/#bestsellers" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-orange-50 text-orange-600">
              🔥 Kuwa Ugu Iibka Badan
            </Link>
            <Link href="/#essentials" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-orange-50">
              📱 Phone Essentials
            </Link>
            <Link href="/stores" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-orange-50">
              🏪 Meheradaha (Stores)
            </Link>
            <Link href="/seller/store-builder" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 bg-orange-500 text-white font-bold rounded-lg text-center">
              🏬 Fur Store-kaaga Sida Shopify
            </Link>
          </div>
        )}

      </header>

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
      />
    </>
  );
}
