import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ShareWhatsAppButton from '../../../components/ShareWhatsAppButton';
import { api } from '../../../lib/api';
import { formatPrice, getLandmarkDisplay, timeAgo, getConditionLabel, buildWhatsAppLink } from '../../../lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await api.getListingBySlug(slug);
  if (!listing) return { title: 'Listing not found — Fududeeye' };
  return {
    title: `${listing.title} — $${listing.price} | Fududeeye Garoowe`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.title} — $${listing.price}`,
      description: listing.description.slice(0, 160),
      images: listing.media?.[0]?.url ? [{ url: listing.media[0].url }] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await api.getListingBySlug(slug);
  if (!listing) notFound();

  const price = formatPrice(listing.price, listing.currency);
  const location = getLandmarkDisplay(listing);
  const ago = timeAgo(listing.createdAt);
  const sellerPhone = (listing.business as any)?.whatsappNumber || listing.seller.phoneNumber || '';
  const sellerWA = buildWhatsAppLink(sellerPhone, listing);

  const specs: { label: string; value: string }[] = [];
  if (listing.vehicleDetails) {
    const v = listing.vehicleDetails;
    specs.push(
      { label: 'Make', value: v.make },
      { label: 'Model', value: v.model },
      { label: 'Year', value: String(v.year) },
      { label: 'Transmission', value: v.transmission },
      { label: 'Fuel Type', value: v.fuelType },
      { label: 'Mileage', value: v.mileageKm ? `${v.mileageKm.toLocaleString()} km` : '—' },
      { label: 'Color', value: v.color || '—' },
      { label: 'Inspection', value: v.inspectionPassed ? '✅ Passed' : '—' },
    );
  } else if (listing.propertyDetails) {
    const p = listing.propertyDetails;
    specs.push(
      { label: 'Type', value: p.propertyType },
      { label: 'Transaction', value: p.transactionType },
      { label: 'Bedrooms', value: p.bedrooms ? String(p.bedrooms) : '—' },
      { label: 'Bathrooms', value: p.bathrooms ? String(p.bathrooms) : '—' },
      { label: 'Area', value: p.areaSqMeters ? `${p.areaSqMeters} m²` : '—' },
      { label: 'Furnished', value: p.furnished ? '✅ Yes' : '❌ No' },
    );
  } else if (listing.serviceDetails) {
    const s = listing.serviceDetails;
    specs.push(
      { label: 'Service Type', value: s.serviceType },
      { label: 'Pricing', value: s.pricingModel },
      { label: 'Experience', value: s.yearsExperience ? `${s.yearsExperience} years` : '—' },
      { label: 'Service Area', value: s.serviceArea },
    );
  }

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#94b4d0' }}>
          <Link href="/" className="hover:text-blue-300">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-blue-300">Listings</Link>
          <span>/</span>
          <Link href={`/listings?categorySlug=${listing.category?.slug}`} className="hover:text-blue-300">
            {listing.category?.name}
          </Link>
          <span>/</span>
          <span className="text-white truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Images + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="rounded-2xl overflow-hidden aspect-video"
              style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {listing.media?.[0] ? (
                <img
                  src={listing.media[0].url}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  {listing.category?.name === 'Vehicles & Automotive' ? '🚗' : '📦'}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.media && listing.media.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.media.slice(1).map((m, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={m.url} alt={`Photo ${i + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white mb-3 text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                About this listing
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#94b4d0' }}>
                {listing.description}
              </p>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h2 className="font-bold text-white mb-4 text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Specifications
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map((spec) => (
                    <div key={spec.label} className="rounded-xl p-3"
                      style={{ background: 'rgba(22,45,86,0.5)', border: '1px solid rgba(12,143,226,0.1)' }}>
                      <div className="text-xs mb-1" style={{ color: '#94b4d0' }}>{spec.label}</div>
                      <div className="text-sm font-semibold text-white">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(15,32,64,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                📍 Location
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(12,143,226,0.15)' }}>
                  📍
                </div>
                <div>
                  <div className="font-semibold text-white">{location}</div>
                  <div className="text-sm mt-0.5" style={{ color: '#94b4d0' }}>
                    {listing.region}, {listing.country}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Price + CTA */}
          <div className="space-y-4">
            {/* Price card */}
            <div className="rounded-2xl p-6 sticky top-24"
              style={{ background: 'rgba(15,32,64,0.7)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)' }}>
              {/* Category badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="badge-category">{listing.category?.name}</span>
                <span className="text-xs" style={{ color: '#94b4d0' }}>{ago}</span>
              </div>

              <h1 className="text-xl font-bold text-white leading-tight mb-4">
                {listing.title}
              </h1>

              {/* Price */}
              <div className="mb-1">
                <span className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {price}
                </span>
                {listing.currency === 'USD' && (
                  <span className="text-sm ml-2" style={{ color: '#94b4d0' }}>USD</span>
                )}
              </div>
              {listing.isNegotiable && (
                <div className="text-xs font-medium mb-5" style={{ color: '#fb923c' }}>
                  💬 Price is negotiable
                </div>
              )}

              {/* Condition */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {getConditionLabel(listing.condition)}
                </span>
                <span className="text-xs" style={{ color: '#94b4d0' }}>
                  👁 {listing.viewsCount} views
                </span>
              </div>

              {/* CTA buttons */}
              <div className="space-y-3">
                <Link
                  href={`/checkout?listingId=${listing.id}`}
                  id="buy-now-btn"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #0c8fe2, #005899)',
                    boxShadow: '0 4px 16px rgba(12,143,226,0.3)',
                  }}
                >
                  <span>⚡</span> Iibso Hadda (Buy Now)
                </Link>

                <Link
                  href={`/chat?recipientId=${listing.seller.id}&listingId=${listing.id}`}
                  id="in-app-chat-btn"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                  }}
                >
                  <span>💬</span> Kula Sheekeyso Iibiyaha (Chat Seller)
                </Link>

                <Link
                  href={`/chat?recipientId=${listing.seller.id}&listingId=${listing.id}`}
                  id="make-offer-btn"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 border"
                  style={{ background: 'rgba(12,143,226,0.12)', border: '1px solid rgba(12,143,226,0.3)', color: '#7cc8fb' }}
                >
                  💰 Samee Dalab (Negotiate in Chat)
                </Link>

                <div
                  className="p-3 rounded-xl text-center text-xs space-y-1"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                >
                  <div className="font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <span>🛡️</span> Escrow Protection
                  </div>
                  <div className="text-[11px]" style={{ color: '#94b4d0' }}>
                    Lacagta waxaad ku bixinaysaa app-ka (EVC, ZAAD, Sahal). Iibiyuhu lacag ma helayo ilaa aad alaabta gacanta ku dhigto.
                  </div>
                </div>
              </div>

              {/* Seller info */}
              <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(22,45,86,0.8)' }}>
                    {listing.seller.avatarUrl
                      ? <img src={listing.seller.avatarUrl} alt={listing.seller.fullName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                    }
                  </div>
                  <div>
                    <Link
                      href={`/users/${listing.seller.id}`}
                      className="font-semibold text-white text-sm hover:text-blue-300 transition-colors"
                    >
                      {listing.seller.fullName}
                    </Link>
                    {listing.business && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs" style={{ color: '#94b4d0' }}>{listing.business.businessName}</span>
                        {listing.business.isVerified && <span className="badge-verified text-xs">✓</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Share */}
              <div className="mt-4 flex gap-2">
                <ShareWhatsAppButton title={listing.title} price={listing.price} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
