'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import VisualSearchModal from './VisualSearchModal';
import SheinCategoryNav from './SheinCategoryNav';

export default function Navbar() {
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { language, setLanguage, t, currentLangInfo } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('hudisoft_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    window.addEventListener('auth-change', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('auth-change', checkUser);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const tickerMessages = [
    t('ticker_1'),
    t('ticker_2'),
    t('ticker_3'),
    t('ticker_4'),
    t('ticker_5'),
    t('ticker_6'),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-sm bg-white">

        {/* ── TOP ANNOUNCEMENT TICKER BAR ── */}
        <div className="w-full bg-slate-900 text-white text-[11px] sm:text-xs font-semibold py-1.5 overflow-hidden">
          <div className="animate-marquee gap-16 items-center">
            {[...tickerMessages, ...tickerMessages].map((msg, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-10 sm:px-14 whitespace-nowrap">
                {msg}
              </span>
            ))}
          </div>
        </div>

        {/* ROW 1: White Main Navigation Bar */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
            
            {/* Left: Brand Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
              <img
                src="/dukaami_icon.png"
                alt="DukaamiOnline Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-contain shadow-sm border border-slate-100 group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline font-black tracking-tight font-display text-xl sm:text-2xl leading-none">
                  <span className="text-[#0052cc]">Dukaami</span>
                  <span className="text-[#ff6a00]">Online</span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                  dukaamionline.com
                </span>
              </div>
            </Link>

            {/* Quick Links next to logo */}
            <div className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-700 whitespace-nowrap">
              <Link
                href="/#bestsellers"
                className="hover:text-orange-600 transition-colors"
              >
                {t('nav_best_sellers')}
              </Link>
              <Link
                href="/#essentials"
                className="hover:text-orange-600 transition-colors"
              >
                {t('nav_new_in')}
              </Link>
              <Link
                href="/stores"
                className="hover:text-orange-600 transition-colors text-slate-600 font-medium"
              >
                🏬 {t('nav_stores')}
              </Link>
              <Link
                href={user ? "/seller/store-builder" : "/auth/login?redirect=/seller/store-builder"}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all font-bold text-xs"
              >
                <span>✨</span> {t('nav_open_store')}
              </Link>
            </div>

            {/* Center: Search Bar with Camera Icon */}
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
                  placeholder={t('nav_search_placeholder')}
                  className="w-full pl-9 sm:pl-10 pr-11 py-2 sm:py-2.5 rounded-full border border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-white"
                />

                {/* Orange Camera Icon Button */}
                <button
                  type="button"
                  onClick={() => setIsVisualSearchOpen(true)}
                  className="absolute right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors shadow-xs"
                  title={t('nav_visual_search')}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right Tools: Language Switcher, Cart, User Menu */}
            <div className="flex items-center gap-2.5 sm:gap-4 flex-shrink-0">
              
              {/* ── FULL FUNCTIONAL LANGUAGE SWITCHER (SO / AR / EN) ── */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-slate-200 hover:border-orange-500 bg-slate-50/80 hover:bg-orange-50/50 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
                  title="Dooro Luqadda / Select Language / اختر اللغة"
                >
                  <span className="text-base leading-none">{currentLangInfo.flag}</span>
                  <span className="font-extrabold uppercase">{currentLangInfo.code}</span>
                  <span className="text-[9px] text-slate-400">▾</span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-slate-200 py-1.5 z-50 animate-slide-up text-xs font-semibold">
                    <div className="px-3.5 py-1.5 border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Dooro Luqadda / Language
                    </div>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguage(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                          language === l.code
                            ? 'bg-orange-50 text-orange-600 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{l.flag}</span>
                          <span>{l.nativeName}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">({l.code})</span>
                        </div>
                        {language === l.code && (
                          <span className="text-orange-500 font-bold text-sm">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shopping Cart Icon with Badge */}
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

              {/* Admin Portal Quick Switcher (If Admin) */}
              {(user?.roles?.includes?.('SUPER_ADMIN') ||
                user?.roles?.includes?.('FINANCE_ADMIN') ||
                user?.roles?.some?.((r: any) => ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'].includes(r?.role?.name || r?.name || r)) ||
                user?.email === 'admin@hudisoft.com' ||
                user?.phoneNumber === '+252615000000') && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-orange-400 border border-orange-500/40 hover:bg-slate-900 font-bold text-xs transition-all shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>🛡️ {t('nav_admin')}</span>
                </Link>
              )}

              {/* Gal / User Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 hover:border-orange-500 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>👤</span>
                  <span>{user ? user.fullName?.split(' ')[0] : t('nav_login')}</span>
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
                        {/* Admin Link inside Menu */}
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdown(false)}
                          className="px-4 py-2.5 bg-slate-900 text-orange-400 font-bold hover:bg-slate-800 border-b border-slate-800 flex items-center justify-between"
                        >
                          <span>🛡️ {t('nav_admin')}</span>
                          <span className="text-[10px] bg-orange-500/20 px-1.5 py-0.5 rounded text-orange-300 font-mono">OS</span>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600"
                        >
                          📦 {t('nav_my_orders')}
                        </Link>
                        <Link
                          href="/seller/store-builder"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 font-bold text-orange-600"
                        >
                          ✨ {t('nav_my_store')}
                        </Link>
                        <Link
                          href="/chat"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600"
                        >
                          💬 {t('nav_messages')}
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-rose-600 border-t border-slate-100"
                        >
                          {t('nav_logout')}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 hover:text-orange-600 font-bold text-orange-600"
                        >
                          {t('nav_login')} / Sign Up
                        </Link>
                        <Link
                          href="/auth/login?redirect=/seller/store-builder"
                          onClick={() => setUserDropdown(false)}
                          className="block px-4 py-2.5 hover:bg-orange-50 text-slate-700 font-semibold"
                        >
                          🏬 {t('nav_open_store')} (Shopify)
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
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

        {/* ROW 2: Shein Categories Bar & Mega Menu */}
        <SheinCategoryNav />

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-2 text-xs font-semibold text-slate-700">
            <Link href="/#bestsellers" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-orange-50 text-orange-600">
              🔥 {t('nav_best_sellers')}
            </Link>
            <Link href="/#essentials" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-orange-50">
              📱 {t('nav_new_in')}
            </Link>
            <Link href="/stores" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 hover:bg-orange-50">
              🏪 {t('nav_stores')}
            </Link>
            <Link href={user ? "/seller/store-builder" : "/auth/login?redirect=/seller/store-builder"} onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 bg-orange-500 text-white font-bold rounded-lg text-center">
              🏬 {t('nav_open_store')}
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
