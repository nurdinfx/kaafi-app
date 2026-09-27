'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { api, Category } from '../../../lib/api';

const GAROOWE_DISTRICTS = [
  'Hodan', 'Wadajir', 'Hantiwadaag', 'Israac', '1-da Luulyo', 'Waaberi', 'Midnimo', 'Other'
];

// Fallback initial categories so it is NEVER empty even during network loading
const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-vehicles', name: 'Vehicles & Automotive', slug: 'vehicles', verticalType: 'VEHICLE', icon: '🚗', description: 'Cars, 4WDs, trucks & motorcycles', commissionRate: 3.5 },
  { id: 'cat-real-estate', name: 'Real Estate & Houses', slug: 'real-estate', verticalType: 'REAL_ESTATE', icon: '🏢', description: 'Houses, apartments & shops', commissionRate: 2.5 },
  { id: 'cat-land', name: 'Land & Plots', slug: 'land', verticalType: 'LAND', icon: '📐', description: 'Residential & commercial plots', commissionRate: 2.0 },
  { id: 'cat-electronics', name: 'Electronics & Phones', slug: 'electronics', verticalType: 'PRODUCT', icon: '📱', description: 'Smartphones, laptops & gadgets', commissionRate: 5.0 },
  { id: 'cat-services', name: 'Local Services & Trades', slug: 'services', verticalType: 'SERVICE', icon: '🛠️', description: 'Mechanics, repairs & technicians', commissionRate: 5.0 },
  { id: 'cat-wholesale', name: 'B2B Wholesale & Bulk', slug: 'wholesale', verticalType: 'WHOLESALE', icon: '🏭', description: 'Bulk cartons & wholesale goods', commissionRate: 3.0 },
  { id: 'cat-fashion', name: 'Fashion & Apparel', slug: 'fashion', verticalType: 'PRODUCT', icon: '👗', description: 'Somali attire, clothes & shoes', commissionRate: 5.0 },
  { id: 'cat-food', name: 'Food & Groceries', slug: 'food', verticalType: 'PRODUCT', icon: '🥬', description: 'Fresh foods & beverages', commissionRate: 2.0 },
];

export default function CreateListingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState<Category | null>(INITIAL_CATEGORIES[0]);

  // Core fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [condition, setCondition] = useState('NEW');
  const [isNegotiable, setIsNegotiable] = useState(true);

  // Africa-first location fields
  const [city, setCity] = useState('Garoowe');
  const [district, setDistrict] = useState('Hodan');
  const [landmark, setLandmark] = useState('');

  // Vertical dynamic attributes
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('2020');
  const [transmission, setTransmission] = useState('AUTOMATIC');
  const [fuelType, setFuelType] = useState('PETROL');
  const [mileageKm, setMileageKm] = useState('');

  const [propType, setPropType] = useState('APARTMENT');
  const [transactionType, setTransactionType] = useState('FOR_RENT');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('1');
  const [areaSqMeters, setAreaSqMeters] = useState('');

  const [serviceType, setServiceType] = useState('');
  const [pricingModel, setPricingModel] = useState('HOURLY');

  // Media
  const [imageUrl, setImageUrl] = useState('');
  const [mediaList, setMediaList] = useState<string[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch live categories from backend database
    api.getCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
          setSelectedCat(cats[0]);
        }
      })
      .catch(() => {
        // Fallback already initialized in state
      });
  }, []);

  const handleDeviceFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const fileArray = Array.from(files);
    let loaded = 0;
    const newImgs: string[] = [];

    fileArray.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Faylka "${file.name}" wuu ka weyn yahay 10MB.`);
        loaded++;
        if (loaded === fileArray.length) setUploadingFiles(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newImgs.push(reader.result as string);
        loaded++;
        if (loaded === fileArray.length) {
          setMediaList((prev) => [...prev, ...newImgs]);
          setUploadingFiles(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const addImage = () => {
    if (imageUrl.trim() && !mediaList.includes(imageUrl.trim())) {
      setMediaList([...mediaList, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setMediaList(mediaList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('hudisoft_token') : null;
    if (!token) {
      setError('Fadlan marka hore gal akoonkaaga (Login) si aad xayaysiis u dhigto.');
      setSubmitting(false);
      return;
    }

    if (!selectedCat) {
      setError('Fadlan dooro qeybta alaabta (Please select a category).');
      setSubmitting(false);
      return;
    }

    const payload: any = {
      title,
      description,
      price: parseFloat(price),
      currency,
      condition,
      isNegotiable,
      categoryId: selectedCat.id,
      city,
      district,
      landmark: landmark || undefined,
      mediaUrls: mediaList,
      media: mediaList.map((url, i) => ({ url, mediaType: 'IMAGE', sortOrder: i })),
    };

    if (selectedCat.verticalType === 'VEHICLE') {
      payload.vehicleDetails = {
        make: vehicleMake,
        model: vehicleModel,
        year: parseInt(vehicleYear, 10),
        transmission,
        fuelType,
        mileageKm: mileageKm ? parseInt(mileageKm, 10) : undefined,
      };
    } else if (selectedCat.verticalType === 'REAL_ESTATE') {
      payload.propertyDetails = {
        propertyType: propType,
        transactionType,
        bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms, 10) : undefined,
        areaSqMeters: areaSqMeters ? parseFloat(areaSqMeters) : undefined,
        furnished: false,
      };
    } else if (selectedCat.verticalType === 'SERVICE') {
      payload.serviceDetails = {
        serviceType: serviceType || title,
        pricingModel,
        serviceArea: city,
      };
    }

    try {
      const res = await api.createListing(payload, token);
      if (res.success && res.data) {
        router.push(`/listing/${res.data.slug}`);
      } else {
        setError(res.message || 'Xayaysiiska lama daabici karin. Hubi xogta aad gelisay.');
      }
    } catch {
      setError('Khalad baa dhacay marka server-ka lala xiriirayay. Fadlan hubi login-kaaga.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050c15] text-white">
      <Navbar />

      {/* Hero Header - Centered & Animated */}
      <section className="relative py-12 px-4 overflow-hidden hero-bg border-b border-white/5 flex flex-col items-center justify-center text-center">
        {/* Glow ambient spots */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Animated Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.25)] animate-pulse-glow">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>✨ SUUQA UGU WEYN SOOMAALIYA ✨</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="bg-gradient-to-r from-white via-slate-100 to-sky-300 bg-clip-text text-transparent">
              Post a Listing
            </span>{' '}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              (Dhig Xayaysiis)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
            Ka iibi kumanaan qof oo ku nool Garoowe, Puntland iyo dhammaan gobollada Soomaaliya daqiiqado gudahood!
          </p>

          {/* Quick Steps Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-4 mt-8 text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-[11px]">1</span>
              <span>Qeybta</span>
            </div>
            <span className="text-slate-600">➔</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-[11px]">2</span>
              <span>Faahfaahinta</span>
            </div>
            <span className="text-slate-600">➔</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-6 h-6 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-[11px]">3</span>
              <span>Goobta & Sawirrada</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Centered Form Container */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {error && (
          <div className="p-4 mb-6 rounded-2xl text-sm font-medium border flex items-center gap-3 animate-bounce shadow-lg"
            style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.4)', color: '#fca5a5' }}>
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ────────────────────────────────────────────────────────
              STEP 1: CATEGORY SELECTION (Rich Grid & Animations)
             ──────────────────────────────────────────────────────── */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1c33]/90 to-[#091222]/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="w-7 h-7 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-400/40 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Dooro Qeybta (Select Category)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Dooro nooca alaabta ama adeegga aad xayeysiinayso:</p>
              </div>
              {selectedCat && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {selectedCat.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((c) => {
                const isSelected = selectedCat?.id === c.id || selectedCat?.slug === c.slug;
                return (
                  <button
                    type="button"
                    key={c.id || c.slug}
                    onClick={() => setSelectedCat(c)}
                    className={`relative flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-300 group cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(12,143,226,0.5)] scale-[1.03] border-2 border-cyan-300 ring-4 ring-cyan-500/20'
                        : 'bg-gradient-to-br from-blue-950/40 to-slate-900/60 text-slate-300 border border-white/10 hover:border-cyan-400/40 hover:bg-blue-900/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10'
                    }`}
                  >
                    {/* Active checkmark pill */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-black flex items-center justify-center shadow-md">
                        ✓
                      </span>
                    )}

                    <span className="text-3xl mb-2 transition-transform group-hover:scale-125 duration-200">
                      {c.icon}
                    </span>
                    <span className="text-xs font-bold leading-snug line-clamp-1">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-200 mt-0.5 opacity-80 line-clamp-1">
                      {c.verticalType}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              STEP 2: LISTING DETAILS (Inputs & Price)
             ──────────────────────────────────────────────────────── */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1c33]/90 to-[#091222]/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-5">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="w-7 h-7 rounded-xl bg-cyan-600/30 text-cyan-400 border border-cyan-400/40 flex items-center justify-center text-xs font-bold">2</span>
              <span>Faahfaahinta Alaabta (Listing Details)</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Ciwaanka Alaabta (Title) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tusaale: Toyota Prado TX 2021 Garoowe / iPhone 15 Pro Max 256GB"
                className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Sharaxaadda & Faahfaahinta (Description) *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Qor xaaladda alaabta, astaamaha, sababta aad u iibinayso, damaanadda (warranty), iwm..."
                className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm resize-none font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Qiimaha (Price) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Lacagta (Currency)
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-bold cursor-pointer"
                >
                  <option value="USD">USD ($ - Dollar)</option>
                  <option value="SOS">SOS (Shilling Soomaali)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Xaaladda (Condition)
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all text-sm font-bold cursor-pointer"
                >
                  <option value="NEW">✨ Brand New (Cusub)</option>
                  <option value="LIKE_NEW">👌 Like New (Sida Cusub)</option>
                  <option value="USED_GOOD">👍 Used - Good (Wanaagsan)</option>
                  <option value="USED_FAIR">Fair (Dhexdhexaad)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-950/30 border border-white/5">
              <input
                type="checkbox"
                id="isNegotiable"
                checked={isNegotiable}
                onChange={(e) => setIsNegotiable(e.target.checked)}
                className="w-5 h-5 rounded-lg text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
              <label htmlFor="isNegotiable" className="text-sm font-medium text-white cursor-pointer select-none">
                Qiimaha waa la wada xaajoon karaa (Price is negotiable)
              </label>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              VERTICAL ATTRIBUTES: VEHICLE (Dynamic)
             ──────────────────────────────────────────────────────── */}
          {selectedCat?.verticalType === 'VEHICLE' && (
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1c33]/90 to-[#091222]/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>🚗</span> Faahfaahinta Gaariga (Vehicle Specs)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Make / Shirkadda *</label>
                  <input
                    type="text"
                    required
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Toyota, Hyundai, Nissan..."
                    className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Model-ka *</label>
                  <input
                    type="text"
                    required
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="Prado, Hilux, Elantra..."
                    className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sanadka *</label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    min="1990"
                    max="2030"
                    className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Gears / Transmission</label>
                  <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none">
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Shidaalka (Fuel)</label>
                  <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none">
                    <option value="PETROL">Petrol (Baasiin)</option>
                    <option value="DIESEL">Diesel (Naafto)</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Masaafada (Mileage km)</label>
                  <input
                    type="number"
                    value={mileageKm}
                    onChange={(e) => setMileageKm(e.target.value)}
                    placeholder="e.g. 75000"
                    className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              VERTICAL ATTRIBUTES: REAL ESTATE (Dynamic)
             ──────────────────────────────────────────────────────── */}
          {selectedCat?.verticalType === 'REAL_ESTATE' && (
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1c33]/90 to-[#091222]/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>🏢</span> Faahfaahinta Guriga / Dhismaha
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Nooca Dhismaha</label>
                  <select value={propType} onChange={(e) => setPropType(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none">
                    <option value="HOUSE">House / Villa</option>
                    <option value="APARTMENT">Apartment / Dabaq</option>
                    <option value="COMMERCIAL">Shop / Dukaan</option>
                    <option value="OFFICE">Office / Xafiis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Iib mise Kiro?</label>
                  <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none">
                    <option value="FOR_RENT">For Rent (Kiro)</option>
                    <option value="FOR_SALE">For Sale (Iib)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Qolalka Jiifka</label>
                  <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Suuliyada (Baths)</label>
                  <input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Baaxadda (Area m²)</label>
                  <input type="number" value={areaSqMeters} onChange={(e) => setAreaSqMeters(e.target.value)} placeholder="e.g. 250" className="w-full px-3.5 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white text-sm outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────
              STEP 3: AFRICA-FIRST LOCATION (Garoowe Landmarks)
             ──────────────────────────────────────────────────────── */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1c33]/90 to-[#091222]/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="w-7 h-7 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-400/40 flex items-center justify-center text-xs font-bold">3</span>
              <span>Goobta & Cinwaanka (Location & Landmark)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Maadaama lambarrada waddooyinka aan inta badan la isticmaalin, geli xaafadda iyo calaamad la garanayo (Landmark).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Magaalada (City) *</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-400">
                  <option value="Garoowe">Garoowe (Puntland)</option>
                  <option value="Bosaso">Bosaso (Puntland)</option>
                  <option value="Qardho">Qardho (Puntland)</option>
                  <option value="Galkayo">Galkayo (Mudug)</option>
                  <option value="Mogadishu">Muqdisho (Banaadir)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">Xaafadda (District)</label>
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white text-sm font-semibold outline-none focus:ring-2 focus:ring-cyan-400">
                  {GAROOWE_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Calaamad / Landmark (Dhabarka Dambe / Agagaarka) *
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Tusaale: Dhabarka Dambe ee Masjidka Al-Huda, Hoteel Rays agtiisa, Laamiga weyn..."
                className="w-full px-4 py-3.5 rounded-2xl bg-blue-950/60 border border-white/10 text-white placeholder-slate-500 text-sm outline-none focus:ring-2 focus:ring-cyan-400 transition-all font-medium"
              />
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              STEP 4: PHOTOS & MEDIA UPLOAD (Vibrant & Animated)
             ──────────────────────────────────────────────────────── */}
          <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#0e1c33]/90 to-[#091222]/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-400/40 flex items-center justify-center text-xs font-bold">4</span>
                <span>Sawirrada Alaabta (Photos & Media) *</span>
              </h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {mediaList.length} Sawir ayaa ku jira
              </span>
            </div>

            {/* Direct Device Upload Box */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDeviceFiles}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-950/20 group hover:shadow-[0_0_25px_rgba(6,182,212,0.2)]"
              style={{ borderColor: 'rgba(14,165,233,0.35)', background: 'rgba(14,165,233,0.03)' }}
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-125 duration-300 shadow-xl bg-gradient-to-br from-blue-500 via-cyan-400 to-indigo-600">
                📸
              </div>
              <div className="text-base font-black text-white mb-1">
                {uploadingFiles ? 'Soo rarayaa sawirrada...' : 'Riix halkan si aad sawirro uga soo geliso Taleefanka ama Computer-ka'}
              </div>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Waxaad soo xulan kartaa sawirro badan mar qura (Gallery ama Camera). PNG, JPG, WebP ilaa 10MB.
              </p>
            </div>

            {/* Optional URL input */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <span>🔗</span> Ama geli Link-ga Sawirka (Optional URL):
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-950/60 border border-white/10 text-white placeholder-slate-500 text-xs outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-5 py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md"
                >
                  Ku dar
                </button>
              </div>
            </div>

            {/* Preview Thumbnails */}
            {mediaList.length > 0 && (
              <div className="pt-3">
                <div className="text-xs font-bold text-slate-300 mb-2">Sawirrada la doortay:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mediaList.map((url, i) => (
                    <div key={i} className="relative rounded-2xl overflow-hidden aspect-square group border border-white/10 shadow-lg bg-black/60">
                      <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      {i === 0 && (
                        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-600 text-white shadow-md">
                          Sawirka Hore (Cover)
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                        title="Tir sawirkan"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────
              SUBMIT BUTTON (Glowing, Animated Gradient)
             ──────────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 rounded-2xl font-black text-white text-lg tracking-wide transition-all duration-300 shadow-[0_0_35px_rgba(14,165,233,0.45)] hover:shadow-[0_0_50px_rgba(14,165,233,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 cursor-pointer bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {submitting ? 'Daabacayaa Xayeysiiska...' : '🚀 Shaaci Xayaysiiska Hadda (Publish Listing)'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
