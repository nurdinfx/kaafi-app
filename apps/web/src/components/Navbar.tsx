'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

const CATEGORIES_NAV = [
  { label: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { label: 'Real Estate', slug: 'real-estate', icon: '🏢' },
  { label: 'Land', slug: 'land', icon: '📐' },
  { label: 'Electronics', slug: 'electronics', icon: '📱' },
  { label: 'Services', slug: 'services', icon: '🛠️' },
  { label: 'Fashion', slug: 'fashion', icon: '👗' },
  { label: 'Wholesale', slug: 'wholesale', icon: '🏭' },
  { label: 'Food', slug: 'food', icon: '🥬' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const router = useRouter();

  useEffect(() => {
    const saved = (localStorage.getItem('fududeeye_theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('fududeeye_theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('hudisoft_token');
    const storedUser = localStorage.getItem('hudisoft_user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }

    if (token) {
      api.getNotifications(token).then((notes) => {
        const unread = notes.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hudisoft_token');
    localStorage.removeItem('hudisoft_user');
    setUser(null);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(5,12,21,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-black text-white"
                style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
              >
                F
              </div>
              <div className="hidden sm:block">
                <div
                  className="font-display font-bold text-white text-lg leading-none"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Fududeeye
                </div>
                <div className="text-xs text-blue-400 leading-none">Garoowe, Somalia</div>
              </div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                id="global-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Raadi wax kasta... (Search anything)"
                className="w-full pl-4 pr-12 py-2.5 rounded-xl text-sm border outline-none transition-all duration-200 text-white placeholder-blue-900"
                style={{
                  background: 'rgba(15,32,64,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontSize: '14px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0c8fe2';
                  e.target.style.boxShadow = '0 0 0 3px rgba(12,143,226,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                id="search-submit-btn"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                style={{ background: '#0c8fe2' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/listings/create"
              id="post-listing-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs text-white transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: '0 2px 12px rgba(249,115,22,0.3)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Post
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                {/* Notifications Bell */}
                <Link
                  href="/notifications"
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all"
                  style={{
                    background: 'rgba(15,32,64,0.8)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#94b4d0',
                  }}
                  title="Notifications"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: '#0c8fe2' }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Orders */}
                <Link
                  href="/orders"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border"
                  style={{ background: 'rgba(15,32,64,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  📦 Orders
                </Link>

                {/* Chat */}
                <Link
                  href="/chat"
                  id="nav-chat-btn"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 border flex items-center gap-1"
                  style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.25)' }}
                >
                  💬 Chat
                </Link>

                {/* Wallet */}
                <Link
                  href="/wallet"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 border"
                  style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}
                >
                  💳 Wallet
                </Link>

                {/* Seller Dashboard */}
                <Link
                  href="/seller"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-300 border"
                  style={{ background: 'rgba(12,143,226,0.08)', borderColor: 'rgba(12,143,226,0.25)' }}
                >
                  🏪 Seller Hub
                </Link>

                {/* Business Store Dashboard */}
                <Link
                  href="/dashboard/business"
                  id="nav-business-store-btn"
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 border"
                  style={{ background: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.3)' }}
                >
                  🏢 Store-ka Ganacsiga
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400"
                  title="Logout"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                id="login-btn"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl font-medium text-xs border transition-all duration-200"
                style={{ border: '1px solid rgba(12,143,226,0.4)', color: '#7cc8fb' }}
              >
                Login
              </Link>
            )}

            {/* Theme Toggle (Dark / White Screen) */}
            <button
              type="button"
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'U beddel Shaashad Cad (Light Screen)' : 'U beddel Shaashad Madow (Dark Screen)'}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-sm transition-all duration-200 border"
              style={{
                background: theme === 'dark' ? 'rgba(15,32,64,0.8)' : 'rgba(241,245,249,0.9)',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden w-9 h-9 flex items-center justify-center rounded-lg"
              style={{ background: 'rgba(15,32,64,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {CATEGORIES_NAV.map((cat) => (
              <Link
                key={cat.slug}
                href={`/listings?categorySlug=${cat.slug}`}
                id={`nav-cat-${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all duration-200"
                style={{ color: '#94b4d0' }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
            <div className="flex-1" />
            <Link
              href="/requests/create"
              id="nav-request-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0"
              style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}
            >
              📋 Request What You Need
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="sm:hidden border-t px-4 pb-4 space-y-2"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            background: 'rgba(5,12,21,0.98)',
          }}
        >
          <Link
            href="/listings/create"
            className="block w-full text-center py-2.5 rounded-xl font-semibold text-sm text-white mt-3"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            + Post Listing
          </Link>
          {user ? (
            <>
              <Link href="/orders" className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-white bg-blue-950/60 border border-white/10">
                📦 Dalabyada (Orders)
              </Link>
              <Link href="/chat" className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20">
                💬 Farriimaha & Wadahadalka (Chat)
              </Link>
              <Link href="/wallet" className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20">
                💳 Jeebka (Wallet)
              </Link>
              <Link href="/notifications" className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/60 border border-white/10">
                🔔 Ogeysiisyada ({unreadCount})
              </Link>
              <Link href="/seller" className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-white bg-blue-950/60 border border-white/10">
                🏪 Xarunta Ganacsadaha (Seller Hub)
              </Link>
              <Link href="/dashboard/business" className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-950/40 border border-purple-500/30">
                🏢 Fur / Maamul Store-ka (Business Dashboard)
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-center py-2 rounded-xl text-xs font-semibold text-rose-400 border border-rose-500/20"
              >
                Ka Bax (Log out)
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="block w-full text-center py-2.5 rounded-xl font-medium text-sm border"
              style={{ border: '1px solid rgba(12,143,226,0.4)', color: '#7cc8fb' }}
            >
              Login / Diiwaangeli
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
