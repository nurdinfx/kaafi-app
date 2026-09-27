'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Transaction } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  DRAFT:            { label: 'Draft',            color: '#94b4d0', bg: 'rgba(148,180,208,0.12)', icon: '📝' },
  PENDING_PAYMENT:  { label: 'Awaiting Payment', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '⏳' },
  PAYMENT_CONFIRMED:{ label: 'Payment Confirmed',color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✅' },
  PLACED:           { label: 'Order Placed',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: '📦' },
  ACCEPTED:         { label: 'Accepted',         color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '🤝' },
  PREPARING:        { label: 'Preparing',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: '⚙️' },
  READY:            { label: 'Ready',            color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   icon: '🔔' },
  ASSIGNED:         { label: 'Driver Assigned',  color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: '🛵' },
  IN_TRANSIT:       { label: 'In Transit',       color: '#f97316', bg: 'rgba(249,115,22,0.12)',  icon: '🚗' },
  DELIVERED:        { label: 'Delivered',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '📬' },
  COMPLETED:        { label: 'Completed',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✔️' },
  CANCELLED:        { label: 'Cancelled',        color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '✗' },
  REFUNDED:         { label: 'Refunded',         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: '↩️' },
  DISPUTED:         { label: 'Disputed',         color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '⚠️' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: '#94b4d0', bg: 'rgba(148,180,208,0.12)', icon: '•' };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [token, setToken] = useState<string | null>(null);

  const loadOrders = useCallback(async (tok: string, r: 'buyer' | 'seller') => {
    setLoading(true);
    const data = await api.getMyOrders(tok, r);
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('hudisoft_token');
    if (stored) {
      setToken(stored);
      loadOrders(stored, role);
    } else {
      setLoading(false);
    }
  }, []);

  const switchRole = (r: 'buyer' | 'seller') => {
    setRole(r);
    if (token) loadOrders(token, r);
  };

  return (
    <main>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              My Orders
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              Track purchases, sales, and deliveries in real-time.
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(12,143,226,0.25)' }}>
            {(['buyer', 'seller'] as const).map((r) => (
              <button
                key={r}
                id={`orders-tab-${r}`}
                onClick={() => switchRole(r)}
                className="px-5 py-2 text-sm font-semibold transition-all"
                style={{
                  background: role === r ? 'rgba(12,143,226,0.2)' : 'transparent',
                  color: role === r ? '#7cc8fb' : '#94b4d0',
                }}
              >
                {r === 'buyer' ? '🛒 Purchases' : '📦 Sales'}
              </button>
            ))}
          </div>
        </div>

        {/* Auth guard */}
        {!token && !loading && (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-xl font-bold text-white mb-2">Sign in to view your orders</h2>
            <p className="text-sm mb-6" style={{ color: '#94b4d0' }}>
              You need to be logged in to see your order history.
            </p>
            <Link href="/auth" id="orders-signin-btn" className="btn-primary">
              Sign In
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Orders list */}
        {!loading && token && orders.length === 0 && (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">{role === 'buyer' ? '🛒' : '📦'}</div>
            <h2 className="text-xl font-bold text-white mb-2">
              {role === 'buyer' ? 'No purchases yet' : 'No sales yet'}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#94b4d0' }}>
              {role === 'buyer'
                ? 'Browse the marketplace and make your first purchase.'
                : 'Post listings to start selling on Fududeeye.'}
            </p>
            <Link
              href={role === 'buyer' ? '/listings' : '/listings/create'}
              id="orders-empty-cta"
              className="btn-primary"
            >
              {role === 'buyer' ? 'Browse Marketplace' : 'Post a Listing'}
            </Link>
          </div>
        )}

        {!loading && token && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const thumb = firstItem?.listing?.media?.[0]?.url;
              return (
                <div key={order.id} className="glass-card p-5 hover:border-opacity-50 transition-all">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Thumbnail */}
                    {thumb && (
                      <div className="w-full sm:w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={thumb} alt={firstItem?.listing?.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono" style={{ color: '#94b4d0' }}>
                              #{order.transactionNumber}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>
                          <h3 className="text-white font-semibold mt-1 truncate">
                            {firstItem?.listing?.title || 'Order'}
                            {order.items?.length > 1 && (
                              <span className="text-xs ml-1" style={{ color: '#94b4d0' }}>
                                +{order.items.length - 1} more
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-black text-white">
                            {formatPrice(order.totalAmount, order.currency)}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
                            {order.fulfillmentType.replace(/_/g, ' ')}
                          </div>
                        </div>
                      </div>

                      {/* Delivery info */}
                      {order.deliveryCity && (
                        <div className="text-xs mt-1" style={{ color: '#94b4d0' }}>
                          📍 {order.deliveryLandmark ? `${order.deliveryLandmark}, ` : ''}{order.deliveryCity}
                        </div>
                      )}

                      {/* Delivery status */}
                      {order.deliveryJob && (
                        <div className="mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c' }}>
                            🛵 Driver: {order.deliveryJob.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <Link
                          href={`/orders/${order.id}`}
                          id={`order-detail-${order.id}`}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(12,143,226,0.15)', color: '#7cc8fb' }}
                        >
                          View Details →
                        </Link>

                        {order.status === 'DELIVERED' && role === 'buyer' && (
                          <Link
                            href={`/orders/${order.id}?action=dispute`}
                            id={`order-dispute-${order.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
                          >
                            ⚠️ Open Dispute
                          </Link>
                        )}

                        {order.status === 'DELIVERED' && role === 'buyer' && (
                          <button
                            id={`order-confirm-${order.id}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399' }}
                          >
                            ✅ Confirm Receipt
                          </button>
                        )}

                        <span className="text-xs ml-auto" style={{ color: '#94b4d0' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
