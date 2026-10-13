'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useStore, MerchantStore, StoreProduct } from '../../../context/StoreContext';
import { api } from '../../../lib/api';

export default function StoreBuilderPage() {
  const router = useRouter();
  const { stores, createStore, updateStore, addProductToStore, deleteStoreProduct, updateStoreProduct, addStoreCategory, deleteStoreCategory } = useStore();

  // Active store selected for editing (defaults to first or create new)
  const [selectedStoreSlug, setSelectedStoreSlug] = useState<string>(stores[0]?.slug || 'new');
  const [activeTab, setActiveTab] = useState<'brand' | 'categories' | 'stock'>('brand');

  const currentStore = stores.find((s) => s.slug === selectedStoreSlug);

  // Brand form state
  const [businessName, setBusinessName] = useState(currentStore?.businessName || '');
  const [slug, setSlug] = useState(currentStore?.slug || '');
  const [tagline, setTagline] = useState(currentStore?.tagline || '');
  const [bio, setBio] = useState(currentStore?.bio || '');
  const [logoUrl, setLogoUrl] = useState(currentStore?.logoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop');
  const [bannerUrl, setBannerUrl] = useState(currentStore?.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop');
  const [themeColor, setThemeColor] = useState(currentStore?.themeColor || '#ea580c');
  const [city, setCity] = useState(currentStore?.city || 'Garoowe');
  const [district, setDistrict] = useState(currentStore?.district || '');

  // Category state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategoryWait, setAddingCategoryWait] = useState(false);

  // Add product modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState(currentStore?.categories[0] || 'Guud');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodStock, setProdStock] = useState('25');
  const [prodSku, setProdSku] = useState(`SKU-${Date.now().toString().slice(-6)}`);
  const [prodImage, setProdImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800');
  const [prodDescription, setProdDescription] = useState('');
  const [prodColors, setProdColors] = useState('Black, White, Blue');
  const [prodSizes, setProdSizes] = useState('M, L, XL');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectStore = (storeSlug: string) => {
    setSelectedStoreSlug(storeSlug);
    const s = stores.find((item) => item.slug === storeSlug);
    if (s) {
      setBusinessName(s.businessName);
      setSlug(s.slug);
      setTagline(s.tagline);
      setBio(s.bio);
      setLogoUrl(s.logoUrl);
      setBannerUrl(s.bannerUrl);
      setThemeColor(s.themeColor);
      setCity(s.city);
      setDistrict(s.district || '');
      setProdCategory(s.categories[0] || 'Guud');
    }
  };

  const handleStartNewStore = () => {
    setSelectedStoreSlug('new');
    setBusinessName('');
    setSlug('');
    setTagline('');
    setBio('');
    setLogoUrl('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop');
    setBannerUrl('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop');
    setCity('Garoowe');
    setDistrict('');
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Fadlan geli magaca ganacsiga!');
      return;
    }

    if (currentStore) {
      updateStore(currentStore.slug, {
        businessName: businessName.trim(),
        tagline: tagline.trim(),
        bio: bio.trim(),
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
        themeColor,
        city,
        district: district.trim(),
      });
      showToast('✓ Xogta meheraddaada si guul leh ayaa loo keydiyay!');
    } else {
      const generatedSlug = (slug || businessName.toLowerCase().replace(/\s+/g, '-')).replace(/[^a-z0-9-]/g, '');
      const newStore = createStore({
        businessName: businessName.trim(),
        slug: generatedSlug,
        tagline: tagline.trim(),
        bio: bio.trim(),
        logoUrl,
        bannerUrl,
        themeColor,
        city,
        district: district.trim(),
      });
      setSelectedStoreSlug(newStore.slug);
      showToast('🎉 Hambalyo! Meheraddaada cusub waa la sameeyay!');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !currentStore) return;
    const catName = newCategoryName.trim();
    setAddingCategoryWait(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('hudisoft_token') : null;
    if (token) {
      try {
        await api.createCategory({ name: catName, verticalType: 'PRODUCT' }, token);
      } catch {}
    }

    addStoreCategory(currentStore.slug, catName);
    setNewCategoryName('');
    setAddingCategoryWait(false);
    showToast(`⏳ Qaybta "${catName}" waa lagu daray (Waxay ku jirtaa sugitaan / WAIT)!`);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStore || !prodTitle.trim() || !prodPrice) {
      alert('Fadlan buuxi magaca alaabta iyo qiimaha!');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    const compareNum = prodComparePrice ? parseFloat(prodComparePrice) : undefined;
    const stockNum = parseInt(prodStock) || 10;

    addProductToStore(currentStore.slug, {
      title: prodTitle.trim(),
      category: prodCategory || 'Guud',
      price: priceNum,
      compareAtPrice: compareNum,
      stockQuantity: stockNum,
      sku: prodSku || `SKU-${Date.now().toString().slice(-6)}`,
      images: [prodImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      description: prodDescription || 'Alaab tayo sare leh oo diyaar u ah gaarsiin degdeg ah.',
      colors: prodColors.split(',').map((c) => c.trim()).filter(Boolean),
      sizes: prodSizes.split(',').map((s) => s.trim()).filter(Boolean),
      condition: 'NEW',
      isPopular: true,
    });

    setShowAddProductModal(false);
    // Reset form
    setProdTitle('');
    setProdPrice('');
    setProdComparePrice('');
    setProdStock('25');
    setProdSku(`SKU-${Date.now().toString().slice(-6)}`);
    showToast('✓ Alaabta cusub si guul leh ayaa loogu daray Stock-gaaga!');
  };

  const logoPresets = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
  ];

  const bannerPresets = [
    { title: 'Fashion & Style', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=500&fit=crop' },
    { title: 'Tech & Gadgets', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=500&fit=crop' },
    { title: 'Luxury & Watches', url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&h=500&fit=crop' },
    { title: 'General Store', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop' },
  ];

  const popularCities = ['Garoowe', 'Muqdisho', 'Hargeisa', 'Bosaso', 'Kismaayo', 'Baydhabo'];

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 antialiased">
      <Navbar />

      {/* Top Hero Banner */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span>Dukaami Online • Store Creator</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 flex items-center gap-1">🔒 100% Private In-App Chat</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                Dhis & Qurxi Meheraddaada Ganacsi
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Sameyso meherad casri ah oo u gaar ah astaantaada. Macaamiishu waxay toos kuugula xiriirayaan kaliya Chat-ka sugan ee app-ka si xogtaada lambarrada loogu dhowro si buuxda.
              </p>
            </div>

            {/* Storefront Link Button */}
            {currentStore && (
              <div className="flex items-center gap-3">
                <Link
                  href={`/stores/${currentStore.slug}`}
                  target="_blank"
                  className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-xl shadow-orange-500/25 transition-all hover:-translate-y-0.5 flex items-center gap-2 border border-orange-400/30"
                >
                  <span>👁️</span>
                  <span>Eeg Storefront-ka Tooska ah</span>
                  <span className="text-orange-200">↗</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Switcher Bar */}
      <div className="bg-slate-950/70 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30 py-3 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏪</span> Meheraddaada:
            </span>
            <div className="flex items-center gap-2">
              {stores.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleSelectStore(s.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                    selectedStoreSlug === s.slug
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-400 shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <img src={s.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover ring-1 ring-white/20" />
                  <span>{s.businessName}</span>
                </button>
              ))}

              <button
                onClick={handleStartNewStore}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border border-dashed transition-all flex items-center gap-1.5 ${
                  selectedStoreSlug === 'new'
                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                    : 'border-slate-700 text-slate-400 hover:border-orange-500/50 hover:text-orange-300 bg-slate-900/50'
                }`}
              >
                <span className="text-orange-400 font-black">+</span>
                <span>Fur Meherad Cusub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-2xl shadow-emerald-500/20 flex items-center justify-between border border-emerald-400/30 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">✨</span>
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white p-1">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-8 space-x-4 sm:space-x-8 text-sm font-bold">
          <button
            onClick={() => setActiveTab('brand')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'brand'
                ? 'border-orange-500 text-orange-400 text-sm font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎨</span>
            <span>Astaanta, Logo-ga & Cover-ka</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-orange-500 text-orange-400 text-sm font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📂</span>
            <span>Qaybaha Store-ka (Categories)</span>
            {currentStore && (
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {currentStore.categories.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'border-orange-500 text-orange-400 text-sm font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📦</span>
            <span>Maamulka Alaabta (Inventory)</span>
            {currentStore && (
              <span className="text-[10px] bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full font-black border border-orange-500/30">
                {currentStore.products.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Brand, Logo & Cover Banner */}
        {activeTab === 'brand' && (
          <form onSubmit={handleSaveBrand} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Form Input Cards */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Store Details Card */}
              <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800/80 backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                      🏢
                    </span>
                    <span>Macluumaadka Guud ee Meheradda</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Waxaa loo soo bandhigayaa macaamiisha
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Magaca Store-ka (Business Name)*
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Hilaac Fashion Store"
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      URL Handle / Slug (Link-ga Tooska ah)*
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/90 overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                      <span className="text-xs text-orange-400/80 pl-3 font-mono font-medium">/stores/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        placeholder="hilaac-fashion"
                        className="w-full px-2 py-3 text-sm text-white font-mono bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Halkudhegga Meheradda (Slogan / Tagline)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Dharka Dumarka & Raga ee Ugu Tayada Sarreeya Dalka"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Faahfaahinta Meheradda (Bio / About)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ka sheekee badeecooyinka aad iibiso, tayadaada, dammaanadda, iyo goobta aad ku taal..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>

                {/* Location Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Magaalada (City)
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    >
                      {popularCities.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Degmada ama Suuqa (District / Market)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Suuqa Bakaaraha, Suuqa Sare"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* PRIVACY & IN-APP CHAT GUARANTEE BANNER */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 text-xs text-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <span className="text-base">🛡️</span>
                    <span>Xogtaada Waa Qarsoodi (No Phone Numbers Required)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Lambaradaada taleefanka lama weydiinayo lamana muujinayo dukaanka dhexdiisa. Macaamiisha iyo adiga waxaad si toos ah oo aamin ah ugu wada hadli doontaan kaliya <strong>Chat-ka Gaarka ah ee App-ka (Private Chat)</strong> si looga fogaado khaladaadka iyo xiriirrada dibadda, lana sugo badbaadada heshiisyadaada.
                  </p>
                </div>
              </div>

              {/* Logo & Banner Customization Card */}
              <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800/80 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                      🖼️
                    </span>
                    <span>Logo & Hero Cover Banner</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Muuqaalka Astaantaada
                  </span>
                </div>

                {/* Logo input & presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Sawirka Logo-ga (URL ama Xulo Mid Diyaar ah)
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <span className="text-xs text-slate-400 font-medium">Tusaalooyinka Logo-ga:</span>
                    <div className="flex items-center gap-2">
                      {logoPresets.map((lp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLogoUrl(lp)}
                          className={`w-9 h-9 rounded-2xl overflow-hidden border-2 transition-all hover:scale-110 ${
                            logoUrl === lp
                              ? 'border-orange-500 scale-110 ring-2 ring-orange-500/50 shadow-md shadow-orange-500/30'
                              : 'border-slate-700 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={lp} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Banner input & presets */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-300">
                    Sawirka Cover Banner (Dusha Sare ee Storefront-ka)
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/90 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  
                  <div className="pt-1">
                    <div className="text-xs text-slate-400 font-medium mb-2">Xulo Banner Qosol Leh:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {bannerPresets.map((bp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBannerUrl(bp.url)}
                          className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] text-left group ${
                            bannerUrl === bp.url
                              ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-lg'
                              : 'border-slate-800 opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={bp.url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                              {bp.title}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Save Button */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 shadow-2xl shadow-orange-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-orange-400/30 cursor-pointer"
              >
                <span className="text-lg">💾</span>
                <span>Keydi & Daabac Meheraddaada (Save Storefront)</span>
              </button>
            </div>

            {/* Right 5 Columns: Sticky Live Card Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="sticky top-24 space-y-4">
                
                {/* Preview Header Badge */}
                <div className="flex items-center justify-between px-1">
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Muuqaalka Tooska ah (Live Preview)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Macaamiishu sidaan ayay u arkaan</span>
                </div>

                {/* THE HIGH-END STORE PREVIEW CARD */}
                <div className="rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 text-white shadow-2xl transition-all duration-300 hover:border-slate-700">
                  {/* Banner Image */}
                  <div className="relative h-36 bg-slate-900 overflow-hidden">
                    <img
                      src={bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop'}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 opacity-85"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                    
                    <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 border border-emerald-400/40">
                      <span>✓</span>
                      <span>Verified Store</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 pt-0">
                    <div className="flex items-end gap-3.5 -mt-8 mb-3">
                      <div className="relative">
                        <img
                          src={logoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop'}
                          alt=""
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500 bg-slate-900 shadow-xl ring-2 ring-black/40"
                        />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" title="Online" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-white text-base font-display truncate">
                          {businessName || 'Magaca Meheradda'}
                        </h4>
                        <p className="text-xs text-orange-400 font-semibold truncate">
                          📍 {city} {district ? `• ${district}` : ''}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {tagline || 'Badeecooyinka ugu tayada sarreeya ee dalka gacantaada ku hay.'}
                    </p>

                    {/* Stats Snippet */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <span>⭐</span>
                        <span>5.0 (Qiimeyn Sarreysa)</span>
                      </div>
                      <span className="text-[11px] bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                        {currentStore?.products.length || 0} Alaab
                      </span>
                    </div>

                    {/* Chat Action Button (NO PHONE NUMBERS!) */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-400">Wadahadal Sugan</span>
                      </div>

                      <div className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 border border-emerald-500/30">
                        <span>💬</span>
                        <span>Chat Gaar ah</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Educational Security Callout Box */}
                <div className="p-4 bg-slate-950/70 rounded-3xl border border-slate-800 text-xs text-slate-300 space-y-2 backdrop-blur-md">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <span>💡</span>
                    <span>Maxaa looga saaray lambarada dadweynaha?</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Si loo ilaaliyo xogta gaarka ah ee iibiyaha iyo macmiilka, nidaamku ma ogolaado in lambarada la wadaago bannaanka. Dhammaan iibsiyada iyo su&apos;aalaha waxaa lagu maareeyaa <strong>Chat-ka tooska ah</strong> ee nidaamka Fududeeye, kaasoo si buuxda u hubiya damaanadda alaabta iyo lacagta.
                  </p>
                </div>

              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Categories Management (Collections) */}
        {activeTab === 'categories' && currentStore && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                    📂
                  </span>
                  <span>Qaybaha Alaabta ee {currentStore.businessName}</span>
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                U samee meheraddaada qaybo kala soocan sida Collections (tusaale: Dharka Dumarka, Kabaha, Saacadaha). Qaybaha cusub waxay si toos ah u gelayaan xaaladda sugitaanka (WAIT) ilaa maamulku ansixiyo.
              </p>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Magaca qaybta cusub (e.g. Diracyada Xariirta ah)"
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                <button
                  type="submit"
                  disabled={addingCategoryWait || !newCategoryName.trim()}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {addingCategoryWait ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Fadlan sug (WAIT)...</span>
                    </>
                  ) : (
                    <span>+ Ku Dar Qayb (WAIT / Sugitaan)</span>
                  )}
                </button>
              </form>

              {/* Categories list */}
              <div className="space-y-3">
                {currentStore.categories.map((cat, idx) => {
                  const count = currentStore.products.filter((p) => p.category === cat).length;
                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 font-bold text-xs flex items-center justify-center border border-orange-500/20">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm">{cat}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              ⏳ WAIT / Sugitaan
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{count} alaab ah ayaa ku jira</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteStoreCategory(currentStore.slug, cat)}
                        className="text-xs text-slate-500 hover:text-rose-400 p-2 font-bold transition-colors"
                        title="Tir qaybta"
                      >
                        🗑️ Ka saar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Stock / Inventory Management */}
        {activeTab === 'stock' && currentStore && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white font-display flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                      📦
                    </span>
                    <span>Maamulka Alaabta & Stock-ga ({currentStore.businessName})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Waxaad haysataa <strong>{currentStore.products.length}</strong> badeecadood. Waxaad wax ka beddeli kartaa tirada yaalla bakhaarka, qiimaha, ama ku dari kartaa alaab cusub.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>+</span>
                  <span>Ku Dar Alaab Cusub (Add Product)</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Alaabta</th>
                      <th className="p-3.5">Qaybta</th>
                      <th className="p-3.5">Qiimaha</th>
                      <th className="p-3.5">Stock Quantity</th>
                      <th className="p-3.5">Xaaladda Stock-ga</th>
                      <th className="p-3.5 rounded-r-xl text-right">Hawlaha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {currentStore.products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-12 h-12 rounded-xl object-contain border border-slate-700 bg-slate-900"
                            />
                            <div>
                              <div className="font-bold text-white text-sm line-clamp-1 max-w-xs">
                                {prod.title}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                SKU: {prod.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-300">
                          <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/20">
                            {prod.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-white text-sm">${prod.price.toFixed(2)}</span>
                          {prod.compareAtPrice && (
                            <span className="text-[11px] text-slate-500 line-through ml-1.5">
                              ${prod.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Inline Stock Quantity adjustment */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                updateStoreProduct(currentStore.slug, prod.id, {
                                  stockQuantity: Math.max(0, prod.stockQuantity - 1),
                                })
                              }
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-white text-sm">
                              {prod.stockQuantity}
                            </span>
                            <button
                              onClick={() =>
                                updateStoreProduct(currentStore.slug, prod.id, {
                                  stockQuantity: prod.stockQuantity + 1,
                                })
                              }
                              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Stock status badge */}
                        <td className="p-3.5">
                          {prod.stockQuantity > 10 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Waa Buuxaa (In Stock)
                            </span>
                          ) : prod.stockQuantity > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Wuu Gabaabsi yahay ({prod.stockQuantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Wuu Dhamaaday (Out of Stock)
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => deleteStoreProduct(currentStore.slug, prod.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Tir alaabta"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Add New Product */}
      {showAddProductModal && currentStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-white my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="font-bold text-xl text-white font-display">
                  Ku Dar Alaab Cusub Stock-gaaga
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Meheradda: <strong className="text-orange-400">{currentStore.businessName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Magaca Alaabta (Product Title)*
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. 2MP Full HD Security Camera CCTV Bullet..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Qaybta (Category)*
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:border-orange-500"
                  >
                    {currentStore.categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    SKU / Koodhka Alaabta
                  </label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Qiimaha Iibka ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="15.00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white font-bold focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Qiimihii Hore ($ Compare-at)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Cadadka Stock-ga (Tirada yaalla)
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Sawirka Alaabta (Image URL)
                </label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Midabbada (Kala saar hakad &quot;,&quot;)
                  </label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    placeholder="Black, White, Gold"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Cabbirrada (Kala saar hakad &quot;,&quot;)
                  </label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="M, L, XL"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Sharaxaadda Alaabta (Description)
                </label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Faahfaahin ku saabsan tayada alaabta, astaamaha gaarka ah..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5"
                >
                  Ku Dar Alaabta Stock-ga
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-400 bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  Ka Laabo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
