'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  overallFit: 'Small' | 'True to Size' | 'Large';
  color?: string;
  size?: string;
  comment: string;
  images?: string[];
  helpfulCount: number;
  verifiedPurchase: boolean;
}

export interface ProductColorVariant {
  name: string;
  hex?: string;
  image?: string;
  isHot?: boolean;
}

export interface StoreProduct {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  images: string[];
  category: string;
  stockQuantity: number;
  sku: string;
  description: string;
  colors?: string[];
  colorVariants?: ProductColorVariant[];
  sizes?: string[];
  isFeatured?: boolean;
  rating?: number;
  reviewsCount?: number;
  reviews?: ProductReview[];
  fitBreakdown?: {
    small: number;
    trueToSize: number;
    large: number;
  };
  reviewTags?: string[];
  storeSlug: string;
  storeName: string;
  condition?: string;
  isPopular?: boolean;
}

export interface MerchantStore {
  id: string;
  slug: string;
  businessName: string;
  tagline: string;
  bio: string;
  logoUrl: string;
  bannerUrl: string;
  themeColor: string;
  city: string;
  district?: string;
  whatsappNumber: string;
  phone: string;
  isVerified: boolean;
  categories: string[];
  products: StoreProduct[];
  rating: number;
  reviewsCount: number;
  createdDate: string;
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
}

interface StoreContextType {
  stores: MerchantStore[];
  verifiedStores: MerchantStore[];
  pendingStores: MerchantStore[];
  currentMerchantStore: MerchantStore | null;
  setCurrentMerchantStore: (store: MerchantStore | null) => void;
  createStore: (storeData: Partial<MerchantStore>) => MerchantStore;
  updateStore: (slug: string, updates: Partial<MerchantStore>) => void;
  verifyStore: (slugOrId: string, isVerified: boolean) => void;
  getStoreBySlug: (slug: string) => MerchantStore | undefined;
  refreshStores: () => Promise<void>;
  addStoreCategory: (slug: string, categoryName: string) => void;
  deleteStoreCategory: (slug: string, categoryName: string) => void;
  addProductToStore: (
    slug: string,
    product: Omit<StoreProduct, 'id' | 'storeSlug' | 'storeName'>
  ) => StoreProduct;
  updateStoreProduct: (slug: string, productId: string, updates: Partial<StoreProduct>) => void;
  deleteStoreProduct: (slug: string, productId: string) => void;
  addProductReview: (
    productId: string,
    review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount' | 'verifiedPurchase'>
  ) => void;
  incrementReviewHelpful: (productId: string, reviewId: string) => void;
  allProducts: StoreProduct[];
  popularProducts: StoreProduct[];
  essentialProducts: StoreProduct[];
}

export const INITIAL_STORES: MerchantStore[] = [];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'kaafi_merchant_stores_clean_v2';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<MerchantStore[]>([]);
  const [currentMerchantStore, setCurrentMerchantStore] = useState<MerchantStore | null>(null);
  const [liveProducts, setLiveProducts] = useState<StoreProduct[]>([]);

  const loadBackendStoresAndListings = async () => {
    try {
      const { api } = await import('../lib/api');
      
      // 1. Fetch public/all stores from backend database
      const dbStores = await api.getStores({ includeUnverified: true });
      if (Array.isArray(dbStores) && dbStores.length > 0) {
        const mappedStores: MerchantStore[] = dbStores.map((bs: any) => ({
            id: bs.id,
            slug: bs.slug,
            businessName: bs.businessName,
            tagline: bs.tagline || 'Ganacsi Casri ah oo Ku yaalla Soomaaliya',
            bio: bs.description || 'Ku soo dhowow meheraddeena rasmiga ah.',
            logoUrl: bs.logoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
            bannerUrl: bs.coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
            themeColor: '#ea580c',
            city: bs.city || 'Garoowe',
            district: bs.landmarkAddress || '',
            whatsappNumber: bs.whatsappNumber || '+252907000000',
            phone: bs.phone || '+252907000000',
            isVerified: !!bs.isVerified,
            rating: bs.rating || 5.0,
            reviewsCount: bs.totalReviews || 0,
            createdDate: bs.createdAt ? new Date(bs.createdAt).toISOString().split('T')[0] : '2026-01-01',
            categories: ['Guud', 'Women Clothing', 'New In', 'Best Sellers'],
            products: (bs.listings || []).map((l: any) => {
              const images = (l.media && l.media.length > 0)
                ? l.media.map((m: any) => m.url)
                : [l.mediaUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
              return {
                id: l.id,
                title: l.title,
                price: l.price,
                compareAtPrice: Math.round(l.price * 1.15 * 100) / 100,
                discountPercent: 15,
                images,
                category: l.category?.name || 'Guud',
                stockQuantity: l.inventoryCount ?? 1,
                sku: `SKU-${l.id.slice(0, 8).toUpperCase()}`,
                description: l.description || '',
                condition: l.condition || 'NEW',
                storeSlug: bs.slug,
                storeName: bs.businessName,
                isPopular: true,
                isFeatured: true,
                rating: 5.0,
                reviewsCount: 0,
                reviews: [],
              };
            }),
          }));

          setStores(mappedStores);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedStores));
          } catch {}
        }

      // 2. Fetch all public listings for marketplace feed
      const res = await api.getListings({ limit: 100 });
      if (res && res.success && Array.isArray(res.data)) {
        const mapped: StoreProduct[] = res.data.map((l: any) => {
          const images = (l.media && l.media.length > 0)
            ? l.media.map((m: any) => m.url)
            : [l.mediaUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
          return {
            id: l.id,
            title: l.title,
            price: l.price,
            compareAtPrice: Math.round(l.price * 1.15 * 100) / 100,
            discountPercent: 15,
            images,
            category: l.category?.name || 'Guud',
            stockQuantity: l.inventoryCount ?? 1,
            sku: `SKU-${l.id.slice(0, 8).toUpperCase()}`,
            description: l.description || '',
            condition: l.condition || 'NEW',
            storeSlug: l.business?.slug || 'admin-store',
            storeName: l.business?.businessName || 'DukaamiOnline Official',
            isPopular: true,
            isFeatured: true,
            rating: 5.0,
            reviewsCount: 0,
            reviews: [],
          };
        });
        setLiveProducts(mapped);
      } else {
        setLiveProducts([]);
      }
    } catch (e) {
      console.warn('Backend store/listing sync:', e);
    }
  };

  useEffect(() => {
    try {
      [
        'kaafi_merchant_stores_clean_v1',
        'kaafi_merchant_stores_v7',
        'kaafi_merchant_stores_v6',
        'kaafi_merchant_stores_v5',
      ].forEach((k) => {
        localStorage.removeItem(k);
      });
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setStores(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load stores from localStorage', e);
    }

    loadBackendStoresAndListings();

    const handleStoresUpdated = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setStores(parsed);
          }
        }
      } catch {}
    };

    window.addEventListener('kaafi_stores_updated', handleStoresUpdated);
    window.addEventListener('storage', handleStoresUpdated);
    return () => {
      window.removeEventListener('kaafi_stores_updated', handleStoresUpdated);
      window.removeEventListener('storage', handleStoresUpdated);
    };
  }, []);

  const saveStores = (updated: MerchantStore[]) => {
    setStores(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist stores to localStorage', e);
    }
  };

  const getStoreBySlug = (slug: string) => {
    return stores.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
  };

  const createStore = (storeData: Partial<MerchantStore>): MerchantStore => {
    const slug = (
      storeData.slug ||
      storeData.businessName?.toLowerCase().replace(/\s+/g, '-') ||
      `store-${Date.now()}`
    ).replace(/[^a-z0-9-]/g, '');

    let ownerId: string | undefined;
    let ownerName: string | undefined;
    let ownerPhone: string | undefined;
    if (typeof window !== 'undefined') {
      try {
        const u = localStorage.getItem('hudisoft_user');
        if (u) {
          const parsed = JSON.parse(u);
          ownerId = parsed.id;
          ownerName = parsed.fullName;
          ownerPhone = parsed.phoneNumber;
        }
      } catch {}
    }

    const newStore: MerchantStore = {
      id: storeData.id || `store-${Date.now()}`,
      slug,
      businessName: storeData.businessName || 'Meherad Cusub',
      tagline: storeData.tagline || 'Ganacsi Casri ah oo Ku yaalla Soomaaliya',
      bio: storeData.bio || 'Ku soo dhowow meheraddeena rasmiga ah.',
      logoUrl:
        storeData.logoUrl ||
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      bannerUrl:
        storeData.bannerUrl ||
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
      themeColor: storeData.themeColor || '#ea580c',
      city: storeData.city || 'Garoowe',
      district: storeData.district || 'Suuqa Sare',
      whatsappNumber: storeData.whatsappNumber || '+252907000000',
      phone: storeData.phone || ownerPhone || '+252907000000',
      isVerified: false, // CRITICAL: Store is UNVERIFIED/PENDING by default until Admin verifies it!
      rating: 5.0,
      reviewsCount: 1,
      createdDate: new Date().toISOString().split('T')[0],
      ownerId,
      ownerName: ownerName || 'Ganacsade',
      ownerPhone: ownerPhone || storeData.phone,
      categories:
        storeData.categories && storeData.categories.length > 0
          ? storeData.categories
          : ['Guud', 'Women Clothing', 'New In', 'Best Sellers'],
      products: storeData.products || [],
    };

    const updated = [newStore, ...stores.filter((s) => s.slug !== slug)];
    saveStores(updated);
    setCurrentMerchantStore(newStore);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kaafi_stores_updated'));
      const token = localStorage.getItem('hudisoft_token');
      if (token) {
        import('../lib/api').then(({ api }) => {
          api.createBusinessStore({
            businessName: newStore.businessName,
            slug: newStore.slug,
            tagline: newStore.tagline,
            description: newStore.bio,
            logoUrl: newStore.logoUrl,
            coverImageUrl: newStore.bannerUrl,
            phone: newStore.phone,
            whatsappNumber: newStore.whatsappNumber,
            city: newStore.city,
            district: newStore.district,
          }, token)
          .then((res) => {
            if (res && res.success && res.data) {
              setStores((curr) =>
                curr.map((s) => (s.slug === slug ? { ...s, id: res.data.id } : s))
              );
            }
          })
          .catch((err) => console.warn('Could not sync store creation to backend:', err));
        });
      }
    }

    return newStore;
  };

  const verifyStore = (slugOrId: string, isVerified: boolean) => {
    const updated = stores.map((s) => {
      if (s.id === slugOrId || s.slug.toLowerCase() === slugOrId.toLowerCase()) {
        return { ...s, isVerified };
      }
      return s;
    });
    saveStores(updated);
    if (
      currentMerchantStore &&
      (currentMerchantStore.id === slugOrId ||
        currentMerchantStore.slug.toLowerCase() === slugOrId.toLowerCase())
    ) {
      setCurrentMerchantStore({ ...currentMerchantStore, isVerified });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kaafi_stores_updated', {
          detail: { slugOrId, isVerified },
        })
      );
      const token = localStorage.getItem('hudisoft_token');
      const targetStore = stores.find(
        (s) => s.id === slugOrId || s.slug.toLowerCase() === slugOrId.toLowerCase()
      );
      if (token && targetStore) {
        import('../lib/api').then(({ api }) => {
          api.updateAdminStoreStatus(targetStore.id, { isVerified }, token).catch(() => {});
        });
      }
    }
  };

  const updateStore = (slug: string, updates: Partial<MerchantStore>) => {
    const updated = stores.map((s) => {
      if (s.slug === slug) {
        return { ...s, ...updates };
      }
      return s;
    });
    saveStores(updated);
    if (currentMerchantStore?.slug === slug) {
      setCurrentMerchantStore({ ...currentMerchantStore, ...updates });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kaafi_stores_updated'));
    }
  };

  const addStoreCategory = (slug: string, categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const updated = stores.map((s) => {
      if (s.slug === slug) {
        if (!s.categories.includes(trimmed)) {
          return { ...s, categories: [...s.categories, trimmed] };
        }
      }
      return s;
    });
    saveStores(updated);
  };

  const deleteStoreCategory = (slug: string, categoryName: string) => {
    const updated = stores.map((s) => {
      if (s.slug === slug) {
        return { ...s, categories: s.categories.filter((c) => c !== categoryName) };
      }
      return s;
    });
    saveStores(updated);
  };

  const addProductToStore = (
    slug: string,
    productData: Omit<StoreProduct, 'id' | 'storeSlug' | 'storeName'>
  ): StoreProduct => {
    const targetStore = getStoreBySlug(slug);
    const storeName = targetStore ? targetStore.businessName : 'Meherad';

    const discount =
      productData.compareAtPrice && productData.compareAtPrice > productData.price
        ? Math.round(
            ((productData.compareAtPrice - productData.price) / productData.compareAtPrice) * 100
          )
        : undefined;

    // Create color variants if color names provided
    const colorList = productData.colors || ['Standard'];
    const colorVariants: ProductColorVariant[] =
      productData.colorVariants ||
      colorList.map((c, i) => ({
        name: c,
        isHot: i === 0,
        image: productData.images[i] || productData.images[0],
      }));

    const newProduct: StoreProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      storeSlug: slug,
      storeName,
      discountPercent: discount || productData.discountPercent,
      rating: 4.85,
      reviewsCount: 1,
      fitBreakdown: { small: 5, trueToSize: 90, large: 5 },
      reviewTags: ['True to Size', 'Good Quality', 'Fast Logistics'],
      reviews: [
        {
          id: `rev-initial-${Date.now()}`,
          userName: 'Customer Verified',
          date: 'Hadda (Just now)',
          rating: 5,
          overallFit: 'True to Size',
          color: colorList[0],
          size: productData.sizes?.[0] || 'M',
          comment: 'Alaab tayo heer sare ah oo aad u qurux badan. Waxaan u helay sida ku cad sawirka!',
          helpfulCount: 1,
          verifiedPurchase: true,
        },
      ],
      colors: colorList,
      colorVariants,
      sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL'],
    };

    const updated = stores.map((s) => {
      if (s.slug === slug) {
        return {
          ...s,
          products: [newProduct, ...s.products],
        };
      }
      return s;
    });

    saveStores(updated);

    // Call backend API asynchronously to create persistent Listing record
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hudisoft_token');
      if (token && targetStore) {
        import('../lib/api').then(({ api }) => {
          api.createListing({
            title: newProduct.title,
            description: newProduct.description,
            price: newProduct.price,
            currency: 'USD',
            categoryId: newProduct.category || 'Women Clothing',
            verticalType: 'PRODUCT',
            condition: newProduct.condition || 'NEW',
            inventoryCount: newProduct.stockQuantity || 1,
            mediaUrls: newProduct.images,
            businessId: targetStore.id.startsWith('store-') ? undefined : targetStore.id,
            city: targetStore.city || 'Garoowe',
          }, token)
          .then((res) => {
            if (res && res.success && res.data) {
              setStores((curr) =>
                curr.map((s) => (s.slug === slug ? {
                  ...s,
                  products: s.products.map((p) => p.id === newProduct.id ? { ...p, id: res.data.id } : p)
                } : s))
              );
            }
          })
          .catch((err) => console.warn('Could not sync product listing to backend:', err));
        });
      }
    }

    return newProduct;
  };

  const updateStoreProduct = (slug: string, productId: string, updates: Partial<StoreProduct>) => {
    const updated = stores.map((s) => {
      if (s.slug === slug) {
        return {
          ...s,
          products: s.products.map((p) => {
            if (p.id === productId) {
              const merged = { ...p, ...updates };
              if (merged.compareAtPrice && merged.compareAtPrice > merged.price) {
                merged.discountPercent = Math.round(
                  ((merged.compareAtPrice - merged.price) / merged.compareAtPrice) * 100
                );
              }
              return merged;
            }
            return p;
          }),
        };
      }
      return s;
    });
    saveStores(updated);
  };

  const deleteStoreProduct = (slug: string, productId: string) => {
    const updated = stores.map((s) => {
      if (s.slug === slug) {
        return {
          ...s,
          products: s.products.filter((p) => p.id !== productId),
        };
      }
      return s;
    });
    saveStores(updated);
  };

  const addProductReview = (
    productId: string,
    reviewData: Omit<ProductReview, 'id' | 'date' | 'helpfulCount' | 'verifiedPurchase'>
  ) => {
    const newRev: ProductReview = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      helpfulCount: 0,
      verifiedPurchase: true,
    };

    const updated = stores.map((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const allRev = [newRev, ...currentReviews];
          const totalRating = allRev.reduce((acc, r) => acc + r.rating, 0);
          const newAvgRating = parseFloat((totalRating / allRev.length).toFixed(2));
          const newReviewsCount = allRev.length;

          // Recalculate fit
          const totalFit = allRev.length;
          const smallCount = allRev.filter((r) => r.overallFit === 'Small').length;
          const trueCount = allRev.filter((r) => r.overallFit === 'True to Size').length;
          const largeCount = allRev.filter((r) => r.overallFit === 'Large').length;

          const fitBreakdown = {
            small: Math.round((smallCount / totalFit) * 100) || 5,
            trueToSize: Math.round((trueCount / totalFit) * 100) || 90,
            large: Math.round((largeCount / totalFit) * 100) || 5,
          };

          return {
            ...p,
            rating: newAvgRating,
            reviewsCount: newReviewsCount,
            reviews: allRev,
            fitBreakdown,
          };
        }
        return p;
      }),
    }));

    saveStores(updated);
  };

  const incrementReviewHelpful = (productId: string, reviewId: string) => {
    const updated = stores.map((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id === productId && p.reviews) {
          return {
            ...p,
            reviews: p.reviews.map((r) => {
              if (r.id === reviewId) {
                return { ...r, helpfulCount: r.helpfulCount + 1 };
              }
              return r;
            }),
          };
        }
        return p;
      }),
    }));

    saveStores(updated);
  };

  // Aggregated all products from real database and merchant stores
  // Only products from VERIFIED stores appear in global marketplace feeds
  const verifiedStores = stores.filter((s) => s.isVerified);
  const pendingStores = stores.filter((s) => !s.isVerified);
  const verifiedStoreProducts = verifiedStores.flatMap((s) => s.products);
  const allProducts = [...liveProducts, ...verifiedStoreProducts];
  const popularProducts = allProducts.filter((p) => p.isPopular || (p.rating && p.rating >= 4.7));
  const essentialProducts = allProducts.filter(
    (p) => p.category === 'Phone Essentials' || (p.discountPercent && p.discountPercent >= 30)
  );

  return (
    <StoreContext.Provider
      value={{
        stores,
        verifiedStores,
        pendingStores,
        currentMerchantStore,
        setCurrentMerchantStore,
        createStore,
        updateStore,
        verifyStore,
        getStoreBySlug,
        refreshStores: loadBackendStoresAndListings,
        addStoreCategory,
        deleteStoreCategory,
        addProductToStore,
        updateStoreProduct,
        deleteStoreProduct,
        addProductReview,
        incrementReviewHelpful,
        allProducts,
        popularProducts: popularProducts.length > 0 ? popularProducts : allProducts,
        essentialProducts,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
