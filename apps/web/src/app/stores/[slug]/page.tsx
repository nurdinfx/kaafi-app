'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import ProductDetailModal from '../../../components/ProductDetailModal';
import { useStore, StoreProduct } from '../../../context/StoreContext';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function StorefrontPage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { getStoreBySlug } = useStore();

  const store = getStoreBySlug(slug);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  if (!store) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
        <Navbar />
        <div className="max-w-md mx-auto py-24 text-center px-4">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 font-display">
            Meheraddan Lama Helin
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Store-ka aad raadinayso ma jiro ama slug-giisa ayaa khaldan.
          </p>
          <Link
            href="/stores"
            className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md"
          >
            Eeg Meheradaha Kale →
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Filter products by category and search query
  const filteredProducts = store.products.filter((p) => {
    const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchSearch = !searchQuery.trim() || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleWhatsAppChat = () => {
    const text = `Asc ${store.businessName}! Waxaan wax ka daawanayaa store-kaaga Fududeeye Online, waxaana doonayaa inaan wax ka weydiiyo alaabtaada.`;
    const cleanNumber = store.whatsappNumber.replace(/\D/g, '') || '252615000000';
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-slate-100/70 text-slate-800">
      <Navbar />

      {/* Store Hero Banner */}
      <div className="relative overflow-hidden bg-slate-900 text-white min-h-[260px] sm:min-h-[300px]">
        {/* Cover Photo */}
        <img
          src={store.bannerUrl}
          alt={store.businessName}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 flex flex-col justify-end min-h-[260px] sm:min-h-[300px]">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            {/* Logo & Identity */}
            <div className="flex items-end gap-5">
              <img
                src={store.logoUrl}
                alt={store.businessName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-orange-500 bg-slate-900 shadow-2xl flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display truncate">
                    {store.businessName}
                  </h1>
                  {store.isVerified && (
                    <span className="bg-emerald-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-orange-200 font-semibold mb-1">
                  {store.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span>📍 {store.city} {store.district ? `• ${store.district}` : ''}</span>
                  <span>⭐ {store.rating.toFixed(1)} ({store.reviewsCount} qiimeyn)</span>
                  <span>📦 {store.products.length} alaab ah</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleWhatsAppChat}
                className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>💬</span>
                <span>Kula Hadal WhatsApp</span>
              </button>

              <Link
                href="/seller/store-builder"
                className="px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <span>⚙️</span>
                <span>Maamul Store-ka</span>
              </Link>
            </div>
          </div>

          {store.bio && (
            <p className="mt-4 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-3">
              {store.bio}
            </p>
          )}

        </div>
      </div>

      {/* Store Navigation Bar (Custom Categories & Search) */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Store Categories Tab */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === 'ALL'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Dhammaan Alaabta ({store.products.length})
              </button>

              {store.categories.map((cat) => {
                const count = store.products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* In-Store Search */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Ka raadi ${store.businessName}...`}
                className="w-full px-3.5 py-1.5 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-orange-500 bg-slate-50"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Storefront Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <div className="text-5xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Alaab laguma helin xulashadan
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              Isku day inaad beddesho qaybta aad dooratay ama nadiifiso raadinta.
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="px-5 py-2 rounded-xl font-bold text-xs text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100"
            >
              Dib U Soo Celi Dhammaan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </div>

      <Footer />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
