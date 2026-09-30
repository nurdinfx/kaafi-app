'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useStore, MerchantStore, StoreProduct } from '../../../context/StoreContext';

export default function StoreBuilderPage() {
  const router = useRouter();
  const { stores, createStore, updateStore, addProductToStore, deleteStoreProduct, updateStoreProduct, addStoreCategory, deleteStoreCategory } = useStore();

  // Active store selected for editing (defaults to first or create new)
  const [selectedStoreSlug, setSelectedStoreSlug] = useState<string>(stores[0]?.slug || 'new');
  const [activeTab, setActiveTab] = useState<'brand' | 'categories' | 'stock' | 'preview'>('brand');

  const currentStore = stores.find((s) => s.slug === selectedStoreSlug);

  // Brand form state
  const [businessName, setBusinessName] = useState(currentStore?.businessName || '');
  const [slug, setSlug] = useState(currentStore?.slug || '');
  const [tagline, setTagline] = useState(currentStore?.tagline || '');
  const [bio, setBio] = useState(currentStore?.bio || '');
  const [logoUrl, setLogoUrl] = useState(currentStore?.logoUrl || '');
  const [bannerUrl, setBannerUrl] = useState(currentStore?.bannerUrl || '');
  const [themeColor, setThemeColor] = useState(currentStore?.themeColor || '#ea580c');
  const [city, setCity] = useState(currentStore?.city || 'Garoowe');
  const [district, setDistrict] = useState(currentStore?.district || '');
  const [whatsappNumber, setWhatsappNumber] = useState(currentStore?.whatsappNumber || '+252615000000');
  const [phone, setPhone] = useState(currentStore?.phone || '+252907000000');

  // Category state
  const [newCategoryName, setNewCategoryName] = useState('');

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
    setTimeout(() => setToastMessage(null), 3000);
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
      setWhatsappNumber(s.whatsappNumber);
      setPhone(s.phone);
      setProdCategory(s.categories[0] || 'Guud');
    }
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      alert('Fadlan geli magaca ganacsiga!');
      return;
    }

    if (currentStore) {
      updateStore(currentStore.slug, {
        businessName,
        tagline,
        bio,
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop',
        bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
        themeColor,
        city,
        district,
        whatsappNumber,
        phone,
      });
      showToast('✓ Xogta meheraddaada si guul leh ayaa loo keydiyay!');
    } else {
      const newStore = createStore({
        businessName,
        slug: slug || businessName.toLowerCase().replace(/\s+/g, '-'),
        tagline,
        bio,
        logoUrl,
        bannerUrl,
        themeColor,
        city,
        district,
        whatsappNumber,
        phone,
      });
      setSelectedStoreSlug(newStore.slug);
      showToast('🎉 Hambalyo! Meheraddaada cusub waa la sameeyay!');
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !currentStore) return;
    addStoreCategory(currentStore.slug, newCategoryName.trim());
    setNewCategoryName('');
    showToast(`✓ Qaybta "${newCategoryName.trim()}" waa lagu daray!`);
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
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=500&fit=crop',
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&h=500&fit=crop',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
  ];

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <Navbar />

      {/* Top Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold mb-2 border border-orange-500/30">
                <span>🚀</span>
                <span>Fududeeye Shopify-Like Store Builder</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                Dhis & Maamul Store-kaaga Ganacsi
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Kala dooro meheradahaaga, u samee Logo iyo Brand u gaar ah, ku dar Categories, oo maamul Stock-gaaga.
              </p>
            </div>

            {/* Storefront Link Button */}
            {currentStore && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/stores/${currentStore.slug}`}
                  target="_blank"
                  className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  <span>👁️</span>
                  <span>Eeg Store-ka (Live Storefront)</span>
                  <span>↗</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Switcher Bar */}
      <div className="bg-white border-b border-slate-200 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Meheradda Hadda:</span>
            <div className="flex gap-2">
              {stores.map((s) => (
                <button
                  key={s.slug}
                  onClick={() => handleSelectStore(s.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedStoreSlug === s.slug
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <img src={s.logoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{s.businessName}</span>
                </button>
              ))}

              <button
                onClick={() => {
                  setSelectedStoreSlug('new');
                  setBusinessName('');
                  setSlug('');
                  setTagline('');
                  setBio('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border border-dashed transition-all flex items-center gap-1 ${
                  selectedStoreSlug === 'new'
                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                    : 'border-slate-300 text-slate-600 hover:border-orange-400'
                }`}
              >
                <span>+</span>
                <span>Fur Store Cusub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Toast feedback */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6 space-x-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('brand')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'brand'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>🎨</span>
            <span>Brand, Logo & Cover</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📂</span>
            <span>Qaybaha Store-ka (Categories)</span>
            {currentStore && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full">
                {currentStore.categories.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📦</span>
            <span>Maamulka Stock-ga (Inventory)</span>
            {currentStore && (
              <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded-full font-black">
                {currentStore.products.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Brand, Logo & Cover Banner */}
        {activeTab === 'brand' && (
          <form onSubmit={handleSaveBrand} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              
              {/* Store Details Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <span>🏢</span>
                  <span>Macluumaadka Guud ee Meheradda</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Magaca Store-ka (Business Name)*
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Hilaac Fashion Store"
                      required
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-orange-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL Handle / Slug (Link-ga Store-ka)*
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden">
                      <span className="text-xs text-slate-400 pl-3">/stores/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                        placeholder="hilaac-fashion"
                        className="w-full p-3 text-sm focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Halkudhegga Store-ka (Slogan / Tagline)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Dharka Dumarka & Raga ee Ugu Tayada Sarreeya"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Faahfaahinta Meheradda (Bio / About)
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ka sheekee badeecooyinka aad iibiso, tayadaada, iyo dammaanadda..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-orange-500 bg-white"
                  />
                </div>

                {/* Location & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Magaalada (City)
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="Garoowe">Garoowe</option>
                      <option value="Muqdisho">Muqdisho (Bakaaraha)</option>
                      <option value="Hargeisa">Hargeisa</option>
                      <option value="Bosaso">Bosaso</option>
                      <option value="Kismaayo">Kismaayo</option>
                      <option value="Baydhabo">Baydhabo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degmada / Suuqa (District / Market)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Suuqa Bakaaraha, Suuqa Sare"
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Number (Macaamiishu toos kuugu soo xariiraan)
                    </label>
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+252615000000"
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Telefoonka Guud (Phone)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+252907000000"
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Logo & Banner Customization Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <span>🖼️</span>
                  <span>Logo & Hero Cover Banner</span>
                </h3>

                {/* Logo input & presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sawirka Logo-ga (URL ama Dooro Tusaale)
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm mb-2 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Tusaalooyinka Logo-ga:</span>
                    {logoPresets.map((lp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setLogoUrl(lp)}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                          logoUrl === lp ? 'border-orange-500 scale-110 ring-2 ring-orange-200' : 'border-slate-300'
                        }`}
                      >
                        <img src={lp} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner input & presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sawirka Cover Banner (Dusha Sare ee Store-ka)
                  </label>
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm mb-2 bg-white"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Tusaalooyinka Cover-ka:</span>
                    {bannerPresets.map((bp, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setBannerUrl(bp)}
                        className={`w-14 h-8 rounded-lg overflow-hidden border-2 transition-transform hover:scale-105 ${
                          bannerUrl === bp ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-300'
                        }`}
                      >
                        <img src={bp} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Save */}
              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-xl shadow-orange-500/25 transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>Keydi Xogta Store-ka (Save Store)</span>
              </button>
            </div>

            {/* Right: Live Card Preview */}
            <div className="space-y-6">
              <div className="sticky top-28 bg-white rounded-3xl p-5 shadow-lg border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Muuqaalka Tooska ah (Live Preview)
                </h4>

                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-md">
                  {/* Banner */}
                  <div className="relative h-28 bg-slate-800">
                    <img
                      src={bannerUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800'}
                      alt=""
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Verified Store
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <div className="flex items-end gap-3 -mt-6 mb-2">
                      <img
                        src={logoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop'}
                        alt=""
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500 bg-slate-900 shadow-md"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm font-display leading-tight">
                          {businessName || 'Magaca Meheradda'}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          📍 {city} • {district || 'Suuqa Sare'}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mt-2">
                      {tagline || 'Dharka & badeecooyinka casriga ah ee dalka.'}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-orange-400 font-bold">
                      <span>WhatsApp: {whatsappNumber}</span>
                      <span>Booqo →</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-orange-900">
                  💡 <strong>Talo Ganacsi:</strong> Doorashada sawirro tayo sare leh iyo buuxinta WhatsApp-ka waxay 4x kordhisaa iibkaaga maalinlaha ah.
                </div>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Categories Management (Collections) */}
        {activeTab === 'categories' && currentStore && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-display mb-1 flex items-center gap-2">
                <span>📂</span>
                <span>Qaybaha Alaabta ee {currentStore.businessName}</span>
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                U samee meheraddaada qaybo kala soocan sida Shopify Collections (tusaale: Dharka Dumarka, Kabaha, Saacadaha).
              </p>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Magaca qaybta cusub (e.g. Diracyada Xariirta ah)"
                  className="flex-1 p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-orange-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-md"
                >
                  + Ku Dar Qayb
                </button>
              </form>

              {/* Categories list */}
              <div className="space-y-3">
                {currentStore.categories.map((cat, idx) => {
                  const count = currentStore.products.filter((p) => p.category === cat).length;
                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-orange-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{cat}</h4>
                          <span className="text-xs text-slate-400">{count} alaab ah ayaa ku jira</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteStoreCategory(currentStore.slug, cat)}
                        className="text-xs text-slate-400 hover:text-rose-500 p-2 font-bold"
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                    <span>📦</span>
                    <span>Maamulka Alaabta & Stock-ga ({currentStore.businessName})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Waxaad haysataa <strong>{currentStore.products.length}</strong> badeecadood. Waxaad wax ka beddeli kartaa tirada yaalla bakhaarka, qiimaha, ama ku dari kartaa alaab cusub.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span>+</span>
                  <span>Ku Dar Alaab Cusub (Add Product)</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Alaabta</th>
                      <th className="p-3.5">Qaybta</th>
                      <th className="p-3.5">Qiimaha</th>
                      <th className="p-3.5">Stock Quantity</th>
                      <th className="p-3.5">Xaaladda Stock-ga</th>
                      <th className="p-3.5 rounded-r-xl text-right">Hawlaha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentStore.products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.images[0]}
                              alt=""
                              className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white"
                            />
                            <div>
                              <div className="font-bold text-slate-800 text-sm line-clamp-1 max-w-xs">
                                {prod.title}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                SKU: {prod.sku}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-semibold text-slate-600">
                          <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-200">
                            {prod.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 text-sm">${prod.price.toFixed(2)}</span>
                          {prod.compareAtPrice && (
                            <span className="text-[11px] text-slate-400 line-through ml-1.5">
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
                              className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-bold text-slate-800 text-sm">
                              {prod.stockQuantity}
                            </span>
                            <button
                              onClick={() =>
                                updateStoreProduct(currentStore.slug, prod.id, {
                                  stockQuantity: prod.stockQuantity + 1,
                                })
                              }
                              className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Stock status badge */}
                        <td className="p-3.5">
                          {prod.stockQuantity > 10 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Waa Buuxaa (In Stock)
                            </span>
                          ) : prod.stockQuantity > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Wuu Gabaabsi yahay ({prod.stockQuantity})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Wuu Dhamaaday (Out of Stock)
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => deleteStoreProduct(currentStore.slug, prod.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
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

      {/* Modal: Add New Product (Sida Shopify Add Product) */}
      {showAddProductModal && currentStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="font-bold text-xl text-slate-900 font-display">
                  Ku Dar Alaab Cusub Stock-gaaga
                </h3>
                <p className="text-xs text-slate-400">
                  Meheradda: <strong>{currentStore.businessName}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Magaca Alaabta (Product Title)*
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. 2MP Full HD Security Camera CCTV Bullet..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-orange-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Qaybta (Category)*
                  </label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {currentStore.categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    SKU / Koodhka Alaabta
                  </label>
                  <input
                    type="text"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Qiimaha Iibka ($)*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="15.00"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Qiimihii Hore ($ Compare-at)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(e.target.value)}
                    placeholder="25.00"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cadadka Stock-ga (Tirada yaalla)
                  </label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sawirka Alaabta (Image URL)
                </label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Midabbada (Kala saar hakad ",")
                  </label>
                  <input
                    type="text"
                    value={prodColors}
                    onChange={(e) => setProdColors(e.target.value)}
                    placeholder="Black, White, Gold"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cabbirrada (Kala saar hakad ",")
                  </label>
                  <input
                    type="text"
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    placeholder="M, L, XL"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sharaxaadda Alaabta (Description)
                </label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Faahfaahin ku saabsan tayada alaabta, astaamaha gaarka ah..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm bg-white"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-transform hover:-translate-y-0.5"
                >
                  Ku Dar Alaabta Stock-ga
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200"
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
