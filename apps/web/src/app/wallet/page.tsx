'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Wallet, LedgerEntry } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

const LEDGER_ICONS: Record<string, string> = {
  CREDIT: '⬆️',
  DEBIT: '⬇️',
  COMMISSION: '📊',
  PAYOUT: '💸',
  REFUND: '↩️',
  ADJUSTMENT: '⚙️',
};

const PAYOUT_PROVIDERS = [
  { value: 'EVC_PLUS', label: 'EVC Plus (Hormuud)', icon: '📱' },
  { value: 'ZAAD', label: 'ZAAD (Telesom)', icon: '📱' },
  { value: 'SAHAL', label: 'SAHAL (Golis)', icon: '📱' },
  { value: 'BANK', label: 'Bank Transfer', icon: '🏦' },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState({ amount: '', destinationType: 'EVC_PLUS', phoneNumber: '' });
  const [payoutStatus, setPayoutStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    const tok = localStorage.getItem('hudisoft_token');
    if (tok) {
      setToken(tok);
      api.getMyWallet(tok).then((w) => {
        setWallet(w);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handlePayout = async () => {
    if (!token || !wallet) return;
    if (!payoutForm.amount || parseFloat(payoutForm.amount) <= 0) {
      setPayoutStatus({ type: 'error', msg: 'Please enter a valid amount.' });
      return;
    }
    if (parseFloat(payoutForm.amount) > wallet.balance) {
      setPayoutStatus({ type: 'error', msg: 'Amount exceeds available balance.' });
      return;
    }
    setSubmittingPayout(true);
    setPayoutStatus(null);
    const result = await api.requestPayout({
      amount: parseFloat(payoutForm.amount),
      destinationType: payoutForm.destinationType,
      phoneNumber: payoutForm.phoneNumber,
    }, token);

    if (result.success) {
      setPayoutStatus({ type: 'success', msg: 'Payout request submitted. Processing within 24h.' });
      setPayoutForm({ amount: '', destinationType: 'EVC_PLUS', phoneNumber: '' });
      // Refresh wallet
      const updated = await api.getMyWallet(token);
      setWallet(updated);
    } else {
      setPayoutStatus({ type: 'error', msg: result.message || 'Payout request failed.' });
    }
    setSubmittingPayout(false);
  };

  const ledger = wallet?.ledgerEntries || [];
  const pagedLedger = ledger.slice((ledgerPage - 1) * PER_PAGE, ledgerPage * PER_PAGE);
  const totalPages = Math.ceil(ledger.length / PER_PAGE);

  return (
    <main>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            My Wallet
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
            Earnings, commissions, and payouts — all in one place.
          </p>
        </div>

        {!token && !loading && (
          <div className="glass-card p-12 text-center">
            <div className="text-5xl mb-4">🔐</div>
            <h2 className="text-xl font-bold text-white mb-2">Sign in to access your wallet</h2>
            <Link href="/auth" id="wallet-signin-btn" className="btn-primary mt-4 inline-flex">
              Sign In
            </Link>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            <div className="skeleton h-40 w-full rounded-2xl" />
            <div className="skeleton h-64 w-full rounded-2xl" />
          </div>
        )}

        {!loading && token && wallet && (
          <div className="space-y-6">
            {/* Balance cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Available balance */}
              <div
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(12,143,226,0.25) 0%, rgba(5,12,21,0.9) 100%)',
                  border: '1px solid rgba(12,143,226,0.3)',
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, #0c8fe2, transparent)', filter: 'blur(30px)' }} />
                <div className="relative">
                  <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                    Available Balance
                  </div>
                  <div className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatPrice(wallet.balance, wallet.currency)}
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#94b4d0' }}>
                    Ready for withdrawal
                  </div>
                </div>
              </div>

              {/* Pending balance */}
              <div
                className="relative rounded-2xl p-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(5,12,21,0.9) 100%)',
                  border: '1px solid rgba(245,158,11,0.25)',
                }}
              >
                <div className="relative">
                  <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                    Pending Balance
                  </div>
                  <div className="text-4xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatPrice(wallet.pendingBalance, wallet.currency)}
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#94b4d0' }}>
                    Held until order completion
                  </div>
                </div>
              </div>
            </div>

            {/* Payout section */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
                💸 Request Payout
              </h2>

              {payoutStatus && (
                <div
                  className="p-3 rounded-xl text-sm mb-4"
                  style={{
                    background: payoutStatus.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                    color: payoutStatus.type === 'success' ? '#34d399' : '#f87171',
                  }}
                >
                  {payoutStatus.msg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Provider */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#94b4d0' }}>
                    Withdrawal Method
                  </label>
                  <select
                    id="payout-provider"
                    value={payoutForm.destinationType}
                    onChange={(e) => setPayoutForm((p) => ({ ...p, destinationType: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {PAYOUT_PROVIDERS.map((p) => (
                      <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#94b4d0' }}>
                    Phone / Account Number
                  </label>
                  <input
                    id="payout-phone"
                    type="text"
                    placeholder="+252 61 xxx xxxx"
                    value={payoutForm.phoneNumber}
                    onChange={(e) => setPayoutForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: '#94b4d0' }}>
                    Amount (USD)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="payout-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={payoutForm.amount}
                      onChange={(e) => setPayoutForm((p) => ({ ...p, amount: e.target.value }))}
                      className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                    <button
                      id="payout-submit-btn"
                      onClick={handlePayout}
                      disabled={submittingPayout}
                      className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                    >
                      {submittingPayout ? '...' : 'Request'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Ledger */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Transaction Ledger
                </h2>
                <span className="text-xs" style={{ color: '#94b4d0' }}>
                  {ledger.length} entries
                </span>
              </div>

              {ledger.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: '#94b4d0' }}>
                  No transactions yet. Your ledger records every credit and debit.
                </div>
              ) : (
                <>
                  <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {pagedLedger.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-4 py-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                          style={{
                            background: entry.type === 'CREDIT' || entry.type === 'REFUND'
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(239,68,68,0.12)',
                          }}
                        >
                          {LEDGER_ICONS[entry.type] || '•'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white font-medium truncate">{entry.description}</div>
                          <div className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
                            Ref: {entry.reference} · {new Date(entry.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            })}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div
                            className="text-sm font-bold"
                            style={{
                              color: entry.type === 'CREDIT' || entry.type === 'REFUND'
                                ? '#34d399'
                                : '#f87171',
                            }}
                          >
                            {entry.type === 'CREDIT' || entry.type === 'REFUND' ? '+' : '-'}
                            {formatPrice(entry.amount, 'USD')}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: '#94b4d0' }}>
                            Bal: {formatPrice(entry.balanceAfter, 'USD')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={() => setLedgerPage((p) => Math.max(1, p - 1))}
                        disabled={ledgerPage === 1}
                        className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-40"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#7cc8fb' }}
                      >
                        ← Previous
                      </button>
                      <span className="text-xs" style={{ color: '#94b4d0' }}>
                        Page {ledgerPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setLedgerPage((p) => Math.min(totalPages, p + 1))}
                        disabled={ledgerPage === totalPages}
                        className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-40"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#7cc8fb' }}
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
