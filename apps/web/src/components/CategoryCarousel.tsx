'use client';

import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  verticalType: string;
}

interface CategoryCarouselProps {
  categories: Category[];
}

const VERTICAL_GRADIENTS: Record<string, string> = {
  VEHICLE: 'linear-gradient(135deg, #1e40af, #3b82f6)',
  REAL_ESTATE: 'linear-gradient(135deg, #065f46, #10b981)',
  LAND: 'linear-gradient(135deg, #78350f, #f59e0b)',
  PRODUCT: 'linear-gradient(135deg, #4c1d95, #8b5cf6)',
  SERVICE: 'linear-gradient(135deg, #0c4a6e, #0ea5e9)',
  WHOLESALE: 'linear-gradient(135deg, #1f2937, #6b7280)',
};

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Browse Categories
            </h2>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              Find exactly what you need in Garoowe & across Puntland
            </p>
          </div>
          <Link
            href="/listings"
            id="view-all-categories-link"
            className="text-sm font-medium transition-colors"
            style={{ color: '#7cc8fb' }}
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/listings?categorySlug=${cat.slug}`}
              id={`category-card-${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all duration-300 cursor-pointer"
              style={{
                background: 'rgba(15,32,64,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = 'translateY(-4px)';
                el.style.borderColor = 'rgba(12,143,226,0.3)';
                el.style.boxShadow = '0 8px 32px rgba(12,143,226,0.15)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = '';
                el.style.borderColor = 'rgba(255,255,255,0.06)';
                el.style.boxShadow = '';
              }}
            >
              {/* Icon bubble */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0"
                style={{ background: VERTICAL_GRADIENTS[cat.verticalType] || VERTICAL_GRADIENTS.PRODUCT }}
              >
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-white leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
