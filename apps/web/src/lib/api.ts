const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// ─── Shared helper ────────────────────────────────────────────────────────────
function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T | null> {
  try {
    const res = await fetch(url, opts);
    const json = await res.json();
    return json.success !== false ? (json.data ?? json) : null;
  } catch {
    return null;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  verticalType: string;
  description?: string;
  commissionRate?: number;
  displayOrder?: number;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  isNegotiable: boolean;
  inventoryCount: number;
  city: string;
  district?: string;
  landmark?: string;
  region?: string;
  country?: string;
  verticalType: string;
  status: string;
  viewsCount: number;
  favoritesCount: number;
  createdAt: string;
  media: { url: string; mediaType: string; sortOrder: number }[];
  category: { id: string; name: string; slug: string; verticalType: string };
  seller: { id: string; fullName: string; avatarUrl?: string; phoneNumber?: string };
  business?: { id: string; businessName: string; slug: string; logoUrl?: string; isVerified: boolean };
  vehicleDetails?: {
    make: string; model: string; year: number; transmission: string;
    fuelType: string; mileageKm?: number; color?: string; inspectionPassed: boolean;
  };
  propertyDetails?: {
    propertyType: string; transactionType: string; bedrooms?: number;
    bathrooms?: number; areaSqMeters?: number; furnished: boolean;
  };
  serviceDetails?: {
    serviceType: string; pricingModel: string; yearsExperience?: number; serviceArea: string;
  };
}

export interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  targetBudget?: number;
  currency: string;
  quantity: number;
  city: string;
  landmark?: string;
  urgency: string;
  status: string;
  createdAt: string;
  category: { id: string; name: string; slug: string; verticalType: string };
  buyer: { id: string; fullName: string; city?: string; avatarUrl?: string; phoneNumber?: string };
  _count?: { offers: number };
  offers?: any[];
}

export interface TransactionItem {
  id: string;
  listingId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  listing: { title: string; slug: string; media?: { url: string }[] };
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  buyerId: string;
  transactionType: string;
  subtotalAmount: number;
  deliveryFee: number;
  commissionAmount: number;
  totalAmount: number;
  currency: string;
  fulfillmentType: string;
  deliveryCity: string;
  deliveryDistrict?: string;
  deliveryLandmark?: string;
  recipientPhone?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: TransactionItem[];
  buyer: { id: string; fullName: string; phoneNumber: string; avatarUrl?: string };
  deliveryJob?: {
    id?: string;
    status: string;
    deliveryPin?: string;
    driverId?: string;
    deliveredAt?: string;
    driver?: {
      user?: {
        fullName?: string;
        phoneNumber?: string;
      };
    };
  };
  disputes?: { id: string; status: string; reason: string }[];
  escrowHold?: { status: string; inspectionDeadline?: string };
  statusHistory?: {
    id?: string;
    fromStatus?: string;
    toStatus: string;
    notes?: string;
    createdAt: string;
  }[];
}

export interface LedgerEntry {
  id: string;
  type: string;  // CREDIT | DEBIT | COMMISSION | PAYOUT | REFUND | ADJUSTMENT
  amount: number;
  balanceAfter: number;
  reference: string;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  currency: string;
  updatedAt: string;
  ledgerEntries: LedgerEntry[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachmentUrl?: string;
  offerAttachment?: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

export interface ChatConversation {
  id: string;
  listingId?: string;
  listing?: {
    id: string;
    slug: string;
    title: string;
    price: number;
    currency: string;
    media?: { url: string }[];
  };
  otherParticipant?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    city?: string;
    verificationStatus?: string;
    businessProfile?: {
      businessName: string;
      logoUrl?: string;
      isVerified: boolean;
    };
  };
  lastMessage?: ChatMessage;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  listingId: string;
  branchId?: string;
  movementType: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  reference?: string;
  notes?: string;
  performedBy?: string;
  createdAt: string;
  listing?: { title: string; slug: string };
}

export interface Dispute {
  id: string;
  transactionId: string;
  raisedById: string;
  reason: string;
  details: string;
  evidenceUrl?: string;
  status: string;
  sellerResponse?: string;
  refundAmount?: number;
  resolution?: string;
  resolvedAt?: string;
  createdAt: string;
  transaction?: { transactionNumber: string; totalAmount: number };
  raisedBy?: { fullName: string; phoneNumber: string };
}

export interface EscrowHold {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  inspectionDays: number;
  inspectionDeadline?: string;
  releasedAt?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

// ─── API object ───────────────────────────────────────────────────────────────
export const api = {
  // ── Categories ──────────────────────────────────────────────────────────────
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_URL}/categories`, { next: { revalidate: 300 } });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const res = await fetch(`${API_URL}/categories/${slug}`, { next: { revalidate: 300 } });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  // ── Listings ─────────────────────────────────────────────────────────────────
  async getListings(params: {
    q?: string;
    categorySlug?: string;
    verticalType?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    sellerId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Promise<PaginatedResponse<Listing>> {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
      });
      const res = await fetch(`${API_URL}/listings?${query}`, { next: { revalidate: 60 } });
      const json = await res.json();
      return json.success
        ? json
        : { success: false, data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    } catch {
      return { success: false, data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
  },

  async getListingBySlug(slug: string): Promise<Listing | null> {
    try {
      const res = await fetch(`${API_URL}/listings/${slug}`, { next: { revalidate: 30 } });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async createListing(data: any, token: string) {
    const res = await fetch(`${API_URL}/listings`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateListing(id: string, data: any, token: string) {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteListing(id: string, token: string) {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return res.json();
  },

  // ── Stores ───────────────────────────────────────────────────────────────────
  async getStore(slug: string) {
    try {
      const res = await fetch(`${API_URL}/stores/${slug}`, { next: { revalidate: 120 } });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  // ── Buyer Requests ────────────────────────────────────────────────────────────
  async getBuyerRequests(params: { categoryId?: string; city?: string; status?: string } = {}): Promise<BuyerRequest[]> {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, String(v)); });
      const res = await fetch(`${API_URL}/requests?${query}`, { next: { revalidate: 30 } });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async createBuyerRequest(data: any, token: string) {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Transactions / Orders ─────────────────────────────────────────────────────
  async getMyOrders(token: string, role: 'buyer' | 'seller' = 'buyer'): Promise<Transaction[]> {
    try {
      const res = await fetch(`${API_URL}/transactions?role=${role}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async getTransaction(id: string, token: string): Promise<Transaction | null> {
    try {
      const res = await fetch(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async createTransaction(data: any, token: string) {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTransactionStatus(id: string, status: string, token: string, notes?: string) {
    const res = await fetch(`${API_URL}/transactions/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },

  // ── Payments ──────────────────────────────────────────────────────────────────
  async initiatePayment(data: {
    transactionId: string;
    provider: string;
    payerPhone?: string;
    amount: number;
    currency?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/payments/initiate`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Wallet & Ledger ───────────────────────────────────────────────────────────
  async getMyWallet(token: string): Promise<Wallet | null> {
    try {
      const res = await fetch(`${API_URL}/transactions/wallet/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async requestPayout(data: {
    amount: number;
    destinationType: string;
    phoneNumber?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/transactions/wallet/payout`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Notifications ─────────────────────────────────────────────────────────────
  async getNotifications(token: string): Promise<Notification[]> {
    try {
      const res = await fetch(`${API_URL}/users/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string, token: string) {
    const res = await fetch(`${API_URL}/users/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    return res.json();
  },

  async markAllNotificationsRead(token: string) {
    const res = await fetch(`${API_URL}/users/notifications/read-all`, {
      method: 'PATCH',
      headers: authHeaders(token),
    });
    return res.json();
  },

  // ── Inventory ─────────────────────────────────────────────────────────────────
  async getStockMovements(listingId: string, token: string): Promise<StockMovement[]> {
    try {
      const res = await fetch(`${API_URL}/inventory/listings/${listingId}/movements`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async recordStockMovement(data: {
    listingId: string;
    movementType: string;
    quantityChange: number;
    notes?: string;
    branchId?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/inventory/movements`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Disputes ──────────────────────────────────────────────────────────────────
  async getMyDisputes(token: string): Promise<Dispute[]> {
    try {
      const res = await fetch(`${API_URL}/disputes`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : [];
    } catch {
      return [];
    }
  },

  async openDispute(data: {
    transactionId: string;
    reason: string;
    details: string;
    evidenceUrl?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/disputes`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Escrow ────────────────────────────────────────────────────────────────────
  async getEscrowHold(transactionId: string, token: string): Promise<EscrowHold | null> {
    try {
      const res = await fetch(`${API_URL}/escrow/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  async releaseEscrow(transactionId: string, token: string) {
    const res = await fetch(`${API_URL}/escrow/${transactionId}/release`, {
      method: 'POST',
      headers: authHeaders(token),
    });
    return res.json();
  },

  // ── Search ────────────────────────────────────────────────────────────────────
  async search(q: string, params: {
    verticalType?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    categorySlug?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<Listing>> {
    return api.getListings({ q, ...params });
  },

  // ── Authentication ────────────────────────────────────────────────────────────
  async sendOtp(phoneNumber: string) {
    const res = await fetch(`${API_URL}/auth/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });
    return res.json();
  },

  async verifyOtp(phoneNumber: string, code: string) {
    const res = await fetch(`${API_URL}/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, code }),
    });
    return res.json();
  },

  async loginWithPassword(phoneNumber: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password }),
    });
    return res.json();
  },

  async registerUser(data: { phoneNumber: string; fullName: string; city?: string; password?: string }) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe(token: string) {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      return await res.json();
    } catch {
      return { success: false, data: null };
    }
  },

  // ── Stores & Business ─────────────────────────────────────────────────────────
  async createBusinessStore(data: {
    businessName: string;
    description?: string;
    city?: string;
    landmark?: string;
    whatsappNumber?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/stores`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addStoreBranch(businessId: string, data: {
    name: string;
    city: string;
    district?: string;
    address?: string;
    phone?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/stores/${businessId}/branches`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addStoreEmployee(businessId: string, data: {
    userId: string;
    role: string;
    branchId?: string;
  }, token: string) {
    const res = await fetch(`${API_URL}/stores/${businessId}/employees`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // ── Admin Control Center ──────────────────────────────────────────────────────
  async getAdminAnalytics(token: string) {
    try {
      const res = await fetch(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      return await res.json();
    } catch {
      return { success: false, data: null };
    }
  },

  async getAdminUsers(token: string, params: { page?: number; limit?: number; role?: string; search?: string } = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
      });
      const res = await fetch(`${API_URL}/admin/users?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      return await res.json();
    } catch {
      return { success: false, data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
  },

  async updateUserStatusAdmin(userId: string, data: { isActive?: boolean; verificationStatus?: string }, token: string) {
    const res = await fetch(`${API_URL}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async moderateListingAdmin(listingId: string, data: { status: string; moderationNotes?: string }, token: string) {
    const res = await fetch(`${API_URL}/admin/listings/${listingId}/moderate`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async processPayoutAdmin(payoutId: string, data: { status: string; adminNotes?: string }, token: string) {
    const res = await fetch(`${API_URL}/admin/payouts/${payoutId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminAuditLogs(token: string, limit = 50) {
    try {
      const res = await fetch(`${API_URL}/admin/audit-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      return await res.json();
    } catch {
      return { success: false, data: [] };
    }
  },

  // ─── Realtime In-App Chat ───────────────────────────────────────────────────
  async getConversations(token: string): Promise<ChatConversation[]> {
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        headers: authHeaders(token),
        cache: 'no-store',
      });
      const data = await res.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  },

  async getOrCreateConversation(recipientId: string, listingId?: string, token?: string): Promise<{ success: boolean; data?: ChatConversation; message?: string }> {
    if (!token) return { success: false, message: 'Authentication required' };
    try {
      const res = await fetch(`${API_URL}/chat/conversations`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ recipientId, listingId }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to initiate conversation' };
    }
  },

  async getMessages(conversationId: string, token: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        headers: authHeaders(token),
        cache: 'no-store',
      });
      const data = await res.json();
      return data.success ? data.data : [];
    } catch {
      return [];
    }
  },

  async sendMessage(conversationId: string, payload: { content?: string; attachmentUrl?: string; offerAttachment?: any }, token: string): Promise<{ success: boolean; data?: ChatMessage; message?: string }> {
    try {
      const res = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Failed to send message' };
    }
  },
};
