'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { api, Category } from '../lib/api';

// Fallback real categories matching Somali market if API is loading
const DEFAULT_REAL_CATEGORIES: Array<{ id: string; name: string; slug: string; icon?: string }> = [
  { id: '1', name: 'Telefoonnada & Tech', slug: 'electronics', icon: '📱' },
  { id: '2', name: 'Dharka Dumarka & Fashion', slug: 'fashion', icon: '👗' },
  { id: '3', name: 'Gaadiidka & Baabuurta', slug: 'vehicles', icon: '🚗' },
  { id: '4', name: 'Guryaha & Dhulka', slug: 'real-estate', icon: '🏠' },
  { id: '5', name: 'Dhul & Boosas', slug: 'land', icon: '📐' },
  { id: '6', name: 'Qalabka Guriga & Jikada', slug: 'home-living', icon: '🛋️' },
  { id: '7', name: 'Caafimaadka & Qurxinta', slug: 'health-beauty', icon: '✨' },
  { id: '8', name: 'Caruurta & Ciyaarta', slug: 'kids', icon: '🧸' },
  { id: '9', name: 'Ganacsiga Jumlada', slug: 'wholesale', icon: '📦' },
  { id: '10', name: 'Adeegyada & Xirfadaha', slug: 'services', icon: '🔧' },
];

export default function SheinCategoryNav() {
  const router = useRouter();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string; icon?: string; description?: string }>>(DEFAULT_REAL_CATEGORIES);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('electronics');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch real categories from API / Database
  useEffect(() => {
    api.getCategories().then((cats) => {
      if (cats && Array.isArray(cats) && cats.length > 0) {
        const mapped = cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          icon: c.icon || '🛍️',
          description: c.description,
        }));
        setCategories(mapped);
        setActiveCategoryId(mapped[0].id);
      }
    }).catch(() => {});
  }, []);

  const handleCategoryClick = (slug: string) => {
    setIsOpen(false);
    setMobileDrawerOpen(false);
    router.push(`/listings?categorySlug=${slug}`);
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-30 w-full" ref={navBarRef}>
      {/* ── BLACK REAL CATEGORIES BAR ── */}
      <div className="bg-[#111111] text-white text-[12.5px] font-semibold select-none border-b border-black/40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 flex items-center h-10 sm:h-10 justify-between gap-1">
          
          {/* Categories dropdown button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => setIsOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-white font-bold tracking-tight text-xs sm:text-[13px] transition-colors flex-shrink-0 ${
              isOpen ? 'bg-white/20 text-orange-400' : 'hover:bg-white/10'
            }`}
          >
            <span>{t('cat_categories')}</span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-400' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Divider */}
          <div className="h-4 w-[1px] bg-white/20 mx-1 hidden sm:block flex-shrink-0" />

          {/* Real Horizontal categories list */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-1 px-1 whitespace-nowrap text-xs font-medium tracking-tight text-slate-200"
          >
            {categories.map((cat) => {
              const isCurrent = activeCategoryId === cat.id && isOpen;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  onMouseEnter={() => {
                    setActiveCategoryId(cat.id);
                  }}
                  className={`relative py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isCurrent
                      ? 'text-white font-bold'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {cat.icon && <span className="text-sm">{cat.icon}</span>}
                  <span>{cat.name}</span>
                  {isCurrent && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-orange-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right arrow to scroll categories */}
          <button
            type="button"
            onClick={scrollRight}
            className="text-slate-400 hover:text-white px-1 py-1 flex-shrink-0 transition-colors"
            title="Next categories"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>
      </div>

      {/* ── REAL CATEGORIES MEGA MENU (DESKTOP) ── */}
      {isOpen && (
        <div
          ref={menuRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-b border-slate-200 z-50 animate-fade-in"
        >
          <div className="max-w-[1440px] mx-auto p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span>Qaybaha Rasmiga ah ee Suuqa</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">({categories.length} qaybood)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Dooro qaybta aad rabto si aad u hesho dhammaan alaabta ku jirta</p>
              </div>
              <Link
                href="/listings"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                Daawo Dhammaan Alaabta →
              </Link>
            </div>

            {/* Grid of Real Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 hover:border-orange-500/40 hover:bg-orange-50/50 transition-all text-left group"
                >
                  <div className="w-11 h-11 rounded-xl bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center text-xl flex-shrink-0 transition-colors">
                    {cat.icon || '🛍️'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h4>
                    {cat.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {cat.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE SLIDE-OUT CATEGORY DRAWER ── */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 md:hidden animate-fade-in">
          <div className="w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#111111] text-white">
              <span className="font-bold text-sm">Dhammaan Qaybaha (Categories)</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Mobile Categories list */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-orange-50 text-left transition-colors"
                >
                  <span className="text-xl">{cat.icon || '🛍️'}</span>
                  <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
