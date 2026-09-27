'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, BuyerRequest } from '../../lib/api';
import { formatPrice, timeAgo } from '../../lib/utils';

export default function BuyerRequestsPage() {
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getBuyerRequests({ city: cityFilter || undefined }).then((data) => {
      setRequests(data);
      setLoading(false);
    });
  }, [cityFilter]);

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
              📋 Buyer Reverse Marketplace
            </div>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Buyer Requests (Dalabaadka Iibsadayaasha)
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              Customers post what they are searching for. Verified sellers submit private direct offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(15,32,64,0.8)', color: '#7cc8fb', border: '1px solid rgba(12,143,226,0.2)' }}
            >
              <option value="">All Locations</option>
              <option value="Garoowe">Garoowe</option>
              <option value="Bosaso">Bosaso</option>
              <option value="Galkayo">Galkayo</option>
            </select>

            <Link
              href="/requests/create"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              + Post a Request
            </Link>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 skeleton h-32" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="py-20 text-center glass-card p-8">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">No active buyer requests right now</h3>
            <p className="text-sm mb-6" style={{ color: '#94b4d0' }}>
              Are you looking for a specific car, property, electronic device, or bulk wholesale goods?
            </p>
            <Link
              href="/requests/create"
              className="inline-flex px-6 py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
            >
              Create the First Request
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:border-blue-500/30"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-category">{req.category?.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={req.urgency === 'URGENT'
                        ? { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
                        : { background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }
                      }>
                      {req.urgency}
                    </span>
                    <span className="text-xs" style={{ color: '#94b4d0' }}>
                      📍 {req.city} {req.landmark ? `· ${req.landmark}` : ''}
                    </span>
                    <span className="text-xs" style={{ color: '#94b4d0' }}>
                      · {timeAgo(req.createdAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {req.title}
                  </h3>

                  <p className="text-sm line-clamp-2" style={{ color: '#94b4d0' }}>
                    {req.description}
                  </p>

                  <div className="text-xs" style={{ color: '#94b4d0' }}>
                    Requested by <span className="text-white font-medium">{req.buyer?.fullName}</span>
                    {req.quantity > 1 && <span className="ml-2 font-semibold text-blue-300">Quantity: {req.quantity} units</span>}
                  </div>
                </div>

                {/* Right budget & CTA */}
                <div className="sm:text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-3">
                  {req.targetBudget && (
                    <div>
                      <div className="text-xs" style={{ color: '#94b4d0' }}>Target Budget</div>
                      <div className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {formatPrice(req.targetBudget, req.currency)}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(22,45,86,0.8)', color: '#7cc8fb' }}>
                      {req._count?.offers ?? 0} offers received
                    </span>
                    <Link
                      href={`/requests/${req.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                    >
                      Submit Offer →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
