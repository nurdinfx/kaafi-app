'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { formatPrice, timeAgo } from '../../../lib/utils';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    fetch(`${apiUrl}/requests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRequest(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmittingOffer(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('hudisoft_token') : null;
    if (!token) {
      setError('Please login as a seller to submit an offer.');
      setSubmittingOffer(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/offers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: id,
          offeredPrice: parseFloat(offerPrice),
          currency: request?.currency || 'USD',
          notes: offerMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOfferSuccess(true);
      } else {
        setError(data.message || 'Failed to submit offer.');
      }
    } catch {
      setError('Network error submitting offer.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <main>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#94b4d0' }}>
          <Link href="/" className="hover:text-blue-300">Home</Link>
          <span>/</span>
          <Link href="/requests" className="hover:text-blue-300">Buyer Requests</Link>
          <span>/</span>
          <span className="text-white truncate">{request?.title || 'Request'}</span>
        </div>

        {loading ? (
          <div className="glass-card p-8 skeleton h-64" />
        ) : !request ? (
          <div className="glass-card p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Request Not Found</h2>
            <p className="text-sm" style={{ color: '#94b4d0' }}>This buyer request may have been fulfilled or closed.</p>
            <Link href="/requests" className="btn-primary mt-4 inline-flex text-xs">Browse All Requests</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge-category">{request.category?.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}>
                    {request.urgency}
                  </span>
                  <span className="text-xs" style={{ color: '#94b4d0' }}>{timeAgo(request.createdAt)}</span>
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">
                  {request.title}
                </h1>

                <p className="text-sm leading-relaxed whitespace-pre-line mb-6" style={{ color: '#94b4d0' }}>
                  {request.description}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div>
                    <div className="text-xs" style={{ color: '#94b4d0' }}>Buyer Location</div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      📍 {request.city} {request.landmark ? `(${request.landmark})` : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: '#94b4d0' }}>Desired Quantity</div>
                    <div className="text-sm font-semibold text-white mt-0.5">
                      {request.quantity} unit(s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Received Offers list */}
              <div className="glass-card p-6">
                <h2 className="text-base font-bold text-white mb-3">
                  Direct Offers ({request.offers?.length ?? 0})
                </h2>
                {(!request.offers || request.offers.length === 0) ? (
                  <p className="text-xs" style={{ color: '#94b4d0' }}>
                    No offers submitted yet. Be the first seller to provide a competitive quote!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {request.offers.map((offer: any) => (
                      <div key={offer.id} className="p-3 rounded-xl border flex items-center justify-between"
                        style={{ background: 'rgba(22,45,86,0.5)', borderColor: 'rgba(255,255,255,0.06)' }}>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {offer.seller?.fullName || 'Verified Seller'}
                          </div>
                          <div className="text-xs" style={{ color: '#94b4d0' }}>{offer.notes}</div>
                        </div>
                        <div className="font-black text-emerald-400 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {formatPrice(offer.offeredPrice, offer.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar / Make an Offer */}
            <div className="space-y-4">
              <div className="glass-card p-6">
                <div className="text-xs" style={{ color: '#94b4d0' }}>Buyer Target Budget</div>
                <div className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {request.targetBudget ? formatPrice(request.targetBudget, request.currency) : 'Open to offers'}
                </div>

                {offerSuccess ? (
                  <div className="p-4 rounded-xl text-center"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                    <div className="text-2xl mb-1">✅</div>
                    <div className="font-bold text-sm">Offer Submitted!</div>
                    <p className="text-xs mt-1 text-emerald-200">The buyer has been notified of your quote.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOffer} className="space-y-3">
                    <h3 className="text-sm font-bold text-white">Submit a Direct Offer</h3>

                    {error && (
                      <div className="p-2.5 rounded-lg text-xs font-medium border"
                        style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                        Your Offer Price ({request.currency}) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="any"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder="e.g. 450"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                        Notes / Product Details *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={offerMessage}
                        onChange={(e) => setOfferMessage(e.target.value)}
                        placeholder="Condition, warranty, delivery timeframe, inspection available..."
                        className="input-field resize-none text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingOffer}
                      className="btn-accent w-full justify-center text-sm"
                    >
                      {submittingOffer ? 'Sending Offer...' : 'Send Offer to Buyer'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
