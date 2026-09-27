import { api } from '../lib/api';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CategoryCarousel from '../components/CategoryCarousel';
import ListingCard from '../components/ListingCard';
import Footer from '../components/Footer';
import Link from 'next/link';

export default async function HomePage() {
  const [categories, vehiclesData, reEstate, electronicsData, servicesData] = await Promise.all([
    api.getCategories(),
    api.getListings({ verticalType: 'VEHICLE', limit: 8, city: 'Garoowe' }),
    api.getListings({ verticalType: 'REAL_ESTATE', limit: 6, city: 'Garoowe' }),
    api.getListings({ verticalType: 'PRODUCT', categorySlug: 'electronics', limit: 8 }),
    api.getListings({ verticalType: 'SERVICE', limit: 6 }),
  ]);

  const sections = [
    {
      id: 'vehicles',
      title: '🚗 Vehicles & Automotive',
      subtitle: 'Cars, 4WDs, trucks & motorcycles in Garoowe',
      listings: vehiclesData.data,
      href: '/listings?categorySlug=vehicles',
    },
    {
      id: 'real-estate',
      title: '🏢 Real Estate & Properties',
      subtitle: 'Houses, apartments, shops & offices for rent & sale',
      listings: reEstate.data,
      href: '/listings?categorySlug=real-estate',
    },
    {
      id: 'electronics',
      title: '📱 Electronics & Phones',
      subtitle: 'Smartphones, laptops, accessories & home appliances',
      listings: electronicsData.data,
      href: '/listings?categorySlug=electronics',
    },
    {
      id: 'services',
      title: '🛠️ Services & Professionals',
      subtitle: 'Find skilled workers and professional services',
      listings: servicesData.data,
      href: '/listings?categorySlug=services',
    },
  ];

  return (
    <main>
      <Navbar />
      <HeroSection />
      <CategoryCarousel categories={categories} />

      {/* Curated Sections */}
      {sections.map((section) => (
        section.listings.length > 0 && (
          <section key={section.id} className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {section.title}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: '#94b4d0' }}>
                    {section.subtitle}
                  </p>
                </div>
                <Link
                  href={section.href}
                  id={`view-all-${section.id}`}
                  className="text-sm font-medium transition-colors hidden sm:block"
                  style={{ color: '#7cc8fb' }}
                >
                  View all →
                </Link>
              </div>

              {/* Listings grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {section.listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>

              <div className="mt-4 text-center sm:hidden">
                <Link href={section.href} className="text-sm font-medium" style={{ color: '#7cc8fb' }}>
                  View all {section.title.split(' ').slice(1).join(' ')} →
                </Link>
              </div>
            </div>
          </section>
        )
      ))}

      {/* Request What You Need CTA */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(12,143,226,0.15) 0%, rgba(22,45,86,0.8) 100%)',
              border: '1px solid rgba(12,143,226,0.25)',
            }}>
            {/* Glow effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #0c8fe2, transparent)', filter: 'blur(60px)' }} />
              <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #f97316, transparent)', filter: 'blur(50px)' }} />
            </div>

            <div className="relative">
              <div className="text-4xl mb-3">📋</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Can&apos;t find what you need?
              </h2>
              <p className="text-base mb-6 max-w-lg mx-auto" style={{ color: '#94b4d0' }}>
                Post a <strong className="text-white">Buyer Request</strong> and let verified sellers come to you with offers. Used for vehicles, electronics, land, wholesale goods, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/requests/create"
                  id="cta-request-btn"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                  }}
                >
                  📋 Post a Request
                </Link>
                <Link
                  href="/requests"
                  id="cta-browse-requests-btn"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm border transition-all duration-200"
                  style={{ border: '1px solid rgba(12,143,226,0.4)', color: '#7cc8fb' }}
                >
                  Browse All Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty state when no listings */}
      {sections.every((s) => s.listings.length === 0) && (
        <section className="py-24 text-center">
          <div className="max-w-md mx-auto px-4">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Marketplace Launching in Garoowe!
            </h2>
            <p className="text-base mb-6" style={{ color: '#94b4d0' }}>
              Be among the first sellers on the platform. Post your listings now and reach thousands of buyers across Puntland.
            </p>
            <Link href="/listings/create" id="first-listing-btn"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}>
              + Post Your First Listing
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
