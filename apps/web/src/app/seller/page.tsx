'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Listing, Wallet, Transaction } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

export default function SellerDashboardPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('hudisoft_token');
    const storedUser = localStorage.getItem('hudisoft_user');

    if (!savedToken) {
      router.push('/auth/login');
      return;
    }

    setToken(savedToken);
    let parsedUser: any = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {}
    }

    loadDashboardData(savedToken, parsedUser?.id);
  }, [router]);

  const loadDashboardData = async (authToken: string, userId?: string) => {
    setLoading(true);
    try {
      const [walletRes, ordersRes, meRes] = await Promise.all([
        api.getMyWallet(authToken),
        api.getMyOrders(authToken, 'seller'),
        api.getMe(authToken),
      ]);

      if (meRes.success && meRes.data) {
        setUser(meRes.data);
      }
      setWallet(walletRes);
      setOrders(ordersRes);

      const effectiveSellerId = meRes?.data?.id || userId;
      if (effectiveSellerId) {
        const listingsRes = await api.getListings({ sellerId: effectiveSellerId, limit: 50 });
        setListings(listingsRes.data);
      } else {
        const listingsRes = await api.getListings({ limit: 20 });
        setListings(listingsRes.data);
      }
    } catch (err) {
      console.error('Failed to load seller dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this listing?')) return;
    setDeletingId(id);
    try {
      const res = await api.deleteListing(id, token);
      if (res.success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      } else {
        alert(res.message || 'Failed to delete listing.');
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const totalViews = listings.reduce((acc, l) => acc + (l.viewsCount || 0), 0);
  const totalValue = listings.reduce((acc, l) => acc + (l.price || 0), 0);

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'PAYMENT_CONFIRMED' || o.status === 'ACCEPTED' || o.status === 'PREPARING'
  ).length;

  return (
    <main className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background:
                    user?.verificationStatus === 'VERIFIED'
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(249,115,22,0.12)',
                  color: user?.verificationStatus === 'VERIFIED' ? '#34d399' : '#fb923c',
                  border: `1px solid ${
                    user?.verificationStatus === 'VERIFIED'
                      ? 'rgba(16,185,129,0.2)'
                      : 'rgba(249,115,22,0.2)'
                  }`,
                }}
              >
                {user?.verificationStatus === 'VERIFIED' ? '✓ Ganacsi La Xaqiijiyay' : '⚡ Unverified Seller'}
              </span>
              <span className="text-xs" style={{ color: '#6287a2' }}>
                Garoowe, Somalia
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Xarunta Ganacsadaha (Seller Hub)
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              Kusoo dhawaaw{user?.fullName ? `, ${user.fullName}` : ''}! Maamul xayeysiimahaaga, lacagahaaga, iyo dalabyada macaamiisha.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/listings/create"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
            >
              <span>+</span> Xayeysiis Cusub
            </Link>
            <Link
              href="/orders"
              className="px-4 py-2.5 rounded-xl font-semibold text-sm border inline-flex items-center gap-2"
              style={{
                border: '1px solid rgba(12,143,226,0.3)',
                background: 'rgba(12,143,226,0.08)',
                color: '#7cc8fb',
              }}
            >
              <span>📦</span> Dalabyada {pendingOrdersCount > 0 && `(${pendingOrdersCount})`}
            </Link>
            <Link
              href="/wallet"
              className="px-4 py-2.5 rounded-xl font-semibold text-sm border inline-flex items-center gap-2"
              style={{
                border: '1px solid rgba(16,185,129,0.3)',
                background: 'rgba(16,185,129,0.08)',
                color: '#34d399',
              }}
            >
              <span>💳</span> Jeebka (Wallet)
            </Link>
            <Link
              href="/dashboard/business"
              className="px-4 py-2.5 rounded-xl font-semibold text-sm border inline-flex items-center gap-2"
              style={{
                border: '1px solid rgba(168,85,247,0.4)',
                background: 'rgba(168,85,247,0.12)',
                color: '#d8b4fe',
              }}
            >
              <span>🏢</span> Fur / Maamul Store-ka
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              Available Wallet Balance
            </div>
            <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {wallet ? formatPrice(wallet.balance, wallet.currency) : '$0.00'}
            </div>
            <div className="text-xs mt-1" style={{ color: '#6287a2' }}>
              Pending: {wallet ? formatPrice(wallet.pendingBalance, wallet.currency) : '$0.00'}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              Active Listings
            </div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {listings.length}
            </div>
            <div className="text-xs text-blue-400 mt-1">Live on Fududeeye</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              Total Catalogue Value
            </div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {formatPrice(totalValue)}
            </div>
            <div className="text-xs text-blue-300 mt-1">Across active inventory</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              Orders Received
            </div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {orders.length}
            </div>
            <div className="text-xs text-purple-300 mt-1">
              {pendingOrdersCount} awaiting fulfillment
            </div>
          </div>
        </div>

        {/* Navigation Tabs to Sub-systems */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <Link
            href="/orders"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2"
            style={{ background: 'rgba(15,32,64,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            📋 Order Management
          </Link>
          <Link
            href="/inventory"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2"
            style={{ background: 'rgba(15,32,64,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            📦 Inventory & Stock Movement
          </Link>
          <Link
            href="/requests"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2"
            style={{ background: 'rgba(15,32,64,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            🔍 Browse Buyer RFQs
          </Link>
          <Link
            href="/wallet"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-2"
            style={{ background: 'rgba(15,32,64,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            💸 Request Payout
          </Link>
          <Link
            href="/dashboard/business"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 transition-all flex items-center gap-2"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            🏢 Business Store & Branches
          </Link>
        </div>

        {/* Listings Table */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Xayeysiimahaaga (My Listings)
            </h2>
            <Link href="/listings" className="text-xs text-blue-400 hover:text-blue-300">
              Suuqa Guud (Marketplace) →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse bg-blue-900/20" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm" style={{ color: '#94b4d0' }}>
                Weli wax xayeysiis ah ma aadan soo gelin.
              </p>
              <Link href="/listings/create" className="btn-primary mt-4 inline-flex text-xs">
                Soo Geli Xayeysiiska Koowaad
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr
                    className="border-b text-xs font-semibold"
                    style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#94b4d0' }}
                  >
                    <th className="pb-3">Alaabta (Item)</th>
                    <th className="pb-3">Nooca (Category)</th>
                    <th className="pb-3">Qiimaha</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Magaalada</th>
                    <th className="pb-3">Aragtida</th>
                    <th className="pb-3">Xaaladda</th>
                    <th className="pb-3 text-right">Ficilada (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-white truncate max-w-xs">{l.title}</div>
                        <div className="text-xs" style={{ color: '#94b4d0' }}>
                          {l.condition}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge-category">{l.category?.name || 'Guud'}</span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-white">
                        {formatPrice(l.price, l.currency)}
                      </td>
                      <td className="py-3 pr-4 text-xs font-medium">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            l.inventoryCount > 5
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {l.inventoryCount} qty
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs" style={{ color: '#94b4d0' }}>
                        {l.city} {l.landmark ? `· ${l.landmark}` : ''}
                      </td>
                      <td className="py-3 pr-4 text-xs font-semibold text-blue-300">
                        {l.viewsCount || 0}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="badge-verified text-xs">{l.status}</span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        <Link
                          href={`/listing/${l.slug}`}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteListing(l.id)}
                          disabled={deletingId === l.id}
                          className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                        >
                          {deletingId === l.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
