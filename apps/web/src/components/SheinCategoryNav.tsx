'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SHEIN_CATEGORIES, SheinCategory, SheinSubItem } from '../data/sheinCategories';
import { useLanguage } from '../context/LanguageContext';

export default function SheinCategoryNav() {
  const router = useRouter();
  const { t } = useLanguage();

  const getCategoryName = (cat: SheinCategory) => {
    const keyMap: Record<string, string> = {
      'new-in': 'cat_new_in',
      'workdays': 'cat_est_workdays',
      'women': 'cat_women_clothing',
      'beachwear': 'cat_beachwear',
      'curve': 'cat_curve_plus',
      'kids': 'cat_kids',
      'men': 'cat_men_clothing',
      'home': 'cat_home_living',
      'underwear': 'cat_underwear_sleepwear',
      'shoes': 'cat_shoes',
      'jewelry': 'cat_jewelry_accessories',
      'beauty': 'cat_beauty_health',
    };
    const key = keyMap[cat.id];
    return key ? t(key, cat.name) : cat.name;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('new-in');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Active category object
  const activeCategory = SHEIN_CATEGORIES.find((c) => c.id === activeCategoryId) || SHEIN_CATEGORIES[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        navBarRef.current &&
        !navBarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: SheinSubItem) => {
    setIsOpen(false);
    setMobileDrawerOpen(false);
    if (item.query) {
      router.push(`/listings?categorySlug=${item.slug || 'fashion'}&q=${encodeURIComponent(item.query)}`);
    } else if (item.slug) {
      router.push(`/listings?categorySlug=${item.slug}`);
    } else {
      router.push('/listings');
    }
  };

  const handleCategoryTabClick = (cat: SheinCategory) => {
    setActiveCategoryId(cat.id);
    setIsOpen(true);
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-30 w-full" ref={navBarRef}>
      {/* ── SHEIN BLACK CATEGORIES BAR ── */}
      <div className="bg-[#111111] text-white text-[12.5px] font-semibold select-none border-b border-black/40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 flex items-center h-10 sm:h-10 justify-between gap-1">
          
          {/* 1. Categories dropdown button (Shein Style: "Categories ^" or "Categories ∨") */}
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

          {/* 2. Horizontal categories list matching Shein screenshot */}
          <div
            ref={scrollContainerRef}
            className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-1 px-1 whitespace-nowrap text-xs font-medium tracking-tight text-slate-200"
          >
            {SHEIN_CATEGORIES.map((cat) => {
              const isCurrent = activeCategoryId === cat.id && isOpen;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryTabClick(cat)}
                  onMouseEnter={() => {
                    setActiveCategoryId(cat.id);
                    setIsOpen(true);
                  }}
                  className={`relative py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isCurrent
                      ? 'text-white font-bold'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  <span>{getCategoryName(cat)}</span>
                  {cat.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500 text-white font-extrabold leading-none uppercase scale-90">
                      {cat.badge}
                    </span>
                  )}
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

      {/* ── SHEIN MEGA MENU DROPDOWN (DESKTOP) ── */}
      {isOpen && (
        <div
          ref={menuRef}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute left-0 right-0 top-full bg-white shadow-2xl border-b border-slate-200 z-50 animate-fade-in"
          style={{ maxHeight: '560px' }}
        >
          <div className="max-w-[1440px] mx-auto flex h-[500px]">
            
            {/* LEFT COLUMN: Vertical Categories List (Width ~230px) */}
            <div className="w-56 sm:w-64 border-r border-slate-200 bg-white overflow-y-auto py-2 flex-shrink-0 select-none">
              {SHEIN_CATEGORIES.map((cat) => {
                const isActive = activeCategoryId === cat.id;
                return (
                  <div
                    key={cat.id}
                    onMouseEnter={() => setActiveCategoryId(cat.id)}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`flex items-center justify-between px-5 py-2.5 text-xs sm:text-[13px] cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-950 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-[12px] text-slate-400 ${isActive ? 'text-slate-900 font-bold' : ''}`}>
                      ›
                    </span>
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: Shein Circular Subcategory Cards Grid */}
            <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
              <div className="space-y-8">
                {activeCategory.sections.map((sec, secIdx) => (
                  <div key={sec.title + secIdx} className="space-y-4">
                    
                    {/* Section Header */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase">
                      {sec.hasIcon ? (
                        <span className="flex items-center gap-1.5 text-orange-600 font-bold">
                          {/* Shein orange 4-squares icon */}
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" />
                          </svg>
                          <span>{sec.title}</span>
                        </span>
                      ) : (
                        <span>{sec.title}</span>
                      )}
                    </div>

                    {/* Circular Cards Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-9 gap-x-4 gap-y-5">
                      {sec.items.map((subItem, idx) => (
                        <button
                          key={subItem.name + idx}
                          type="button"
                          onClick={() => handleItemClick(subItem)}
                          className="group flex flex-col items-center gap-2 cursor-pointer focus:outline-none text-center"
                        >
                          {/* Circular Avatar */}
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center shadow-xs transition-all duration-200 group-hover:scale-108 group-hover:border-orange-500 group-hover:shadow-md flex-shrink-0">
                            {subItem.isViewAll ? (
                              /* Shein "View All" 4-square grid icon */
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-700 group-hover:text-orange-600 group-hover:bg-orange-50 transition-colors">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="4" y="4" width="6" height="6" rx="1" />
                                  <rect x="14" y="4" width="6" height="6" rx="1" />
                                  <rect x="4" y="14" width="6" height="6" rx="1" />
                                  <rect x="14" y="14" width="6" height="6" rx="1" />
                                </svg>
                              </div>
                            ) : subItem.image ? (
                              <img
                                src={subItem.image}
                                alt={subItem.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                🛍️
                              </div>
                            )}
                          </div>

                          {/* Label Underneath */}
                          <span className="text-[11px] sm:text-xs text-slate-700 font-medium leading-tight group-hover:text-orange-600 transition-colors line-clamp-2 max-w-[76px]">
                            {subItem.name}
                          </span>
                        </button>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
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

            {/* 2-Pane Mobile Categories */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Tabs */}
              <div className="w-28 bg-slate-50 border-r border-slate-200 overflow-y-auto text-xs py-2">
                {SHEIN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full text-left px-2.5 py-3 border-l-2 transition-colors ${
                      activeCategoryId === cat.id
                        ? 'border-orange-500 bg-white font-bold text-orange-600'
                        : 'border-transparent text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Right Subcategories */}
              <div className="flex-1 p-3 overflow-y-auto">
                {activeCategory.sections.map((sec, i) => (
                  <div key={sec.title + i} className="mb-5">
                    <h4 className="text-[11px] font-bold text-slate-900 uppercase mb-3 text-orange-600">
                      {sec.title}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {sec.items.map((sub, sIdx) => (
                        <button
                          key={sub.name + sIdx}
                          type="button"
                          onClick={() => handleItemClick(sub)}
                          className="flex flex-col items-center text-center gap-1"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                            {sub.isViewAll ? (
                              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <rect x="4" y="4" width="6" height="6" rx="1" />
                                <rect x="14" y="4" width="6" height="6" rx="1" />
                                <rect x="4" y="14" width="6" height="6" rx="1" />
                                <rect x="14" y="14" width="6" height="6" rx="1" />
                              </svg>
                            ) : sub.image ? (
                              <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>🛍️</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-700 leading-tight line-clamp-2 max-w-[65px]">
                            {sub.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
