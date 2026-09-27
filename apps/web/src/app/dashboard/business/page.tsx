'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { api, Transaction, Listing } from '../../../lib/api';
import { formatPrice } from '../../../lib/utils';

export default function BusinessDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showCreateStoreModal, setShowCreateStoreModal] = useState(false);

  // Form states
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('Garoowe');
  const [branchDistrict, setBranchDistrict] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('+252');

  const [empUserId, setEmpUserId] = useState('');
  const [empRole, setEmpRole] = useState('CASHIER');
  const [empBranchId, setEmpBranchId] = useState('');

  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeCity, setStoreCity] = useState('Garoowe');
  const [storeWa, setStoreWa] = useState('+252');

  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('hudisoft_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    loadData(savedToken);
  }, [router]);

  const loadData = async (authToken: string) => {
    setLoading(true);
    try {
      const [meRes, ordersRes] = await Promise.all([
        api.getMe(authToken),
        api.getMyOrders(authToken, 'seller'),
      ]);

      if (meRes.success && meRes.data) {
        setUser(meRes.data);
        if (meRes.data.id) {
          const listRes = await api.getListings({ sellerId: meRes.data.id, limit: 50 });
          setListings(listRes.data);
        }
      }
      setOrders(ordersRes);
    } catch (err) {
      console.error('Failed to load business dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await api.createBusinessStore(
        {
          businessName: storeName,
          description: storeDesc,
          city: storeCity,
          whatsappNumber: storeWa,
        },
        token
      );

      if (res.success) {
        setShowCreateStoreModal(false);
        setSuccessMsg('Ganacsigaaga si guul leh ayaa loo diiwaangeliyay!');
        await loadData(token);
      } else {
        setError(res.message || 'Diiwaangelinta ganacsigu way fashilantay.');
      }
    } catch {
      setError('Khalad baa dhacay marka ganacsiga la abuurayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user?.businessProfile?.id) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await api.addStoreBranch(
        user.businessProfile.id,
        {
          name: branchName,
          city: branchCity,
          district: branchDistrict || undefined,
          address: branchAddress || undefined,
          phone: branchPhone || undefined,
        },
        token
      );

      if (res.success) {
        setShowBranchModal(false);
        setSuccessMsg('Laanta cusub waa lagu daray!');
        setBranchName('');
        await loadData(token);
      } else {
        setError(res.message || 'Ku darista laantu way fashilantay.');
      }
    } catch {
      setError('Khalad baa dhacay marka laanta lagu darayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user?.businessProfile?.id) return;
    setActionLoading(true);
    setError('');

    try {
      const res = await api.addStoreEmployee(
        user.businessProfile.id,
        {
          userId: empUserId,
          role: empRole,
          branchId: empBranchId || undefined,
        },
        token
      );

      if (res.success) {
        setShowEmployeeModal(false);
        setSuccessMsg('Shaqaalaha cusub waa lagu daray!');
        setEmpUserId('');
        await loadData(token);
      } else {
        setError(res.message || 'Ku darista shaqaaluhu way fashilantay.');
      }
    } catch {
      setError('Khalad baa dhacay marka shaqaalaha lagu darayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const business = user?.businessProfile;
  const branches = business?.branches || [];

  const totalGrossRevenue = orders
    .filter((o) => o.status === 'COMPLETED')
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
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

        {/* If no business profile registered yet */}
        {!business ? (
          <div
            className="text-center py-16 px-4 rounded-3xl glass-card max-w-2xl mx-auto my-12"
            style={{ border: '1px solid rgba(12,143,226,0.2)' }}
          >
            <div className="text-5xl mb-4">🏢</div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Fur Dukaankaaga Ganacsi (Register Your Business)
            </h1>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: '#94b4d0' }}>
              Fududeeye wuxuu kuu saamaxayaa inaad maamusho dukaamo badan, laamo kala duwan (Garoowe, Bosaso, Mogadishu), iyo shaqaale leh rukhsado gaar ah.
            </p>
            <button
              onClick={() => setShowCreateStoreModal(true)}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
            >
              + Bilow Diiwaangelinta Dukaanka
            </button>
          </div>
        ) : (
          <div>
            {/* Business Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: business.isVerified ? 'rgba(16,185,129,0.12)' : 'rgba(249,115,22,0.12)',
                      color: business.isVerified ? '#34d399' : '#fb923c',
                      border: `1px solid ${business.isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)'}`,
                    }}
                  >
                    {business.isVerified ? '✓ Ganacsi La Xaqiijiyay (Verified)' : '⚡ Pending Verification'}
                  </span>
                  <span className="text-xs" style={{ color: '#6287a2' }}>
                    {business.city || 'Garoowe'} · slug: {business.slug}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {business.businessName}
                </h1>
                <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
                  Xarunta Guud ee Maamulka Ganacsiga (Multi-branch Enterprise Hub)
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowBranchModal(true)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white border"
                  style={{ border: '1px solid rgba(12,143,226,0.4)', background: 'rgba(12,143,226,0.1)' }}
                >
                  + Ku dar Laan (Add Branch)
                </button>
                <button
                  onClick={() => setShowEmployeeModal(true)}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white border"
                  style={{ border: '1px solid rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.1)' }}
                >
                  + Ku dar Shaqaale (Staff)
                </button>
                <Link
                  href={`/stores/${business.slug}`}
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white shadow"
                  style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                >
                  Arag Dukaanka Dadweynaha ↗
                </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                  Total Realized Revenue
                </div>
                <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatPrice(totalGrossRevenue)}
                </div>
                <div className="text-xs text-emerald-400 mt-1">From completed orders</div>
              </div>

              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                  Active Branches
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {branches.length}
                </div>
                <div className="text-xs text-blue-400 mt-1">Garoowe & other cities</div>
              </div>

              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                  Active Catalogue Items
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {listings.length}
                </div>
                <div className="text-xs text-purple-400 mt-1">Multi-vertical listings</div>
              </div>

              <div className="glass-card p-5">
                <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                  Incoming Orders
                </div>
                <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {orders.length}
                </div>
                <div className="text-xs text-blue-300 mt-1">Across all branches</div>
              </div>
            </div>

            {/* Branches & Staff Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Branches */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Laamaha Ganacsiga (Branches)
                  </h3>
                  <button
                    onClick={() => setShowBranchModal(true)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Laan Cusub
                  </button>
                </div>

                {branches.length === 0 ? (
                  <p className="text-xs py-6 text-center" style={{ color: '#94b4d0' }}>
                    Weli wax laan ah laguma darin. Dukaanka guud ayaa hadda shaqeynaya.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {branches.map((b: any) => (
                      <div
                        key={b.id}
                        className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                        style={{ background: 'rgba(15,32,64,0.4)', borderColor: 'rgba(255,255,255,0.06)' }}
                      >
                        <div>
                          <div className="font-semibold text-sm text-white">{b.name}</div>
                          <div className="text-xs" style={{ color: '#94b4d0' }}>
                            {b.city} {b.district ? `· ${b.district}` : ''} {b.address ? `(${b.address})` : ''}
                          </div>
                        </div>
                        {b.phone && (
                          <span className="text-xs font-mono text-blue-300">{b.phone}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Staff / Employees */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Shaqaalaha & Rukhsadaha (Staff)
                  </h3>
                  <button
                    onClick={() => setShowEmployeeModal(true)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    + Shaqaale Cusub
                  </button>
                </div>

                <div className="space-y-3">
                  <div
                    className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
                    style={{ background: 'rgba(15,32,64,0.4)', borderColor: 'rgba(255,255,255,0.06)' }}
                  >
                    <div>
                      <div className="font-semibold text-sm text-white">
                        {user.fullName} (Adiga / Owner)
                      </div>
                      <div className="text-xs" style={{ color: '#94b4d0' }}>
                        Super Administrator · Dhammaan laamaha
                      </div>
                    </div>
                    <span className="badge-verified text-xs">OWNER</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Dalabyada Ganacsiga (Incoming Orders)
                </h3>
                <Link href="/orders" className="text-xs text-blue-400 hover:text-blue-300">
                  Dhammaan Dalabyada →
                </Link>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs py-8 text-center" style={{ color: '#94b4d0' }}>
                  Weli wax dalab ah laguma soo dirin ganacsigan.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr
                        className="border-b text-xs font-semibold"
                        style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#94b4d0' }}
                      >
                        <th className="pb-3">Order Number</th>
                        <th className="pb-3">Waqtiga</th>
                        <th className="pb-3">Macaamilka</th>
                        <th className="pb-3">Wadarta</th>
                        <th className="pb-3">Xaaladda</th>
                        <th className="pb-3 text-right">Faahfaahin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {orders.slice(0, 10).map((o) => (
                        <tr key={o.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 font-mono font-semibold text-white">{o.transactionNumber}</td>
                          <td className="py-3 text-xs" style={{ color: '#94b4d0' }}>
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-xs text-slate-300">{o.recipientPhone || 'Customer'}</td>
                          <td className="py-3 font-bold text-emerald-400">
                            {formatPrice(o.totalAmount, o.currency)}
                          </td>
                          <td className="py-3 text-xs font-bold text-blue-300">{o.status}</td>
                          <td className="py-3 text-right">
                            <Link href={`/orders/${o.id}`} className="text-xs text-blue-400 hover:underline">
                              Arag →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Create Store Modal */}
      {showCreateStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full relative" style={{ background: '#091524' }}>
            <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Diiwaangeli Ganacsi Cusub
            </h3>

            <form onSubmit={handleCreateStore} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Magaca Ganacsiga (Business Name)</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Al-Najax Electronics"
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Faahfaahin Kooban</label>
                <textarea
                  rows={2}
                  value={storeDesc}
                  onChange={(e) => setStoreDesc(e.target.value)}
                  placeholder="Maxaad iibisaan?"
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Magaalada Xarunta</label>
                <select
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                >
                  <option value="Garoowe">Garoowe</option>
                  <option value="Bosaso">Bosaso</option>
                  <option value="Mogadishu">Mogadishu</option>
                  <option value="Hargeisa">Hargeisa</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">WhatsApp Business Number</label>
                <input
                  type="tel"
                  value={storeWa}
                  onChange={(e) => setStoreWa(e.target.value)}
                  placeholder="+25261XXXXXXX"
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateStoreModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {actionLoading ? 'Diiwaangelinayaa...' : 'Diiwaangeli Hadda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full relative" style={{ background: '#091524' }}>
            <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ku dar Laan Cusub (Add Branch)
            </h3>

            <form onSubmit={handleAddBranch} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Magaca Laanta</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Laanta Suuq-hoose, Bosaso Main Hub"
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Magaalada</label>
                <select
                  value={branchCity}
                  onChange={(e) => setBranchCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                >
                  <option value="Garoowe">Garoowe</option>
                  <option value="Bosaso">Bosaso</option>
                  <option value="Qardho">Qardho</option>
                  <option value="Mogadishu">Mogadishu</option>
                  <option value="Hargeisa">Hargeisa</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Xaafadda / District</label>
                <input
                  type="text"
                  value={branchDistrict}
                  onChange={(e) => setBranchDistrict(e.target.value)}
                  placeholder="e.g. Hodan, Waaberi"
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Cinwaanka / Address</label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="Dhismaha, Dabaqa ama Laamiga agtiisa"
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Taleefanka Laanta</label>
                <input
                  type="tel"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  placeholder="+25261XXXXXXX"
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {actionLoading ? 'Dhisaya...' : 'Keydi Laanta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full relative" style={{ background: '#091524' }}>
            <h3 className="text-lg font-bold text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Ku dar Shaqaale Cusub (Add Employee)
            </h3>

            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">User ID ama Taleefanka Shaqaalaha</label>
                <input
                  type="text"
                  value={empUserId}
                  onChange={(e) => setEmpUserId(e.target.value)}
                  placeholder="Geli User UUID..."
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Doorka (Role)</label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                >
                  <option value="MANAGER">Manager (Maamule)</option>
                  <option value="CASHIER">Cashier (Khasnaji)</option>
                  <option value="INVENTORY_CLERK">Inventory Clerk (Keydka)</option>
                  <option value="DISPATCHER">Dispatcher (Gaarsiinta)</option>
                </select>
              </div>

              {branches.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-blue-300 block mb-1">U qoondee Laan (Optional)</label>
                  <select
                    value={empBranchId}
                    onChange={(e) => setEmpBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                  >
                    <option value="">Dhammaan Laamaha</option>
                    {branches.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {actionLoading ? 'Diiwaangelinaya...' : 'Diiwaangeli Shaqaalaha'}
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
