'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Listing, Wallet } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  const qtyParam = parseInt(searchParams.get('qty') || '1', 10);

  const [listing, setListing] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState(qtyParam > 0 ? qtyParam : 1);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [fulfillmentType, setFulfillmentType] = useState<'CUSTOMER_PICKUP' | 'DRIVER_DELIVERY' | 'SELLER_DELIVERY'>('DRIVER_DELIVERY');
  const [deliveryCity, setDeliveryCity] = useState('Garoowe');
  const [deliveryDistrict, setDeliveryDistrict] = useState('');
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('+252');

  const [paymentProvider, setPaymentProvider] = useState<'EVC_PLUS' | 'ZAAD' | 'SAHAL' | 'WALLET'>('EVC_PLUS');
  const [payerPhone, setPayerPhone] = useState('+252');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('hudisoft_token');
    const storedUser = localStorage.getItem('hudisoft_user');

    if (!savedToken) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setToken(savedToken);
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        if (u.phoneNumber) {
          setRecipientPhone(u.phoneNumber);
          setPayerPhone(u.phoneNumber);
        }
      } catch {}
    }

    api.getMyWallet(savedToken).then(setWallet);

    if (listingId) {
      loadListing(listingId);
    } else {
      setLoading(false);
      setError('Alaab lama dooran (No listing selected for checkout).');
    }
  }, [listingId, router]);

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

  const deliveryFee = fulfillmentType === 'DRIVER_DELIVERY' ? 2.5 : 0.0;
  const subtotal = (listing?.price || 0) * quantity;
  const totalAmount = subtotal + deliveryFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !listing) return;

    if (quantity > listing.inventoryCount) {
      setError(`Tirada aad rabto (${quantity}) way ka badan tahay xaddiga keydka yaalla (${listing.inventoryCount}).`);
      return;
    }

    if (paymentProvider === 'WALLET' && (wallet?.balance || 0) < totalAmount) {
      setError(`Haraagaaga jeebka (${formatPrice(wallet?.balance || 0)}) kuma filna dalabkan ($${totalAmount}).`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Create Transaction in Backend
      const txRes = await api.createTransaction(
        {
          items: [
            {
              listingId: listing.id,
              quantity,
            },
          ],
          fulfillmentType,
          deliveryCity,
          deliveryDistrict: deliveryDistrict || undefined,
          deliveryLandmark: deliveryLandmark || undefined,
          recipientPhone,
        },
        token
      );

      if (!txRes.success || !txRes.data) {
        setError(txRes.message || 'Dalabka lama abuuri karin.');
        setSubmitting(false);
        return;
      }

      const createdTx = txRes.data;

      // 2. Initiate Payment (Mobile Money or Wallet)
      const payRes = await api.initiatePayment(
        {
          transactionId: createdTx.id,
          provider: paymentProvider,
          payerPhone: paymentProvider === 'WALLET' ? undefined : payerPhone,
          amount: totalAmount,
          currency: listing.currency,
        },
        token
      );

      if (payRes.success) {
        // Redirect to order detail page
        router.push(`/orders/${createdTx.id}`);
      } else {
        // Transaction created, but payment needs follow up
        router.push(`/orders/${createdTx.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Khalad lama filaan ah ayaa dhacay.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link href={listing?.slug ? `/listing/${listing.slug}` : '/listings'} className="text-xs text-blue-400 hover:text-blue-300">
            ← Ku noqo Alaabta (Back)
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Dhameystirka Dalabka (Checkout)
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
            Si nabad ah ugu bixi mobile money ama jeebkaaga Fududeeye
          </p>
        </div>

        {error && (
          <div
            className="p-4 rounded-xl mb-6 text-sm text-rose-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Fulfillment & Payment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Fulfillment Type */}
              <div className="glass-card p-6">
                <h2 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  1. Habka Gaarsiinta (Fulfillment)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'DRIVER_DELIVERY',
                      title: '🚚 Gaarsiin Toos ah',
                      subtitle: 'Darawal baa kuugu keenaya goobtaada ($2.50 fee)',
                    },
                    {
                      id: 'CUSTOMER_PICKUP',
                      title: '🏪 Soo Qaadasho',
                      subtitle: 'Dukaanka/Iibiyaha ka doon ($0.00)',
                    },
                    {
                      id: 'SELLER_DELIVERY',
                      title: '📦 Iibiyaha Keenaya',
                      subtitle: 'Heshiis toos ah oo iibiyaha ah ($0.00)',
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

              {/* Step 2: Address & Contact */}
              <div className="glass-card p-6">
                <h2 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  2. Cinwaanka & Taleefanka (Delivery Details)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">Magaalada (City)</label>
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
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">Xaafadda / District</label>
                    <input
                      type="text"
                      value={deliveryDistrict}
                      onChange={(e) => setDeliveryDistrict(e.target.value)}
                      placeholder="e.g. Hodan, Waaberi, Israac"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">Calaamad / Landmark</label>
                    <input
                      type="text"
                      value={deliveryLandmark}
                      onChange={(e) => setDeliveryLandmark(e.target.value)}
                      placeholder="e.g. Hotelka gadaashiisa, Laamiga dhinaciisa"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">Taleefanka Qaataha</label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+25261XXXXXXX"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="glass-card p-6">
                <h2 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  3. Habka Lacag-bixinta (Payment Method)
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {[
                    { id: 'EVC_PLUS', label: 'EVC Plus', desc: 'Hormuud' },
                    { id: 'ZAAD', label: 'ZAAD', desc: 'Telesom' },
                    { id: 'SAHAL', label: 'SAHAL', desc: 'Golis' },
                    {
                      id: 'WALLET',
                      label: 'Fududeeye Wallet',
                      desc: wallet ? `$${wallet.balance.toFixed(2)}` : '$0.00',
                    },
                  ].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPaymentProvider(p.id as any)}
                      className="p-3 rounded-xl border cursor-pointer text-center transition-all"
                      style={{
                        background:
                          paymentProvider === p.id
                            ? 'rgba(12, 143, 226, 0.2)'
                            : 'rgba(15, 32, 64, 0.4)',
                        borderColor:
                          paymentProvider === p.id ? '#0c8fe2' : 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="text-sm font-bold text-white">{p.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#94b4d0' }}>
                        {p.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {paymentProvider !== 'WALLET' && (
                  <div>
                    <label className="text-xs font-semibold text-blue-300 block mb-1">
                      Lambarka Mobile Money ee lacagta laga jarayo
                    </label>
                    <input
                      type="tel"
                      value={payerPhone}
                      onChange={(e) => setPayerPhone(e.target.value)}
                      placeholder="+25261XXXXXXX"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/60 border border-white/10 outline-none font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Order Summary & Pay Button */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Dulmar Guud (Order Summary)
                </h3>

                {listing && (
                  <div className="flex gap-3 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl font-bold"
                      style={{ background: 'rgba(15,32,64,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      📦
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{listing.title}</h4>
                      <div className="text-xs text-blue-400 mt-0.5">
                        {formatPrice(listing.price, listing.currency)} x {quantity}
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-1">
                        Stock yaalla: {listing.inventoryCount} xabbo
                      </div>
                    </div>
                  </div>
                )}

                {/* Quantity adjuster */}
                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-xs text-slate-300 font-medium">Tirada (Quantity):</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-blue-950/80 border border-white/10 text-white font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-white px-2">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(listing?.inventoryCount || 99, quantity + 1))}
                      className="w-7 h-7 rounded-lg bg-blue-950/80 border border-white/10 text-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Cost lines */}
                <div className="space-y-2 py-4 border-b text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex justify-between" style={{ color: '#94b4d0' }}>
                    <span>Qiimaha Alaabta (Subtotal):</span>
                    <span className="font-semibold text-white">{formatPrice(subtotal, listing?.currency)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: '#94b4d0' }}>
                    <span>Gaarsiinta (Delivery fee):</span>
                    <span className="font-semibold text-white">{formatPrice(deliveryFee, listing?.currency)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 mb-6">
                  <span className="text-sm font-bold text-white">Wadarta Guud:</span>
                  <span className="text-xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatPrice(totalAmount, listing?.currency)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                  }}
                >
                  {submitting ? 'Dalabka waa la dirayaa...' : `Xaqiiji & Bixi (${formatPrice(totalAmount, listing?.currency)})`}
                </button>

                <div className="flex items-center gap-2 justify-center mt-3 text-[11px]" style={{ color: '#6287a2' }}>
                  <span>🔒 Escrow Protected & Verified</span>
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
        <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#050c15' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
