import Link from 'next/link';
import { Listing } from '../lib/api';
import { formatPrice, getListingImage, getLandmarkDisplay, timeAgo, getConditionLabel, getConditionColor } from '../lib/utils';

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
}

export default function ListingCard({ listing, featured = false }: ListingCardProps) {
  const image = getListingImage(listing);
  const price = formatPrice(listing.price, listing.currency);
  const location = getLandmarkDisplay(listing);
  const ago = timeAgo(listing.createdAt);
  const condColor = getConditionColor(listing.condition);
  const condLabel = getConditionLabel(listing.condition);

  return (
    <Link
      href={`/listing/${listing.slug}`}
      id={`listing-card-${listing.id}`}
      className="listing-card group block"
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? 'h-52' : 'h-44'}`}>
        <img
          src={image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge — vertical type */}
        <div className="absolute top-2 left-2">
          <span className="badge-category">
            {listing.category?.name}
          </span>
        </div>

        {/* Condition */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${condColor}`}
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
            {condLabel}
          </span>
        </div>

        {/* Price — bottom overlay */}
        <div className="absolute bottom-2 left-2">
          <span className="text-xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif', textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>
            {price}
          </span>
          {listing.isNegotiable && (
            <span className="ml-1 text-xs text-blue-300">· Negotiable</span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
          {listing.title}
        </h3>

        {/* Vehicle quick specs */}
        {listing.vehicleDetails && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(12,143,226,0.1)', color: '#7cc8fb' }}>
              {listing.vehicleDetails.year}
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(12,143,226,0.1)', color: '#7cc8fb' }}>
              {listing.vehicleDetails.transmission}
            </span>
            {listing.vehicleDetails.mileageKm && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(12,143,226,0.1)', color: '#7cc8fb' }}>
                {listing.vehicleDetails.mileageKm.toLocaleString()} km
              </span>
            )}
            {listing.vehicleDetails.inspectionPassed && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
                ✓ Inspected
              </span>
            )}
          </div>
        )}

        {/* Property quick specs */}
        {listing.propertyDetails && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(12,143,226,0.1)', color: '#7cc8fb' }}>
              {listing.propertyDetails.transactionType}
            </span>
            {listing.propertyDetails.bedrooms && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(12,143,226,0.1)', color: '#7cc8fb' }}>
                🛏 {listing.propertyDetails.bedrooms} beds
              </span>
            )}
            {listing.propertyDetails.areaSqMeters && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(12,143,226,0.1)', color: '#7cc8fb' }}>
                {listing.propertyDetails.areaSqMeters} m²
              </span>
            )}
          </div>
        )}

        {/* Location & Time */}
        <div className="flex items-center justify-between text-xs mt-1" style={{ color: '#94b4d0' }}>
          <span className="flex items-center gap-1 truncate">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="truncate">{location}</span>
          </span>
          <span className="flex-shrink-0 ml-2">{ago}</span>
        </div>

        {/* Business verified badge */}
        {listing.business?.isVerified && (
          <div className="mt-2 flex items-center gap-1.5">
            {listing.business.logoUrl && (
              <img src={listing.business.logoUrl} alt={listing.business.businessName} className="w-4 h-4 rounded-full object-cover" />
            )}
            <span className="text-xs font-medium" style={{ color: '#94b4d0' }}>{listing.business.businessName}</span>
            <span className="badge-verified">✓ Verified</span>
          </div>
        )}
      </div>
    </Link>
  );
}
