'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import ListingCard from '../../components/ListingCard';
import Footer from '../../components/Footer';
import { api, Listing, Category } from '../../lib/api';

const VERTICAL_FILTERS = [
  { label: 'All', value: '' },
  { label: '🚗 Vehicles', value: 'VEHICLE' },
  { label: '🏢 Real Estate', value: 'REAL_ESTATE' },
  { label: '📐 Land', value: 'LAND' },
  { label: '📦 Products', value: 'PRODUCT' },
  { label: '🛠️ Services', value: 'SERVICE' },
  { label: '🏭 Wholesale', value: 'WHOLESALE' },
];

const CONDITION_OPTIONS = ['', 'NEW', 'LIKE_NEW', 'USED_GOOD', 'USED_FAIR'];
const SORT_OPTIONS = [
  { label: 'Latest', value: 'createdAt-desc' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Most Viewed', value: 'viewsCount-desc' },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const categorySlug = searchParams.get('categorySlug') || '';
  const verticalType = searchParams.get('verticalType') || '';
  const city = searchParams.get('city') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'createdAt-desc';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [sortBy, sortOrder] = sort.split('-');

  useEffect(() => {
    api.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getListings({
      q, categorySlug, verticalType, city, condition,
      sortBy, sortOrder, page, limit: 20,
    }).then((res) => {
      setListings(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
      setLoading(false);
    });
  }, [q, categorySlug, verticalType, city, condition, sort, page]);

  const setParam = (key: string, val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) params.set(key, val);
    else params.delete(key);
    params.delete('page');
    router.push(`/listings?${params}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Sidebar Filters ── */}
      <aside className="lg:w-64 flex-shrink-0 space-y-4">
        <div className="rounded-2xl p-5 space-y-5"
          style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="font-bold text-white text-sm">Filters</h3>

          {/* Vertical type */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#94b4d0' }}>
              Category Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VERTICAL_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setParam('verticalType', f.value)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150"
                  style={verticalType === f.value
                    ? { background: '#0c8fe2', color: 'white' }
                    : { background: 'rgba(22,45,86,0.6)', color: '#94b4d0', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#94b4d0' }}>City</label>
            <select
              value={city}
              onChange={(e) => setParam('city', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'rgba(22,45,86,0.8)', color: '#7cc8fb', border: '1px solid rgba(12,143,226,0.2)' }}
            >
              <option value="">All Cities</option>
              <option value="Garoowe">Garoowe</option>
              <option value="Bosaso">Bosaso</option>
              <option value="Galkayo">Galkayo</option>
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: '#94b4d0' }}>Condition</label>
            <div className="flex flex-wrap gap-1.5">
              {CONDITION_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setParam('condition', c)}
                  className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                  style={condition === c
                    ? { background: '#0c8fe2', color: 'white' }
                    : { background: 'rgba(22,45,86,0.6)', color: '#94b4d0', border: '1px solid rgba(255,255,255,0.07)' }
                  }
                >
                  {c === '' ? 'Any' : c.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: '#94b4d0' }}>Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setParam('categorySlug', e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'rgba(22,45,86,0.8)', color: '#7cc8fb', border: '1px solid rgba(12,143,226,0.2)' }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">
              {q ? `Results for "${q}"` : categorySlug ? `${categorySlug.replace('-', ' & ')} Listings` : 'All Listings'}
            </h1>
            <p className="text-sm" style={{ color: '#94b4d0' }}>
              {loading ? 'Loading...' : `${total.toLocaleString()} listings found`}
              {city && ` in ${city}`}
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'rgba(15,32,64,0.8)', color: '#7cc8fb', border: '1px solid rgba(12,143,226,0.2)' }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,32,64,0.6)' }}>
                <div className="skeleton h-44 w-full" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-4 rounded-full w-3/4" />
                  <div className="skeleton h-3 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">No listings found</h3>
            <p style={{ color: '#94b4d0' }}>Try different search terms or remove some filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setParam('page', String(p))}
                className="w-9 h-9 rounded-lg text-sm font-semibold transition-all"
                style={p === page
                  ? { background: '#0c8fe2', color: 'white' }
                  : { background: 'rgba(15,32,64,0.6)', color: '#94b4d0', border: '1px solid rgba(255,255,255,0.07)' }
                }
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
        </div>
      }>
        <ListingsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
