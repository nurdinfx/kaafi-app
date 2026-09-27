'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Listing, StockMovement } from '../../lib/api';
import { formatPrice } from '../../lib/utils';

export default function InventoryPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);

  // Adjustment modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [movementType, setMovementType] = useState('RESTOCK');
  const [quantityChange, setQuantityChange] = useState(1);
  const [notes, setNotes] = useState('');
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
        setUser(parsedUser);
      } catch {}
    }

    loadListings(savedToken, parsedUser?.id);
  }, [router]);

  const loadListings = async (authToken: string, userId?: string) => {
    setLoading(true);
    try {
      const meRes = await api.getMe(authToken);
      const effectiveId = meRes?.data?.id || userId;
      if (effectiveId) {
        const res = await api.getListings({ sellerId: effectiveId, limit: 50 });
        setListings(res.data);
        if (res.data.length > 0) {
          selectListing(res.data[0], authToken);
        }
      }
    } catch (err) {
      console.error('Failed to load listings for inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectListing = async (listing: Listing, authToken?: string) => {
    setSelectedListing(listing);
    const activeToken = authToken || token;
    if (!activeToken) return;

    setMovementsLoading(true);
    try {
      const m = await api.getStockMovements(listing.id, activeToken);
      setMovements(m);
    } catch (err) {
      console.error('Failed to load movements:', err);
    } finally {
      setMovementsLoading(false);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedListing) return;
    setActionLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const finalChange =
        movementType === 'DAMAGE_WRITE_OFF' ? -Math.abs(quantityChange) : quantityChange;

      const res = await api.recordStockMovement(
        {
          listingId: selectedListing.id,
          movementType,
          quantityChange: finalChange,
          notes: notes || undefined,
        },
        token
      );

      if (res.success) {
        setShowAdjustModal(false);
        setSuccessMsg('Dhaqdhaqaaqa keydka si guul leh ayaa loo diiwaangeliyay!');
        setNotes('');
        // Reload listing and movements
        await selectListing(selectedListing, token);
        if (user?.id) {
          const updatedList = await api.getListings({ sellerId: user.id, limit: 50 });
          setListings(updatedList.data);
          const updatedSelected = updatedList.data.find((l) => l.id === selectedListing.id);
          if (updatedSelected) setSelectedListing(updatedSelected);
        }
      } else {
        setError(res.message || 'Diiwaangelinta keydku way fashilantay.');
      }
    } catch {
      setError('Khalad baa dhacay marka keydka la bedelayay.');
    } finally {
      setActionLoading(false);
    }
  };

  const lowStockCount = listings.filter((l) => l.inventoryCount < 5).length;
  const outOfStockCount = listings.filter((l) => l.inventoryCount <= 0).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
                 style={{ background: 'rgba(12,143,226,0.15)', color: '#38bdf8', border: '1px solid rgba(12,143,226,0.3)' }}>
              📦 Auditable Stock Movement Ledger
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Maamulka Keydka Alaabta (Inventory Management)
            </h1>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              La soco xaddiga alaabta kuu taal, kordhinta (restock), burburka (damage), iyo diiwaanka dhaqdhaqaaqa.
            </p>
          </div>

          <div className="flex gap-2">
            {selectedListing && (
              <button
                onClick={() => setShowAdjustModal(true)}
                className="btn-primary px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <span>±</span> Dhaqaaji / Hagaaji Keydka
              </button>
            )}
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

        {/* Stock Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Total Catalogue Items</div>
            <div className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {listings.length}
            </div>
            <div className="text-xs text-blue-400 mt-1">Managed products</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Units in Stock</div>
            <div className="text-2xl font-black text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {listings.reduce((acc, l) => acc + (l.inventoryCount || 0), 0)}
            </div>
            <div className="text-xs text-emerald-400 mt-1">Available for sale</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Low Stock Warning</div>
            <div className="text-2xl font-black text-amber-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {lowStockCount}
            </div>
            <div className="text-xs text-amber-400 mt-1">Fewer than 5 units</div>
          </div>

          <div className="glass-card p-5">
            <div className="text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Out of Stock</div>
            <div className="text-2xl font-black text-rose-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {outOfStockCount}
            </div>
            <div className="text-xs text-rose-400 mt-1">Needs immediate restock</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Listings List (1 col) */}
          <div className="glass-card p-6">
            <h3 className="text-base font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Alaabtaada (Select Product)
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-blue-900/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs" style={{ color: '#94b4d0' }}>Wax xayeysiis ah ma haysatid.</p>
                <Link href="/listings/create" className="btn-primary mt-3 inline-flex text-xs">
                  + Create Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => selectListing(l)}
                    className="p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3"
                    style={{
                      background:
                        selectedListing?.id === l.id
                          ? 'rgba(12, 143, 226, 0.2)'
                          : 'rgba(15, 32, 64, 0.4)',
                      borderColor:
                        selectedListing?.id === l.id ? '#0c8fe2' : 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-white truncate">{l.title}</div>
                      <div className="text-[11px]" style={{ color: '#94b4d0' }}>
                        {formatPrice(l.price, l.currency)} · {l.category?.name}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap ${
                        l.inventoryCount > 5
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : l.inventoryCount > 0
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {l.inventoryCount} qty
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ledger / Movements Timeline (2 cols) */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {selectedListing ? selectedListing.title : 'Dhaqdhaqaaqa Keydka (Stock Movements)'}
                </h3>
                {selectedListing && (
                  <p className="text-xs" style={{ color: '#94b4d0' }}>
                    Current inventory balance:{' '}
                    <span className="font-bold text-emerald-400">{selectedListing.inventoryCount} xabbo</span>
                  </p>
                )}
              </div>

              {selectedListing && (
                <button
                  onClick={() => setShowAdjustModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 self-start sm:self-auto"
                >
                  + Diiwaangeli Dhaqdhaqaaq
                </button>
              )}
            </div>

            {movementsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-blue-900/20 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-2">📜</div>
                <p className="text-xs" style={{ color: '#94b4d0' }}>
                  Weli wax dhaqdhaqaaq ah lagama diiwaangelin alaabtan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#94b4d0' }}>
                      <th className="pb-3">Taariikhda</th>
                      <th className="pb-3">Nooca</th>
                      <th className="pb-3">Isbedelka</th>
                      <th className="pb-3">Hore / Dambe</th>
                      <th className="pb-3">Faahfaahin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    {movements.map((m) => (
                      <tr key={m.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString()} {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-semibold ${
                              m.movementType === 'RESTOCK'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : m.movementType === 'SALE'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {m.movementType}
                          </span>
                        </td>
                        <td className="py-3 text-xs font-mono font-bold">
                          <span className={m.quantityChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {m.quantityChange >= 0 ? `+${m.quantityChange}` : m.quantityChange}
                          </span>
                        </td>
                        <td className="py-3 text-xs font-mono text-slate-300">
                          {m.quantityBefore} → {m.quantityAfter}
                        </td>
                        <td className="py-3 text-xs text-slate-400">{m.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full relative" style={{ background: '#091524' }}>
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Dhaqaaji Keydka: {selectedListing.title}
            </h3>
            <p className="text-xs mb-4" style={{ color: '#94b4d0' }}>
              Hadda waxaa kuu yaalla:{' '}
              <span className="font-bold text-emerald-400">{selectedListing.inventoryCount} xabbo</span>
            </p>

            <form onSubmit={handleRecordMovement} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Nooca Dhaqdhaqaaqa</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                >
                  <option value="RESTOCK">Kordhin / Soo Iibsi (Restock)</option>
                  <option value="AUDIT_ADJUSTMENT">Hagaajin Xisaabeed (Audit Adjustment)</option>
                  <option value="DAMAGE_WRITE_OFF">Burbur / Kharribmay (Damage Write-off)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Tirada (Units)</label>
                <input
                  type="number"
                  min="1"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(parseInt(e.target.value, 10) || 1)}
                  required
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-blue-300 block mb-1">Faahfaahin / Xusuusin (Notes)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Sababta isbedelka, qaansheegta, iwm..."
                  className="w-full px-3 py-2 rounded-xl text-xs text-white bg-blue-950/60 border border-white/10 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2 text-xs font-bold"
                >
                  {actionLoading ? 'Diiwaangelinaya...' : 'Keydi Dhaqdhaqaaqa'}
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
