'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { api, Transaction } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [tx, setTx] = useState<Transaction | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dispute modal state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('DAMAGED_ITEM');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');

  // Payment modal state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payProvider, setPayProvider] = useState('EVC_PLUS');
  const [payPhone, setPayPhone] = useState('+252');

  useEffect(() => {
    const savedToken = localStorage.getItem('hudisoft_token');
    const storedUser = localStorage.getItem('hudisoft_user');

    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch {}
    }

    if (id) {
      loadOrder(id, savedToken);
    }
  }, [id, router]);

  const loadOrder = async (orderId: string, authToken: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTransaction(orderId, authToken);
      if (data) {
        setTx(data);
      } else {
        setError('Dalabka lama helin (Order not found).');
      }
    } catch {
      setError('Khalad baa dhacay marka dalabka la keenayay.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (toStatus: string, notes?: string) => {
    if (!token || !tx) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.updateTransactionStatus(tx.id, toStatus, token, notes);
      if (res.success) {
        setSuccessMsg(`Status updated to ${toStatus}!`);
        await loadOrder(tx.id, token);
      } else {
        setError(res.message || 'Failed to update order status.');
      }
    } catch {
      setError('Khalad baa dhacay marka xaaladda la bedelayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayNow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !tx) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await api.initiatePayment(
        {
          transactionId: tx.id,
          provider: payProvider,
          payerPhone: payPhone,
          amount: tx.totalAmount,
          currency: tx.currency,
        },
        token
      );

      if (res.success) {
        setShowPayModal(false);
        setSuccessMsg('Lacag-bixinta waa la bilaabay! Fadlan xaqiiji mobile-kaaga.');
        await loadOrder(tx.id, token);
      } else {
        setError(res.message || 'Payment initiation failed.');
      }
    } catch {
      setError('Khalad baa dhacay marka lacag-bixinta la dirayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !tx) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await api.openDispute(
        {
          transactionId: tx.id,
          reason: disputeReason,
          details: disputeDetails,
          evidenceUrl: disputeEvidence || undefined,
        },
        token
      );

      if (res.success) {
        setShowDisputeModal(false);
        setSuccessMsg('Khilaafka waa la furay (Dispute submitted for arbitration).');
        await loadOrder(tx.id, token);
      } else {
        setError(res.message || 'Failed to open dispute.');
      }
    } catch {
      setError('Khalad baa dhacay marka khilaafka la diiwaangelinayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const isBuyer = tx && currentUser && tx.buyerId === currentUser.id;
  const isSeller = tx && currentUser && tx.items?.some((i) => i.sellerId === currentUser.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)', label: 'Dhamaaday (Completed)' };
      case 'PAYMENT_CONFIRMED':
      case 'ACCEPTED':
      case 'PREPARING':
      case 'READY':
        return { bg: 'rgba(12,143,226,0.15)', text: '#38bdf8', border: 'rgba(12,143,226,0.3)', label: status };
      case 'IN_TRANSIT':
      case 'ASSIGNED':
      case 'PICKED_UP':
        return { bg: 'rgba(168,85,247,0.15)', text: '#c084fc', border: 'rgba(168,85,247,0.3)', label: 'Jidka ku jira (In Transit)' };
      case 'DELIVERED':
        return { bg: 'rgba(20,184,166,0.15)', text: '#2dd4bf', border: 'rgba(20,184,166,0.3)', label: 'La Keenay (Delivered)' };
      case 'DISPUTED':
        return { bg: 'rgba(239,68,68,0.15)', text: '#f87171', border: 'rgba(239,68,68,0.3)', label: 'Khilaaf (Disputed)' };
      case 'CANCELLED':
      case 'REFUNDED':
        return { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)', label: status };
      default:
        return { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', border: 'rgba(249,115,22,0.3)', label: status };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto w-full p-8 space-y-4">
          <div className="h-10 bg-blue-900/20 rounded-xl animate-pulse" />
          <div className="h-64 bg-blue-900/10 rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !tx) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
        <Navbar />
        <div className="max-w-md mx-auto w-full p-8 text-center my-auto">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">{error}</h2>
          <Link href="/orders" className="btn-primary inline-flex text-sm mt-4">
            Ku noqo Dalabyada (Back to Orders)
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const badge = getStatusBadge(tx?.status || '');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#94b4d0' }}>
          <Link href="/orders" className="hover:text-white transition-colors">
            Dalabyada (Orders)
          </Link>
          <span>/</span>
          <span className="text-white font-mono">{tx?.transactionNumber}</span>
        </div>

        {/* Banner Alert Messages */}
        {error && (
          <div
            className="p-4 rounded-xl mb-6 text-sm text-rose-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div
            className="p-4 rounded-xl mb-6 text-sm text-emerald-300"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            ✓ {successMsg}
          </div>
        )}

        {/* Order Header Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5"
               style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white font-mono">{tx?.transactionNumber}</h1>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: '#94b4d0' }}>
                La dalbaday: {new Date(tx?.createdAt || '').toLocaleString()} · Nooca: {tx?.fulfillmentType}
              </p>
            </div>

            {/* Contextual Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Buyer Actions */}
              {isBuyer && tx?.status === 'PENDING_PAYMENT' && (
                <button
                  onClick={() => setShowPayModal(true)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  💳 Bixi Hadda (Pay {formatPrice(tx.totalAmount, tx.currency)})
                </button>
              )}

              {isBuyer && (tx?.status === 'DELIVERED' || tx?.status === 'IN_TRANSIT') && (
                <button
                  onClick={() => handleUpdateStatus('COMPLETED', 'Buyer confirmed receipt of goods')}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                >
                  ✓ Xaqiiji Helidda (Confirm Receipt)
                </button>
              )}

              {/* Seller Actions */}
              {isSeller && tx?.status === 'PAYMENT_CONFIRMED' && (
                <button
                  onClick={() => handleUpdateStatus('ACCEPTED', 'Seller accepted the order')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#0c8fe2' }}
                >
                  Aqbal Dalabka (Accept)
                </button>
              )}

              {isSeller && tx?.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleUpdateStatus('PREPARING', 'Merchant is preparing the package')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#3b82f6' }}
                >
                  Bilaab Diyaarinta (Prepare)
                </button>
              )}

              {isSeller && tx?.status === 'PREPARING' && (
                <button
                  onClick={() => handleUpdateStatus('READY', 'Order is packed and ready')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#10b981' }}
                >
                  Diyaar u ah Qaadista (Ready)
                </button>
              )}

              {/* Dispute Button */}
              {tx?.status !== 'CANCELLED' && tx?.status !== 'REFUNDED' && tx?.status !== 'DISPUTED' && (
                <button
                  onClick={() => setShowDisputeModal(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 border transition-all"
                  style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)' }}
                >
                  ⚠️ Fur Khilaaf (Dispute)
                </button>
              )}
            </div>
          </div>

          {/* Delivery PIN Highlight Card (for driver handoff) */}
          {tx?.deliveryJob && (
            <div
              className="mt-5 p-4 rounded-xl flex items-center justify-between gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(12,143,226,0.15), rgba(99,102,241,0.1))',
                border: '1px solid rgba(12,143,226,0.3)',
              }}
            >
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Proof of Delivery PIN (Siinta Darawalka)
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
                  Sii lambarkan darawalka markaad alaabta gacanta ku dhigto si howshu u xidhanto.
                </div>
              </div>
              <div className="text-2xl font-black font-mono tracking-widest text-white px-4 py-2 rounded-lg bg-black/40 border border-blue-500/30">
                {tx.deliveryJob.deliveryPin || '****'}
              </div>
            </div>
          )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Items Purchased */}
          <div className="md:col-span-2 glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Alaabta Dalabka (Order Items)
            </h3>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {tx?.items?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl font-bold"
                      style={{ background: 'rgba(15,32,64,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      📦
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={item.listing?.slug ? `/listing/${item.listing.slug}` : '#'}
                        className="font-semibold text-sm text-white hover:text-blue-400 truncate block"
                      >
                        {item.listing?.title || 'Marketplace Item'}
                      </Link>
                      <div className="text-xs" style={{ color: '#94b4d0' }}>
                        Qty: {item.quantity} × {formatPrice(item.unitPrice, item.currency)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white flex-shrink-0">
                    {formatPrice(item.totalPrice, item.currency)}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Summary Breakdown */}
            <div className="border-t mt-4 pt-4 space-y-2 text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex justify-between" style={{ color: '#94b4d0' }}>
                <span>Wadarta Alaabta (Subtotal):</span>
                <span className="font-semibold text-white">{formatPrice(tx?.subtotalAmount || 0, tx?.currency)}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#94b4d0' }}>
                <span>Kharashka Gaadiidka (Delivery Fee):</span>
                <span className="font-semibold text-white">{formatPrice(tx?.deliveryFee || 0, tx?.currency)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t text-white" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span>Wadarta Guud (Total Amount):</span>
                <span className="text-emerald-400">{formatPrice(tx?.totalAmount || 0, tx?.currency)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Contact Information */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Gaarsiinta (Delivery)
            </h3>

            <div>
              <div className="text-xs font-semibold text-blue-300">Magaalada & Goobta</div>
              <div className="text-sm text-white font-medium">
                {tx?.deliveryCity || 'Garoowe'}
                {tx?.deliveryDistrict ? `, ${tx.deliveryDistrict}` : ''}
              </div>
              {tx?.deliveryLandmark && (
                <div className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
                  Landmark: {tx.deliveryLandmark}
                </div>
              )}
            </div>

            <div>
              <div className="text-xs font-semibold text-blue-300">Taleefanka Qaataha</div>
              <div className="text-sm text-white font-mono">
                {tx?.recipientPhone || 'Lama cayimin'}
              </div>
            </div>

            {tx?.deliveryJob && (
              <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="text-xs font-semibold text-blue-300">Darawalka (Driver)</div>
                <div className="text-sm text-white">
                  {tx.deliveryJob.driver?.user?.fullName || 'Searching for driver...'}
                </div>
                {tx.deliveryJob.driver?.user?.phoneNumber && (
                  <div className="text-xs font-mono text-emerald-400 mt-0.5">
                    📞 {tx.deliveryJob.driver.user.phoneNumber}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status History Timeline */}
        {tx?.statusHistory && tx.statusHistory.length > 0 && (
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Taariikhda Dalabka (Order Timeline)
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-blue-900/40">
              {tx.statusHistory.map((step, idx) => (
                <div key={step.id || idx} className="relative pl-8 flex items-start justify-between gap-4">
                  <div className="absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#050c15]" />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {step.toStatus}
                    </div>
                    {step.notes && (
                      <div className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
                        {step.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                    {new Date(step.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full relative" style={{ background: '#091524' }}>
            <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Bixi Dalabka #{tx?.transactionNumber}
            </h3>

            <form onSubmit={handlePayNow} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">
                  Dooro Habka Lacag-bixinta
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['EVC_PLUS', 'ZAAD', 'SAHAL'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPayProvider(p)}
                      className="py-2.5 text-xs font-bold rounded-xl border transition-all"
                      style={{
                        background: payProvider === p ? 'rgba(12,143,226,0.2)' : 'rgba(15,32,64,0.6)',
                        color: payProvider === p ? '#38bdf8' : '#94b4d0',
                        border: payProvider === p ? '1px solid #0c8fe2' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {p.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">
                  Lambarka Mobile Money
                </label>
                <input
                  type="text"
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  placeholder="+25261XXXXXXX"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white bg-blue-950/40 border border-white/10 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-900/20 text-xs text-blue-200">
                Wadarta: <span className="font-bold text-white">{formatPrice(tx?.totalAmount || 0, tx?.currency)}</span>. Waxaa taleefankaaga ku imaan doona codsi xaqiijin PIN ah.
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {actionLoading ? 'Dirayaa...' : 'Xaqiiji & Bixi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full relative" style={{ background: '#091524' }}>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Fur Khilaaf (Open Dispute)
            </h3>
            <p className="text-xs mb-4" style={{ color: '#94b4d0' }}>
              Haddii alaabtu aysan ahayn sidii lagu heshiiyay ama ay ciladaysan tahay, kooxda Fududeeye waxay dhex-dhexaadin doontaa labada dhinac.
            </p>

            <form onSubmit={handleOpenDispute} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Sababta Khilaafka</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                >
                  <option value="DAMAGED_ITEM">Alaabtu waa burbursan tahay (Damaged item)</option>
                  <option value="WRONG_ITEM">Alaab qaldan baa la keenay (Wrong item)</option>
                  <option value="NOT_AS_DESCRIBED">Uma eka sidii lagu xayeysiiyay (Not as described)</option>
                  <option value="NOT_RECEIVED">Lama helin gebi ahaanba (Not received)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Faahfaahinta</label>
                <textarea
                  rows={3}
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  placeholder="Sharax waxa dhacay si faahfaahsan..."
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Sawir/Caddayn URL (Optional)</label>
                <input
                  type="url"
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Jooji
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
                >
                  {actionLoading ? 'Gudbinayaa...' : 'Gudbi Khilaafka'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
