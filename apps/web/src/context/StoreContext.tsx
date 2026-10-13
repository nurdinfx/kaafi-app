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

export const INITIAL_STORES: MerchantStore[] = [
  {
    id: 'store-shein',
    slug: 'shein-fashion',
    businessName: 'SHEIN Trends Official',
    tagline: 'Fashion for Everyone — Latest Trends & Streetwear',
    bio: 'Meheradda rasmiga ah ee SHEIN Trends. Dharka ugu casrisan ee dumarka, ragga, suudhadhka, iyo joogga xagaaga oo leh tayo sarreysa iyo gaarsiin degdeg ah.',
    logoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=500&fit=crop',
    themeColor: '#000000',
    city: 'Muqdisho',
    district: 'Suuqa Bakaaraha',
    whatsappNumber: '+252615550011',
    phone: '+252615550011',
    isVerified: true,
    rating: 4.85,
    reviewsCount: 3840,
    createdDate: '2025-01-15',
    categories: ['Women Clothing', 'New In', 'Tops & Blouses', 'Sets & Outfits', 'Dresses', 'Denim & Pants'],
    products: [
      {
        id: 'shein-prod-1',
        title: "Aloruh Women's Elegant Spring/Summer Commute Daily Casual Solid White Short Sleeve Pleated Waist Shirt",
        price: 9.99,
        compareAtPrice: 12.99,
        discountPercent: 23,
        images: [
          'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=900',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900',
          'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=900',
        ],
        category: 'Women Clothing',
        stockQuantity: 120,
        sku: 'sz25032291068707691',
        description: 'Blouse qurux badan oo silhouette pleated waist leh, suuf neecaw leh oo ku habboon socodka maalinlaha ah, xafiiska, iyo munaasabadaha xarragada leh.',
        colors: ['White', 'Black', 'Almond Grey', 'Sage Olive'],
        colorVariants: [
          { name: 'White', hex: '#FFFFFF', isHot: true, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=900' },
          { name: 'Black', hex: '#111827', isHot: true, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900' },
          { name: 'Almond Grey', hex: '#D1D5DB', isHot: false, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900' },
          { name: 'Sage Olive', hex: '#6B7280', isHot: false, image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=900' },
        ],
        sizes: ['4 (XXS)', '6 (XS)', '8 (S)', '10 (M)', '12/14 (L)', '16 (XL)', '18 (XXL)'],
        isFeatured: true,
        isPopular: true,
        rating: 4.76,
        reviewsCount: 1042,
        fitBreakdown: {
          small: 9,
          trueToSize: 88,
          large: 3,
        },
        reviewTags: [
          'Fast Logistics (4)',
          'Will Repurchase (1)',
          'Good Fabric Material (100+)',
          'True to Size (50+)',
          'Formal Occasions (10)',
          'Costume (13)',
          'Basic (5)',
        ],
        reviews: [
          {
            id: 'rev-shein-1',
            userName: 'o***1',
            date: '16 Aug, 2025',
            rating: 5,
            overallFit: 'True to Size',
            color: 'White',
            size: 'M',
            comment: 'This top was so so pretty omg get it I love it so much! Material is very soft and durable.',
            images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500'],
            helpfulCount: 177,
            verifiedPurchase: true,
          },
          {
            id: 'rev-shein-2',
            userName: 'a***m',
            date: '14 Aug, 2025',
            rating: 5,
            overallFit: 'True to Size',
            color: 'Black',
            size: 'S',
            comment: 'Quality is unmatched for this price. Perfect waist tuck and comfortable neckline.',
            helpfulCount: 89,
            verifiedPurchase: true,
          },
          {
            id: 'rev-shein-3',
            userName: 'k***9',
            date: '08 Aug, 2025',
            rating: 4,
            overallFit: 'True to Size',
            color: 'White',
            size: 'L',
            comment: 'Very happy with delivery to Somalia! Came within 3 days and fits perfectly.',
            helpfulCount: 43,
            verifiedPurchase: true,
          },
        ],
        storeSlug: 'shein-fashion',
        storeName: 'SHEIN Trends Official',
        condition: 'NEW',
      },
      {
        id: 'shein-prod-2',
        title: "QUELARIE 2pcs/Set Retro Casual Basic Oversized Sweatshirt & Wide Leg Pants",
        price: 17.99,
        compareAtPrice: 24.50,
        discountPercent: 27,
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900',
        ],
        category: 'Sets & Outfits',
        stockQuantity: 65,
        sku: 'SZ-QLR-2PC-002',
        description: 'Labo qaybood oo casri ah oo ka samaysan dhar diirran oo raaxo leh. Ku habboon safarrada, xilliga qabowga iyo xarragada maalinlaha ah.',
        colors: ['Oatmeal Cream', 'Charcoal Grey', 'Chestnut Brown'],
        colorVariants: [
          { name: 'Oatmeal Cream', hex: '#E5E7EB', isHot: true, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900' },
          { name: 'Charcoal Grey', hex: '#374151', isHot: false, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900' },
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.88,
        reviewsCount: 312,
        fitBreakdown: { small: 5, trueToSize: 92, large: 3 },
        reviewTags: ['Comfy (40+)', 'Warm (25+)', 'Fast Shipping'],
        reviews: [
          {
            id: 'rev-qlr-1',
            userName: 's***2',
            date: '10 Aug, 2025',
            rating: 5,
            overallFit: 'True to Size',
            color: 'Oatmeal Cream',
            size: 'M',
            comment: 'Super comfy set! Exactly like the pictures, fabric is thick and soft.',
            helpfulCount: 65,
            verifiedPurchase: true,
          },
        ],
        storeSlug: 'shein-fashion',
        storeName: 'SHEIN Trends Official',
        condition: 'NEW',
      },
      {
        id: 'shein-prod-3',
        title: "SHEIN ICON Casual Washed High Waist Straight Leg Denim Jeans",
        price: 20.49,
        compareAtPrice: 29.99,
        discountPercent: 32,
        images: [
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900',
          'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900',
        ],
        category: 'Denim & Pants',
        stockQuantity: 84,
        sku: 'SZ-ICN-JNS-003',
        description: 'Surwaal jiinis casri ah oo straight leg ah oo leh midab washed brown/vintage ah. Aad ugu habboon kabaha sneakers-ka iyo t-shirts-ka.',
        colors: ['Vintage Washed Brown', 'Classic Denim Blue', 'Pitch Black'],
        colorVariants: [
          { name: 'Vintage Washed Brown', hex: '#5B4033', isHot: true, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900' },
          { name: 'Classic Denim Blue', hex: '#2563EB', isHot: false, image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900' },
        ],
        sizes: ['XS (26)', 'S (28)', 'M (30)', 'L (32)', 'XL (34)'],
        isFeatured: true,
        isPopular: true,
        rating: 4.82,
        reviewsCount: 540,
        fitBreakdown: { small: 7, trueToSize: 89, large: 4 },
        reviewTags: ['True to Size', 'Good Denim', 'Flattering Cut'],
        reviews: [
          {
            id: 'rev-jns-1',
            userName: 'r***a',
            date: '02 Aug, 2025',
            rating: 5,
            overallFit: 'True to Size',
            color: 'Vintage Washed Brown',
            size: 'M (30)',
            comment: 'Hands down best jeans I ordered online. The waist fits snug and legs fall cleanly.',
            helpfulCount: 112,
            verifiedPurchase: true,
          },
        ],
        storeSlug: 'shein-fashion',
        storeName: 'SHEIN Trends Official',
        condition: 'NEW',
      },
      {
        id: 'shein-prod-4',
        title: "Silquee Women's Street Fashion Pleated Graphic Long Sleeve Bodysuit",
        price: 9.11,
        compareAtPrice: 15.00,
        discountPercent: 39,
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900',
          'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=900',
        ],
        category: 'Women Clothing',
        stockQuantity: 95,
        sku: 'SZ-SLQ-PLT-004',
        description: 'Bodysuit farshaxan ah oo leh qaabka daabacan ee casriga ah, aad u jilicsan oo bixiya muuqaal fican.',
        colors: ['Abstract Sunset', 'Monochrome Marble', 'Ocean Wave'],
        colorVariants: [
          { name: 'Abstract Sunset', hex: '#F59E0B', isHot: true, image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900' },
          { name: 'Monochrome Marble', hex: '#1F2937', isHot: false, image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=900' },
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        isFeatured: true,
        isPopular: true,
        rating: 4.79,
        reviewsCount: 198,
        fitBreakdown: { small: 6, trueToSize: 90, large: 4 },
        reviewTags: ['Stretchy (30+)', 'Vibrant Colors', 'Trendy'],
        reviews: [],
        storeSlug: 'shein-fashion',
        storeName: 'SHEIN Trends Official',
        condition: 'NEW',
      },
      {
        id: 'shein-prod-5',
        title: "Women's Retro Short Houndstooth Print Woven Crop Jacket with Pockets",
        price: 30.99,
        compareAtPrice: 45.00,
        discountPercent: 31,
        images: [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900',
        ],
        category: 'Women Clothing',
        stockQuantity: 40,
        sku: 'SZ-HND-JKT-005',
        description: 'Jaakad casri ah oo houndstooth print ah, leh jeebbo ballaaran iyo qaab crop ah oo aad ugu habboon xarragada sare.',
        colors: ['Brown Houndstooth', 'Black & White Tweed'],
        colorVariants: [
          { name: 'Brown Houndstooth', hex: '#78350F', isHot: true, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900' },
          { name: 'Black & White Tweed', hex: '#111827', isHot: false, image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900' },
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.91,
        reviewsCount: 215,
        fitBreakdown: { small: 4, trueToSize: 93, large: 3 },
        reviews: [],
        storeSlug: 'shein-fashion',
        storeName: 'SHEIN Trends Official',
        condition: 'NEW',
      },
      {
        id: 'shein-prod-6',
        title: "Women's White Button-Down Shirt, Chic Ruffle Collar Elegant Blouse",
        price: 11.99,
        compareAtPrice: 18.00,
        discountPercent: 33,
        images: [
          'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=900',
        ],
        category: 'Tops & Blouses',
        stockQuantity: 50,
        sku: 'SZ-WHT-RFL-006',
        description: 'Shaadh cad oo leh qoorta ruffle collar ah, aad u qurux badan oo ku habboon shaqaalaha iyo aroosyada.',
        colors: ['Pure White', 'Soft Ivory'],
        colorVariants: [
          { name: 'Pure White', hex: '#FFFFFF', isHot: true, image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=900' },
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.84,
        reviewsCount: 420,
        fitBreakdown: { small: 8, trueToSize: 89, large: 3 },
        reviews: [],
        storeSlug: 'shein-fashion',
        storeName: 'SHEIN Trends Official',
        condition: 'NEW',
      },
    ],
  },
  {
    id: 'store-hilaac',
    slug: 'hilaac-fashion',
    businessName: 'Hilaac Fashion & Modesty',
    tagline: 'Dharka Dumarka & Raga ee Ugu Tayada Sarreeya Dalka',
    bio: 'Meheradda Hilaac waxay kuu haysaa dharka ugu casrisan ee dumarka iyo raga, abayado, diracyo xariir ah, t-shirts suuf saafi ah, iyo hadiyado gaar ah. Waxaan alaabta gaynaa dhammaan gobollada Soomaaliya.',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    bannerUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
    themeColor: '#ea580c',
    city: 'Garoowe',
    district: 'Suuqa Sare',
    whatsappNumber: '+252907771122',
    phone: '+252907771122',
    isVerified: true,
    rating: 4.9,
    reviewsCount: 480,
    createdDate: '2025-01-20',
    categories: ['Dharka Dumarka', 'Dharka Raga', 'Hijabs & Shawls', 'Kabo & Boorsooyin'],
    products: [
      {
        id: 'hlc-p1',
        title: "Men's Fashion Casual Top Quality 100% Cotton Cool T-Shirt",
        price: 15.16,
        compareAtPrice: 22.00,
        discountPercent: 31,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        ],
        category: 'Dharka Raga',
        stockQuantity: 45,
        sku: 'HLC-TSH-001',
        description: 'T-shirt tayo sare leh oo ka samaysan 100% suuf saafi ah. Waa mid fudud, neecaw leh, isla markaana qurux gaar ah u yeelaya muuqaalkaaga maalinlaha ah.',
        colors: ['White', 'Black', 'Heather Grey'],
        colorVariants: [
          { name: 'White', hex: '#FFFFFF', isHot: true, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800' },
          { name: 'Black', hex: '#111827', isHot: true, image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800' },
        ],
        sizes: ['M', 'L', 'XL', 'XXL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewsCount: 38,
        fitBreakdown: { small: 5, trueToSize: 90, large: 5 },
        reviews: [
          {
            id: 'rev-hlc-1',
            userName: 'm***d',
            date: '20 Aug, 2025',
            rating: 5,
            overallFit: 'True to Size',
            color: 'White',
            size: 'L',
            comment: 'Very soft 100% cotton fabric, doesn\'t shrink after washing. Top quality!',
            helpfulCount: 28,
            verifiedPurchase: true,
          },
        ],
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
    ],
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY = 'kaafi_merchant_stores_v7';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<MerchantStore[]>([]);
  const [currentMerchantStore, setCurrentMerchantStore] = useState<MerchantStore | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStores(parsed);
          return;
        }
      }
      // Initialize with our rich SHEIN & Hilaac stores
      setStores(INITIAL_STORES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STORES));
    } catch (e) {
      console.error('Failed to load stores from localStorage', e);
      setStores(INITIAL_STORES);
    }
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

  // Aggregated all products from all stores
  const allProducts = stores.flatMap((s) => s.products);
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
