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
}

interface StoreContextType {
  stores: MerchantStore[];
  currentMerchantStore: MerchantStore | null;
  setCurrentMerchantStore: (store: MerchantStore | null) => void;
  createStore: (storeData: Partial<MerchantStore>) => MerchantStore;
  updateStore: (slug: string, updates: Partial<MerchantStore>) => void;
  getStoreBySlug: (slug: string) => MerchantStore | undefined;
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

const STORAGE_KEY = 'kaafi_merchant_stores_clean_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<MerchantStore[]>([]);
  const [currentMerchantStore, setCurrentMerchantStore] = useState<MerchantStore | null>(null);
  const [liveProducts, setLiveProducts] = useState<StoreProduct[]>([]);

  useEffect(() => {
    try {
      ['kaafi_merchant_stores_v7', 'kaafi_merchant_stores_v6', 'kaafi_merchant_stores_v5'].forEach((k) => {
        localStorage.removeItem(k);
      });
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter((s: any) => s.id !== 'store-shein' && s.id !== 'store-hilaac' && !s.id.startsWith('shein-'));
          setStores(clean);
        }
      }
    } catch (e) {
      console.error('Failed to load stores from localStorage', e);
    }

    import('../lib/api').then(({ api }) => {
      api.getListings({ limit: 100 })
        .then((res) => {
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
          }
        })
        .catch(() => {});
    });
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

    const newStore: MerchantStore = {
      id: `store-${Date.now()}`,
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
      phone: storeData.phone || '+252907000000',
      isVerified: true,
      rating: 5.0,
      reviewsCount: 1,
      createdDate: new Date().toISOString().split('T')[0],
      categories:
        storeData.categories && storeData.categories.length > 0
          ? storeData.categories
          : ['Guud', 'Women Clothing', 'New In', 'Best Sellers'],
      products: storeData.products || [],
    };

    const updated = [newStore, ...stores];
    saveStores(updated);
    setCurrentMerchantStore(newStore);
    return newStore;
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
  const storeProducts = stores.flatMap((s) => s.products);
  const allProducts = [...liveProducts, ...storeProducts];
  const popularProducts = allProducts.filter((p) => p.isPopular || (p.rating && p.rating >= 4.7));
  const essentialProducts = allProducts.filter(
    (p) => p.category === 'Phone Essentials' || (p.discountPercent && p.discountPercent >= 30)
  );

  return (
    <StoreContext.Provider
      value={{
        stores,
        currentMerchantStore,
        setCurrentMerchantStore,
        createStore,
        updateStore,
        getStoreBySlug,
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
