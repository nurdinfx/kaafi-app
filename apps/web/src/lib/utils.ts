import { Listing } from '../lib/api';

export function formatPrice(price: number, currency: string = 'USD'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
  return `${price.toLocaleString()} ${currency}`;
}

export function getConditionLabel(condition: string): string {
  const map: Record<string, string> = {
    NEW: 'New',
    LIKE_NEW: 'Like New',
    USED_GOOD: 'Used - Good',
    USED_FAIR: 'Used - Fair',
  };
  return map[condition] || condition;
}

export function getConditionColor(condition: string): string {
  const map: Record<string, string> = {
    NEW: 'text-emerald-400',
    LIKE_NEW: 'text-green-400',
    USED_GOOD: 'text-amber-400',
    USED_FAIR: 'text-orange-400',
  };
  return map[condition] || 'text-gray-400';
}

export function getVerticalIcon(verticalType: string): string {
  const map: Record<string, string> = {
    VEHICLE: '🚗',
    REAL_ESTATE: '🏢',
    LAND: '📐',
    PRODUCT: '📦',
    SERVICE: '🛠️',
    WHOLESALE: '🏭',
  };
  return map[verticalType] || '📦';
}

export function getListingImage(listing: Listing): string {
  return listing.media?.[0]?.url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600';
}

export function getLandmarkDisplay(listing: Listing): string {
  const parts: string[] = [];
  if (listing.landmark) parts.push(listing.landmark);
  if (listing.district) parts.push(listing.district);
  parts.push(listing.city || 'Garoowe');
  return parts.join(', ');
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function buildWhatsAppLink(phone: string, listing: Listing): string {
  const msg = `Salaan! I'm interested in your listing: "${listing.title}" — $${listing.price}`;
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}
