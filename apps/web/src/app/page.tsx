'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import TrustBadges from '../components/TrustBadges';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import Footer from '../components/Footer';
import { useStore, StoreProduct } from '../context/StoreContext';

/* ─── Inline category grid for homepage (replaces backend call) ─── */
const HOME_CATEGORIES = [
  { label: 'Dharka Dumarka', icon: '👗', slug: 'fashion', color: '#f97316' },
  { label: 'Taleefannada', icon: '📱', slug: 'electronics', color: '#0ea5e9' },
  { label: 'Saacadaha', icon: '⌚', slug: 'wholesale', color: '#d97706' },
  { label: 'Guriga', icon: '🏠', slug: 'real-estate', color: '#10b981' },
  { label: 'Gaadiidka', icon: '🚗', slug: 'vehicles', color: '#6366f1' },
  { label: 'Caafimaad', icon: '💊', slug: 'health-beauty', color: '#ec4899' },
  { label: 'Alaab Xoolo', icon: '🌾', slug: 'wholesale', color: '#84cc16' },
  { label: 'Dhismaha', icon: '🏗️', slug: 'real-estate', color: '#64748b' },
];

export default function HomePage() {
  const { stores, popularProducts, essentialProducts } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  return (
    <main className="min-h-screen bg-slate-100/70 text-slate-800">
      {/* ── NAVBAR with announcement ticker ── */}
      <Navbar />

      {/* ── HERO SECTION: Auto-rotating animated slides ── */}
      <HeroSection />

      {/* ── TRUST BADGES ── */}
      <TrustBadges />

      {/* ── QUICK CATEGORY PILLS ── */}
      <section className="py-6 sm:py-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-display">
              Raadi Qaybta Aad Rabto
            </h2>
            <Link href="/listings" className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors">
              Dhammaan Qaybaha →
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {HOME_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug + cat.label}
                href={`/listings?categorySlug=${cat.slug}`}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 transition-all duration-200 text-center hover:-translate-y-0.5"
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform group-hover:scale-110"
                  style={{ background: `${cat.color}20`, border: `1.5px solid ${cat.color}30` }}
                >
                  {cat.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-slate-700 group-hover:text-orange-700 leading-tight transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 1: Kuwa Ugu Iibka Badan (Best Sellers) ── */}
      <section id="bestsellers" className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 text-orange-500 text-xs font-bold tracking-widest uppercase mb-1">
              <span className="w-8 sm:w-16 h-px bg-orange-400" />
              <span>Doorashada Ugu Wanaagsan</span>
              <span className="w-8 sm:w-16 h-px bg-orange-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display">
              Kuwa Ugu <span className="text-orange-600">Iibka Badan</span>
            </h2>

            <div className="flex justify-center gap-1.5 mt-2.5">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="w-2 h-2 rounded-full bg-orange-300" />
              <span className="w-2 h-2 rounded-full bg-orange-200" />
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {popularProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-all hover:-translate-y-0.5"
            >
              Daawo Dhammaan Alaabta →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROMOTIONAL BANNER ── */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden relative bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(249,115,22,0.4), transparent 60%), radial-gradient(circle at 70% 50%, rgba(217,119,6,0.3), transparent 60%)' }}
            />
            <div className="relative text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                🔥 Heshiis Gaar Ah
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display leading-tight">
                Gadaal u Gal Hargeysa, Muqdisho,<br />
                <span className="text-orange-400">iyo Garoowe!</span>
              </h3>
              <p className="text-sm text-slate-300 mt-2">Waxaan gaynaa dhammaan magaalooyinka waaweyn ee Soomaaliya</p>
            </div>
            <div className="relative flex-shrink-0">
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm text-orange-900 bg-white hover:bg-orange-50 shadow-2xl transition-transform hover:scale-105"
              >
                Dukaameyso Haddeer →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Phone Essentials & Mega Discounts ── */}
      <section id="essentials" className="py-10 sm:py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold tracking-widest uppercase mb-1">
                <span className="w-8 h-px bg-orange-500" />
                <span>La Muujiyay</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                Phone Essentials & <span className="text-orange-600">Qiimo Dhimis Gaar Ah</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Qalabka casriga ah ee taleefannada oo leh dhimis gaareysa ilaa -82%
              </p>
            </div>

            <Link
              href="/listings?categorySlug=electronics"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm text-white bg-orange-500 hover:bg-orange-600 shadow-md transition-transform hover:-translate-y-0.5 w-max"
            >
              <span>Daawo Dhammaan</span>
              <span>→</span>
            </Link>
          </div>

          {/* Grid of Essentials */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {essentialProducts.slice(0, 12).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
                badgeType="discount"
              />
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 3: Meheradaha Ganacsatada (Shopify-like Multi-Storefront Showcase) ── */}
      <section className="py-12 sm:py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-2 border border-orange-500/30">
                <span>🏬</span>
                <span>Shopify-Style Merchant Platform</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-display">
                Meheradaha Shahaadada Leh ee Kaafi-App
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Ganacsade kasta wuxuu leeyahay brand, logo, categories iyo stock u gaar ah. Waxaad ka dukaameysan kartaa meheradaha ama adigu aad furataa mid adiga kuu gaar ah!
              </p>
            </div>

            <Link
              href="/seller/store-builder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 transition-transform hover:-translate-y-0.5 w-max"
            >
              <span>✨</span>
              <span>Fur Store-kaaga Hadda (Sida Shopify)</span>
              <span>→</span>
            </Link>
          </div>

          {/* Stores Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-slate-800/90 border border-slate-700/80 hover:border-orange-500/60 shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Store Cover Banner */}
                <div className="relative h-32 w-full overflow-hidden bg-slate-700">
                  <img
                    src={store.bannerUrl}
                    alt={store.businessName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {/* Verified Badge */}
                  {store.isVerified && (
                    <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span>✓</span> Verified Store
                    </div>
                  )}
                </div>

                {/* Store Info */}
                <div className="p-5 pt-0 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Logo & Name */}
                    <div className="flex items-end gap-3 -mt-8 mb-3">
                      <img
                        src={store.logoUrl}
                        alt={store.businessName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 bg-slate-900 shadow-lg"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base font-display truncate group-hover:text-orange-400 transition-colors">
                          {store.businessName}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          📍 {store.city} {store.district ? `• ${store.district}` : ''}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      {store.tagline || store.bio}
                    </p>

                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {store.categories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/60 text-orange-200 border border-slate-600/50"
                        >
                          {cat}
                        </span>
                      ))}
                      {store.categories.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-700/40 text-slate-400">
                          +{store.categories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer stats & Visit button */}
                  <div className="pt-3 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <strong className="text-white">{store.products.length}</strong> alaab ah bakhaarka
                    </div>
                    <span className="text-orange-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Booqo Store-ka →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 4: Shopify-like Merchant Invitation Banner ── */}
      <section className="py-12 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-black/20 p-8 sm:p-12 border border-white/20 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                🚀 Ku Iibi Kaafi-App Online
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-display leading-tight">
                Ma rabtaa inaad yeelato Store Online ah sida Shopify?
              </h3>
              <p className="text-sm text-orange-100 leading-relaxed">
                Ku dhex sameyso meherad buuxda: ku dar logo-gaaga, cover banner, samayso qaybaha alaabta (categories), maamul stock-gaaga, oo si toos ah uga hel macaamiil dalka oo dhan lacagtoodana ku bixinaya EVC Plus & eDahab!
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/80">
                <span className="flex items-center gap-1">✅ Bilaash</span>
                <span className="flex items-center gap-1">✅ Xawli ah</span>
                <span className="flex items-center gap-1">✅ URL Kuu Gaar ah</span>
                <span className="flex items-center gap-1">✅ Logo & Brand</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/seller/store-builder"
                className="px-8 py-4 rounded-2xl font-black text-sm text-orange-900 bg-white hover:bg-orange-50 shadow-2xl transition-transform hover:scale-105 text-center"
              >
                Fur Store-kaaga Bilaash →
              </Link>
              <Link
                href="/stores"
                className="px-6 py-4 rounded-2xl font-bold text-sm text-white bg-black/30 hover:bg-black/40 border border-white/30 text-center transition-colors"
              >
                Eeg Meheradaha Kale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── Product Quick View Modal ── */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
