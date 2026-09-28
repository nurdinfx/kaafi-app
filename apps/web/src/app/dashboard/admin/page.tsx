'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { api } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [tab, setTab] = useState<'ANALYTICS' | 'USERS' | 'AUDIT'>('ANALYTICS');

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        setCurrentUser(parsedUser);
      } catch {}
    }

    loadDashboard(savedToken);
  }, [router]);

  const loadDashboard = async (authToken: string) => {
    setLoading(true);
    setError('');
    try {
      const [analyticsRes, usersRes, auditRes] = await Promise.all([
        api.getAdminAnalytics(authToken),
        api.getAdminUsers(authToken, { limit: 50 }),
        api.getAdminAuditLogs(authToken, 50),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data);
    } catch {
      setError('Khalad baa dhacay marka xogta maamulka la soo kicinayay.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, data: { isActive?: boolean; verificationStatus?: string }) => {
    if (!token) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.updateUserStatusAdmin(userId, data, token);
      if (res.success) {
        setSuccessMsg('User status updated successfully.');
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
        );
      } else {
        setError(res.message || 'Failed to update user status.');
      }
    } catch {
      setError('Khalad baa dhacay marka isticmaalaha la bedelayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const roles = currentUser?.roles || [];
  const isAdmin = roles.includes('SUPER_ADMIN') || roles.includes('FINANCE_ADMIN') || roles.includes('MODERATOR');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto w-full p-8 space-y-4">
          <div className="h-10 bg-blue-900/20 rounded-xl animate-pulse" />
          <div className="h-64 bg-blue-900/10 rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    );
  }

  // RBAC Guard message if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
        <Navbar />
        <main className="flex-1 max-w-md mx-auto w-full p-8 text-center my-auto">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Rukhsad Ma Haysatid (Access Denied)
          </h1>
          <p className="text-sm mb-6" style={{ color: '#94b4d0' }}>
            Boggan waxaa u gooni ah maamulayaasha sare ee Fududeeye (Super Admin, Finance, Moderators).
          </p>
          <Link href="/" className="btn-primary inline-flex text-xs">
            Ku noqo Bogga Hore (Back Home)
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
                 style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              🛡️ Kaafi-App Super-Admin Control Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Xarunta Maamulka Sare (Admin Dashboard)
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              Xisaabaadka GMV, kormeerka xayeysiimaha, xaqiijinta ganacsatada, iyo diiwaanka amniga (audit logs).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => token && loadDashboard(token)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white border"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,32,64,0.6)' }}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* Banner Alert Messages */}
        {error && (
          <div className="p-4 rounded-xl mb-6 text-sm text-rose-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-xl mb-6 text-sm text-emerald-300" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b pb-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[
            { key: 'ANALYTICS', label: '📊 Platform Analytics & GMV' },
            { key: 'USERS', label: `👥 Users & Merchants (${users.length})` },
            { key: 'AUDIT', label: `🔒 Audit Trail (${auditLogs.length})` },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: tab === t.key ? 'rgba(12,143,226,0.2)' : 'transparent',
                color: tab === t.key ? '#38bdf8' : '#94b4d0',
                border: tab === t.key ? '1px solid rgba(12,143,226,0.4)' : '1px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Analytics */}
        {tab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Platform Total GMV</div>
                <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatPrice(analytics?.totalGMV || 0)}
                </div>
                <div className="text-xs text-emerald-400 mt-1">Direct purchases & orders</div>
              </div>

              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Commissions Earned</div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatPrice(analytics?.totalCommission || 0)}
                </div>
                <div className="text-xs text-blue-400 mt-1">Platform revenue share</div>
              </div>

              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Registered Users</div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {analytics?.totalUsers || users.length}
                </div>
                <div className="text-xs text-purple-400 mt-1">Buyers, sellers, drivers</div>
              </div>

              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Active Marketplace Listings</div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {analytics?.totalListings || 0}
                </div>
                <div className="text-xs text-blue-300 mt-1">Across 8 categories</div>
              </div>
            </div>

            {/* Additional breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-3">Logistics & Drivers</h3>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span style={{ color: '#94b4d0' }}>Active Verified Drivers:</span>
                  <span className="font-bold text-white">{analytics?.activeDrivers || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span style={{ color: '#94b4d0' }}>Completed Deliveries:</span>
                  <span className="font-bold text-emerald-400">{analytics?.completedDeliveries || 0}</span>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-3">Trust & Disputes</h3>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span style={{ color: '#94b4d0' }}>Open Disputes:</span>
                  <span className="font-bold text-rose-400">{analytics?.openDisputes || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span style={{ color: '#94b4d0' }}>Pending Verifications:</span>
                  <span className="font-bold text-amber-400">{analytics?.pendingVerifications || 0}</span>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-white mb-3">Payout Requests</h3>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-xs">
                  <span style={{ color: '#94b4d0' }}>Pending Merchant Payouts:</span>
                  <span className="font-bold text-blue-400">{analytics?.pendingPayouts || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-xs">
                  <span style={{ color: '#94b4d0' }}>Processed This Month:</span>
                  <span className="font-bold text-emerald-400">{analytics?.processedPayouts || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {tab === 'USERS' && (
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Maamulka Isticmaalayaasha (Users & Merchants Management)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#94b4d0' }}>
                    <th className="pb-3">Magaca / Taleefanka</th>
                    <th className="pb-3">Magaalada</th>
                    <th className="pb-3">Xaqiijinta (Verification)</th>
                    <th className="pb-3">Xaaladda (Account)</th>
                    <th className="pb-3 text-right">Ficilada (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="py-3">
                        <div className="font-semibold text-white">{u.fullName}</div>
                        <div className="text-xs font-mono" style={{ color: '#94b4d0' }}>{u.phoneNumber}</div>
                      </td>
                      <td className="py-3 text-xs" style={{ color: '#94b4d0' }}>
                        {u.city || 'Garoowe'}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            u.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : u.verificationStatus === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {u.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            u.isActive !== false ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {u.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {u.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateUserStatus(u.id, { verificationStatus: 'VERIFIED' })}
                            disabled={actionLoading}
                            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            Xaqiiji (Verify)
                          </button>
                        )}
                        {u.isActive !== false ? (
                          <button
                            onClick={() => handleUpdateUserStatus(u.id, { isActive: false })}
                            disabled={actionLoading}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Jooji (Suspend)
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateUserStatus(u.id, { isActive: true })}
                            disabled={actionLoading}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Fasax (Activate)
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Trail */}
        {tab === 'AUDIT' && (
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Diiwaanka Amniga & Dhacdooyinka (Security Audit Logs)
            </h3>

            <div className="space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-xs py-8 text-center" style={{ color: '#94b4d0' }}>
                  Audit logs empty.
                </p>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
                    style={{ background: 'rgba(15,32,64,0.4)', borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-blue-400">{log.action}</span>
                        <span className="text-[11px] text-slate-400">by {log.user?.fullName || log.userId}</span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        Entity: {log.entityType} ({log.entityId})
                      </div>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
