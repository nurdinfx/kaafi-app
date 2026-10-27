'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';
import ProductDetailModal from '../../../components/ProductDetailModal';
import { useStore, StoreProduct, MerchantStore } from '../../../context/StoreContext';
import { useLanguage } from '../../../context/LanguageContext';
import { api } from '../../../lib/api';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function StorefrontPage({ params }: Props) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const { getStoreBySlug, verifyStore } = useStore();
  const { t, isRTL, dir } = useLanguage();

  const contextStore = getStoreBySlug(slug);
  const [apiStore, setApiStore] = useState<MerchantStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const store = contextStore || apiStore;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [adminVerifying, setAdminVerifying] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const u = localStorage.getItem('hudisoft_user');
      if (u) setCurrentUser(JSON.parse(u));
    } catch {}

    if (contextStore) {
      setIsLoading(false);
      return;
    }

    // Fallback: Fetch directly from API if context hasn't loaded or store not in local
    let isCancelled = false;
    api.getStore(slug).then((res) => {
      if (isCancelled) return;
      if (res) {
        const mapped: MerchantStore = {
          id: res.id,
          slug: res.slug,
          businessName: res.businessName,
          tagline: res.tagline || 'Ganacsi Casri ah oo Ku yaalla Soomaaliya',
          bio: res.description || 'Ku soo dhowow meheraddeena rasmiga ah.',
          logoUrl: res.logoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
          bannerUrl: res.coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
          themeColor: '#ea580c',
          city: res.city || 'Garoowe',
          district: res.landmarkAddress || '',
          whatsappNumber: res.whatsappNumber || '+252907000000',
          phone: res.phone || '+252907000000',
          isVerified: !!res.isVerified,
          rating: res.rating || 5.0,
          reviewsCount: res.totalReviews || 0,
          createdDate: res.createdAt ? new Date(res.createdAt).toISOString().split('T')[0] : '2026-01-01',
          ownerId: res.ownerId || res.owner?.id,
          ownerName: res.owner?.fullName,
          ownerPhone: res.owner?.phoneNumber || res.phone,
          categories: ['Guud', 'Women Clothing', 'New In', 'Best Sellers'],
          products: (res.listings || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            price: l.price,
            compareAtPrice: Math.round(l.price * 1.15 * 100) / 100,
            discountPercent: 15,
            images: l.media?.length ? l.media.map((m: any) => m.url) : [l.mediaUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
            category: l.category?.name || 'Guud',
            stockQuantity: l.inventoryCount ?? 1,
            sku: `SKU-${l.id.slice(0, 8).toUpperCase()}`,
            description: l.description || '',
            condition: l.condition || 'NEW',
            storeSlug: res.slug,
            storeName: res.businessName,
            isPopular: true,
            isFeatured: true,
            rating: 5.0,
            reviewsCount: 0,
            reviews: [],
          })),
        };
        setApiStore(mapped);
      }
      setIsLoading(false);
    }).catch(() => {
      if (!isCancelled) setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [slug, contextStore]);

  if (isLoading && !store) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
        <Navbar />
        <div className="max-w-md mx-auto py-32 text-center px-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 font-display">
            Fadlan sug, meheradda waa la soo gelinayaa...
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Loading store details and products...
          </p>
        </div>
        <Footer />
      </main>
    );
  }

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

  const userRoles = currentUser?.roles || [];
  const isAdmin =
    userRoles.includes('SUPER_ADMIN') ||
    userRoles.includes('FINANCE_ADMIN') ||
    userRoles.includes('MODERATOR') ||
    currentUser?.email === 'admin@hudisoft.com' ||
    currentUser?.phoneNumber === '+252907000001' ||
    currentUser?.phoneNumber === '+252615000000';

  const normalizePhone = (p?: string) => (p || '').replace(/\D/g, '').replace(/^252/, '');

  const isOwner =
    currentUser &&
    (
      (currentUser.id && (currentUser.id === store.ownerId || currentUser.id === (store as any).owner?.id)) ||
      (currentUser.phoneNumber && normalizePhone(currentUser.phoneNumber) === normalizePhone(store.phone)) ||
      (currentUser.phoneNumber && normalizePhone(currentUser.phoneNumber) === normalizePhone(store.whatsappNumber)) ||
      (currentUser.phoneNumber && normalizePhone(currentUser.phoneNumber) === normalizePhone(store.ownerPhone))
    );

  const canPreview = isOwner || isAdmin;

  // PUBLIC VISIBILITY LOCK:
  // If store is NOT verified, and the user is NOT the owner and NOT an admin:
  // Do NOT show the store content or its products to the public!
  if (isMounted && !store.isVerified && !canPreview) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
        <Navbar />
        <div className="max-w-lg mx-auto py-20 px-4 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-4xl mb-6 shadow-xl shadow-amber-500/10 animate-pulse">
            🔒
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 text-xs font-bold mb-3">
            <span>⏳</span>
            <span>Meherad ku jirta Dib-u-eegis (Pending Admin Approval)</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 font-display">
            Meheraddan Wali Looma Furin Dadweynaha
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
            Dukaanka <strong>"{store.businessName}"</strong> wuxuu ku jiraa habka hubinta iyo xaqiijinta maamulka sare (Admin Verification). Alaabta meheraddan lama soo bandhigi karo ilaa maamulku xaqiijiyo.
          </p>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 mb-6 text-left shadow-xs">
            <div className="text-xs font-bold text-slate-800 mb-1">Ma adigaa iska leh meheraddan?</div>
            <div className="text-[11px] text-slate-500 mb-3">
              Haddii aad tahay mulkiilaha, fadlan gal koontadaada si aad u aragto Preview-gaaga gaarka ah ama aad wax uga beddesho Store Builder-ka.
            </div>
            <Link
              href={`/auth/login?redirect=/stores/${slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              <span>🔑</span>
              <span>Soo Gal Mulkiile Ahaan (Sign In) →</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/stores"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-md"
            >
              ← Eeg Meheradaha La Xaqiijiyay
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Ku Laabo Suuqa Guud
            </Link>
          </div>
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

  const handleAdminVerifyNow = () => {
    setAdminVerifying(true);
    verifyStore(store.slug, true);
    setTimeout(() => setAdminVerifying(false), 800);
  };

  return (
    <main className="min-h-screen bg-slate-100/70 text-slate-800">
      <Navbar />

      {/* Admin Inspector Control Bar */}
      {isAdmin && !store.isVerified && (
        <div className="bg-slate-950 border-b border-orange-500/40 text-white px-4 py-3 text-xs sm:text-sm font-medium flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="text-lg">🛡️</span>
            <div>
              <span className="font-bold text-orange-400">ADMIN STORE INSPECTOR:</span>{' '}
              <span className="text-slate-300">
                Meheraddan waa <strong>UNVERIFIED (Pending)</strong>. Dadweynuhu ma arkaan alaabtan.
              </span>
            </div>
          </div>
          <button
            onClick={handleAdminVerifyNow}
            disabled={adminVerifying}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            {adminVerifying ? '⏳ Xaqiijinayaa...' : '✓ Xaqiiji Meheraddan Hadda (Approve Store)'}
          </button>
        </div>
      )}

      {/* Owner Private Preview Banner */}
      {isOwner && !isAdmin && !store.isVerified && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 px-4 py-3 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 text-center">
          <span className="text-base">⏳</span>
          <span>
            <strong>PREVIEW GAAR AH (Mulkiilaha):</strong> Store-kaagu wuxuu sugayaa oggolaanshaha maamulka (Pending Admin Approval). Adiga kaliya ayaa arki kara preview-gan. Dadweynuhu ma arki doonaan ilaa maamulku xaqiijiyo.
          </span>
        </div>
      )}

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
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-display truncate">
                    {store.businessName}
                  </h1>
                  {store.isVerified ? (
                    <span className="bg-emerald-500/90 text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      ✓ Verified Store
                    </span>
                  ) : (
                    <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      ⏳ Sugaya Xaqiijin (Pending)
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
              <Link
                href="/chat"
                className="px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>💬</span>
                <span>{t('btn_chat_seller', 'Kula Hadal Chat-ka (Private Chat)')}</span>
              </Link>

              <Link
                href="/seller/store-builder"
                className="px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <span>⚙️</span>
                <span>{t('nav_my_store', 'Maamul Store-ka')}</span>
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
