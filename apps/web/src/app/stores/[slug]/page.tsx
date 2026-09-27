import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ListingCard from '../../../components/ListingCard';
import { api } from '../../../lib/api';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const store = await api.getStore(slug);
  if (!store) return { title: 'Store not found — Fududeeye' };
  return {
    title: `${store.businessName} — Verified Store | Fududeeye`,
    description: store.bio?.slice(0, 160) || `Shop from ${store.businessName} on Fududeeye marketplace.`,
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await api.getStore(slug);
  if (!store) notFound();

  const listingsRes = await api.getListings({ limit: 20, page: 1 });

  return (
    <main>
      <Navbar />

      {/* Store Hero Banner */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050c15, #0a1628, #0f2040)', minHeight: '220px' }}>
        {store.bannerUrl && (
          <img src={store.bannerUrl} alt={store.businessName}
            className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(5,12,21,1) 0%, transparent 60%)',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="flex items-end gap-5">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl"
              style={{ border: '2px solid rgba(12,143,226,0.4)', background: '#0f2040' }}>
              {store.logoUrl
                ? <img src={store.logoUrl} alt={store.businessName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl">🏪</div>
              }
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {store.businessName}
                </h1>
                {store.isVerified && <span className="badge-verified">✓ Verified</span>}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: '#94b4d0' }}>
                {store.businessType && <span className="badge-category">{store.businessType}</span>}
                {store.city && <span>📍 {store.city}</span>}
                <Link
                  href={`/chat?recipientId=${store.ownerId || (store as any).owner?.id || store.id}`}
                  id="chat-store-btn"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  💬 Kula Sheekeyso Dukaanka (In-App Chat)
                </Link>
              </div>
            </div>
          </div>

          {store.bio && (
            <p className="mt-4 max-w-xl text-sm" style={{ color: '#94b4d0' }}>
              {store.bio}
            </p>
          )}

          {/* Store stats */}
          <div className="flex gap-4 mt-5">
            {[
              { label: 'Listings', value: store._count?.listings ?? 0 },
              { label: 'Reviews', value: store._count?.reviews ?? 0 },
              { label: 'Rating', value: store.averageRating ? `${store.averageRating.toFixed(1)} ⭐` : 'New' },
            ].map((s) => (
              <div key={s.label} className="text-center px-4 py-2 rounded-xl"
                style={{ background: 'rgba(12,143,226,0.08)', border: '1px solid rgba(12,143,226,0.15)' }}>
                <div className="text-lg font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#94b4d0' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Store Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
          All Listings from {store.businessName}
        </h2>

        {listingsRes.data.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-lg font-bold text-white mb-1">No listings yet</h3>
            <p style={{ color: '#94b4d0' }}>This store hasn&apos;t posted any listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listingsRes.data.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
