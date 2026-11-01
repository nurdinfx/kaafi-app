'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Listing } from '../../lib/api';
import { formatPrice } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

// WhatsApp order number
const WA_NUMBER = '252905288883';

function buildWhatsAppMessage(opts: {
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    selectedColor?: string;
    selectedSize?: string;
    storeName?: string;
  }>;
  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryDistrict: string;
  deliveryLandmark: string;
  fulfillmentType: string;
}): string {
  const fulfillmentLabel =
    opts.fulfillmentType === 'DRIVER_DELIVERY'
      ? 'Gaarsiin Toos ah (Driver)'
      : opts.fulfillmentType === 'CUSTOMER_PICKUP'
      ? 'Soo Qaadasho (Pickup)'
      : 'Iibiyaha Keenaya (Seller Delivery)';

  let text = `*DALAB CUSUB - DUKAAMIONLINE*\n\n`;
  text += `--------------------\n`;
  text += `*ALAABTA LA DALBADAY:*\n`;
  text += `--------------------\n`;

  opts.items.forEach((item, i) => {
    text += `${i + 1}. *${item.title}*\n`;
    text += `   - Cadadka: ${item.quantity} xabbo\n`;
    text += `   - Qiimaha: $${(item.price * item.quantity).toFixed(2)}`;
    if (item.selectedColor) text += ` | Midab: ${item.selectedColor}`;
    if (item.selectedSize) text += ` | Cabbir: ${item.selectedSize}`;
    if (item.storeName) text += ` (Store: ${item.storeName})`;
    text += `\n`;
  });

  text += `--------------------\n`;
  text += `*LACAGTA:*\n`;
  text += `Qiimaha Alaabta: $${opts.subtotal.toFixed(2)}\n`;
  if (opts.discountAmount && opts.discountAmount > 0) {
    text += `Qiimo Dhimis (${opts.discountCode}): -$${opts.discountAmount.toFixed(2)}\n`;
    const afterDiscount = Math.max(0, opts.subtotal - opts.discountAmount);
    text += `*Wadarta Alaabta: $${afterDiscount.toFixed(2)}*\n`;
  } else {
    text += `*Wadarta Alaabta: $${opts.subtotal.toFixed(2)}*\n`;
  }
  text += `Gaarsiinta: Waxaa lagu heshiinayaa wicitaanka\n`;

  text += `--------------------\n`;
  text += `*MACMIILKA:*\n`;
  text += `Magaca: ${opts.customerName || '(Lama bixin)'}\n`;
  text += `Taleefanka: ${opts.customerPhone}\n`;

  text += `--------------------\n`;
  text += `*CINWAANKA GAARSIINTA:*\n`;
  text += `Magaalada: ${opts.deliveryCity}\n`;
  if (opts.deliveryDistrict) text += `Xaafadda: ${opts.deliveryDistrict}\n`;
  if (opts.deliveryLandmark) text += `Calaamadda: ${opts.deliveryLandmark}\n`;
  text += `Habka: ${fulfillmentLabel}\n`;

  text += `--------------------\n`;
  text += `*LACAG BIXINTA:*\n`;
  text += `EVC Plus / Sahal / ZAAD / eDahab\n`;
  text += `(Fadlan waxaad lacagta ku soo dirtaa lambarka shaqaaluhu kuusheegaan markay ku soo wacaan)\n\n`;
  text += `Fadlan ii xaqiiji dalabkayga. Mahadsanidiin!`;

  return text;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const qtyParam = parseInt(searchParams.get('qty') || '1', 10);
  const { t, isRTL, dir } = useLanguage();

  const {
    items: cartItems,
    subtotal: cartSubtotal,
    discountAmount,
    discountCode,
    finalTotal: cartFinalTotal,
    clearCart,
  } = useCart();

  const [listing, setListing] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState(qtyParam > 0 ? qtyParam : 1);
  const [loading, setLoading] = useState(!!listingId);
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+252');
  const [fulfillmentType, setFulfillmentType] = useState<
    'CUSTOMER_PICKUP' | 'DRIVER_DELIVERY' | 'SELLER_DELIVERY'
  >('DRIVER_DELIVERY');
  const [deliveryCity, setDeliveryCity] = useState('Garoowe');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hudisoft_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.phoneNumber) setCustomerPhone(u.phoneNumber);
        if (u.name || u.fullName) setCustomerName(u.name || u.fullName);
      }
    } catch {}

    if (listingId) {
      loadListing(listingId);
    } else {
      setLoading(false);
      if (cartItems.length === 0) {
        setError(t('cart_empty_title', 'Shantada waxba kuma jiraan. Fadlan wax ka dooro suuqa.'));
      }
    }
  }, [listingId]);

  const loadListing = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getListings({ limit: 50 });
      const found = res.data.find((item) => item.id === id);
      if (found) {
        setListing(found);
      } else {
        setError('Alaabta lama helin ama waa laga saaray suuqa.');
      }
    } catch {
      setError('Khalad baa dhacay marka alaabta la soo kicinayay.');
    } finally {
      setLoading(false);
    }
  };

  const buildOrderItems = () => {
    if (listing) {
      return [{ title: listing.title, quantity, price: listing.price }];
    }
    return cartItems.map((i) => ({
      title: i.title,
      quantity: i.quantity,
      price: i.price,
      selectedColor: i.selectedColor,
      selectedSize: i.selectedSize,
      storeName: i.storeName,
    }));
  };

  const handleWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const items = buildOrderItems();
    if (items.length === 0) {
      setError('Wax alaab ah lama dooran.');
      return;
    }

    const subtotal = listing
      ? (listing.price || 0) * quantity
      : cartFinalTotal;

    const message = buildWhatsAppMessage({
      items,
      subtotal,
      discountCode,
      discountAmount: listing ? 0 : discountAmount,
      customerName,
      customerPhone,
      deliveryCity,
      deliveryDistrict,
      deliveryLandmark,
      fulfillmentType,
    });

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');

    if (!listing) {
      clearCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto w-full p-8 space-y-4">
          <div className="h-10 bg-blue-900/20 rounded-xl animate-pulse" />
          <div className="h-72 bg-blue-900/10 rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  const isCartMode = !listing;
  const displaySubtotal = isCartMode ? cartSubtotal : (listing?.price || 0) * quantity;
  const displayFinalTotal = isCartMode ? cartFinalTotal : (listing?.price || 0) * quantity;

  return (
    <div dir={dir} className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href={listing?.slug ? `/listing/${listing.slug}` : '/listings'}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {t('checkout_back')}
          </Link>
          <h1
            className="text-2xl sm:text-3xl font-black text-white mt-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {t('checkout_title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
            {t('checkout_subtitle')}
          </p>
        </div>

        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(37,211,102,0.10)', border: '1px solid rgba(37,211,102,0.25)' }}
        >
          <span className="text-2xl flex-shrink-0">💬</span>
          <div>
            <p className="text-sm font-bold text-emerald-300">{t('checkout_notice_title')}</p>
            <p className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
              {t('checkout_notice_desc')}
            </p>
          </div>
        </div>

        {error && (
          <div
            className="p-4 rounded-xl mb-6 text-sm text-rose-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleWhatsAppOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Fulfillment */}
              <div className="glass-card p-6">
                <h2
                  className="text-base font-bold text-white mb-4"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {t('checkout_step1_title')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'DRIVER_DELIVERY',
                      title: t('checkout_opt_driver'),
                      subtitle: t('checkout_opt_driver_sub'),
                    },
                    {
                      id: 'CUSTOMER_PICKUP',
                      title: t('checkout_opt_pickup'),
                      subtitle: t('checkout_opt_pickup_sub'),
                    },
                    {
                      id: 'SELLER_DELIVERY',
                      title: t('checkout_opt_seller'),
                      subtitle: t('checkout_opt_seller_sub'),
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setFulfillmentType(opt.id as any)}
                      className="p-3.5 rounded-xl border cursor-pointer transition-all"
                      style={{
                        background:
                          fulfillmentType === opt.id
                            ? 'rgba(12, 143, 226, 0.15)'
                            : 'rgba(15, 32, 64, 0.4)',
                        borderColor:
                          fulfillmentType === opt.id ? '#0c8fe2' : 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="text-sm font-bold text-white mb-1">{opt.title}</div>
                      <div className="text-xs" style={{ color: '#94b4d0' }}>
                        {opt.subtitle}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Contact Details */}
              <div className="glass-card p-6">
                <h2
                  className="text-base font-bold text-white mb-4"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {t('checkout_step2_title')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">
                      {t('checkout_label_name')}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Magacaaga oo buuxa"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">
                      {t('checkout_label_phone')}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+25290xxxxxxx"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">
                      {t('checkout_label_city')}
                    </label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none"
                    >
                      <option value="Garoowe">Garoowe (Puntland)</option>
                      <option value="Bosaso">Bosaso (Puntland)</option>
                      <option value="Qardho">Qardho (Puntland)</option>
                      <option value="Mogadishu">Muqdisho (Banaadir)</option>
                      <option value="Hargeisa">Hargeysa (Somaliland)</option>
                      <option value="Kismaayo">Kismaayo (Jubbada)</option>
                      <option value="Baydhabo">Baydhabo (Koonfur Galbeed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">
                      {t('checkout_label_district')}
                    </label>
                    <input
                      type="text"
                      value={deliveryDistrict}
                      onChange={(e) => setDeliveryDistrict(e.target.value)}
                      placeholder="e.g. Hodan, Waaberi, Israac"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-blue-300 block mb-1">
                      {t('checkout_label_landmark')}
                    </label>
                    <input
                      type="text"
                      value={deliveryLandmark}
                      onChange={(e) => setDeliveryLandmark(e.target.value)}
                      placeholder="e.g. Ka soo horjeedka Masjidka, Laamiga agtiisa"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment instructions */}
              <div className="glass-card p-6">
                <h2
                  className="text-base font-bold text-white mb-3"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {t('checkout_step3_title')}
                </h2>
                <div
                  className="rounded-xl p-4 space-y-2"
                  style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t('checkout_payment_note')}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 pb-1">
                    <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-lg text-xs font-bold border border-blue-700/30">📱 EVC Plus</span>
                    <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-lg text-xs font-bold border border-blue-700/30">💰 SAHAL</span>
                    <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-lg text-xs font-bold border border-blue-700/30">💳 ZAAD</span>
                    <span className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-lg text-xs font-bold border border-blue-700/30">💵 eDahab</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-medium pt-2">
                    {t('checkout_payment_call_note')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: Summary */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3
                  className="text-base font-bold text-white mb-4"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {t('checkout_summary_title')}
                </h3>

                {listing && (
                  <div
                    className="flex gap-3 pb-4 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                      style={{
                        background: 'rgba(15,32,64,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      📦
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{listing.title}</h4>
                      <div className="text-xs text-blue-400 mt-0.5">
                        {formatPrice(listing.price, listing.currency)} x {quantity}
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-1">
                        Stock: {listing.inventoryCount}
                      </div>
                    </div>
                  </div>
                )}

                {listing && (
                  <div
                    className="flex items-center justify-between py-3 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <span className="text-xs text-slate-300 font-medium">{t('checkout_qty_label')}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-7 h-7 rounded-lg bg-blue-950/80 border border-white/10 text-white font-bold flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-white px-2">{quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(Math.min(listing?.inventoryCount || 99, quantity + 1))
                        }
                        className="w-7 h-7 rounded-lg bg-blue-950/80 border border-white/10 text-white font-bold flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {isCartMode && cartItems.length > 0 && (
                  <div
                    className="space-y-2 pb-4 border-b"
                    style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[65%]">
                          {item.title}{' '}
                          <span className="text-blue-400">x{item.quantity}</span>
                        </span>
                        <span className="text-white font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div
                  className="space-y-2 py-4 border-b text-xs"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div className="flex justify-between" style={{ color: '#94b4d0' }}>
                    <span>{t('checkout_subtotal_label')}</span>
                    <span className="font-semibold text-white">
                      ${displaySubtotal.toFixed(2)}
                    </span>
                  </div>
                  {isCartMode && discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>{t('checkout_discount_label')} ({discountCode}):</span>
                      <span className="font-semibold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 mb-6">
                  <span className="text-sm font-bold text-white">{t('checkout_total_label')}</span>
                  <span
                    className="text-xl font-black text-emerald-400"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    ${displayFinalTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                  }}
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.083-2.121-.508-1.74-.723-2.883-2.483-2.971-2.6-.088-.117-.71-1.002-.71-1.914 0-.912.478-1.36.648-1.543.17-.183.371-.228.495-.228.125 0 .25.002.359.006.115.006.269-.044.421.322.156.376.533 1.303.58 1.398.047.095.078.207.016.332-.063.125-.094.204-.187.314-.094.11-.198.246-.282.33-.094.094-.192.197-.082.386.11.189.489.807 1.05 1.306.724.644 1.334.843 1.523.937.189.094.3.08.411-.048.112-.128.477-.557.604-.748.127-.191.254-.159.427-.095.174.064 1.1.518 1.29.613.19.095.317.143.364.223.048.08.048.463-.096.868zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.982-1.393A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.143a8.106 8.106 0 01-4.223-1.182l-.303-.18-3.053.854.819-2.991-.197-.319A8.104 8.104 0 1112 20.143z" />
                  </svg>
                  {t('checkout_btn_submit')} (${displayFinalTotal.toFixed(2)})
                </button>

                <div
                  className="flex items-center gap-2 justify-center mt-3 text-[11px]"
                  style={{ color: '#6287a2' }}
                >
                  <span>{t('checkout_footer_note')}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center text-white"
          style={{ background: '#050c15' }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
