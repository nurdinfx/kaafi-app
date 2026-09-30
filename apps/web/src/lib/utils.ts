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
    NEW: 'New (Cusub)',
    LIKE_NEW: 'Like New (Sida Cusub)',
    USED_GOOD: 'Used - Good (Wanaagsan)',
    USED_FAIR: 'Used - Fair (Caadi)',
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

// ── REAL DYNAMIC DATE FORMATTERS (No hardcoded mock dates) ──
export function timeAgo(date?: string | Date): string {
  if (!date) return 'Hadda (Maanta)';
  const parsed = new Date(date).getTime();
  if (isNaN(parsed)) return 'Hadda';
  
  const diff = Date.now() - parsed;
  if (diff < 0) return 'Hadda';

  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Hadda (Hadda uun)';
  if (mins < 60) return `${mins} daqiiqo ka hor`;

  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saac ka hor`;

  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Shalay';
  if (days < 7) return `${days} maalmood ka hor`;

  return new Date(date).toLocaleDateString('so-SO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRealDate(date?: string | Date): string {
  const d = date ? new Date(date) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('so-SO');
  return d.toLocaleDateString('so-SO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function buildWhatsAppLink(phone: string, listing: Listing): string {
  const msg = `Salaan! Waxaan xiiseynayaa alaabtaada: "${listing.title}" — $${listing.price}`;
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
}
