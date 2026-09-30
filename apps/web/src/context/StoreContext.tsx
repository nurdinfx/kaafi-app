'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  sizes?: string[];
  isFeatured?: boolean;
  rating?: number;
  reviewsCount?: number;
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
  allProducts: StoreProduct[];
  popularProducts: StoreProduct[];
  essentialProducts: StoreProduct[];
}

const INITIAL_STORES: MerchantStore[] = [
  {
    id: 'store-1',
    slug: 'hilaac-fashion',
    businessName: 'Hilaac Fashion & Modesty',
    tagline: 'Dharka Dumarka & Raga ee Ugu Tayada Sarreeya',
    bio: 'Meheradda Hilaac waxay kuu haysaa dharka ugu casrisan ee dumarka iyo raga, abayado, diracyo xariir ah, t-shirts suuf saafi ah, iyo hadiyado gaar ah. Waxaan alaabta gaynaa dhammaan gobollada Soomaaliya.',
    logoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    bannerUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=500&fit=crop',
    themeColor: '#ea580c',
    city: 'Garoowe',
    district: 'Suuqa Sare',
    whatsappNumber: '+252615554433',
    phone: '+252907771122',
    isVerified: true,
    rating: 4.9,
    reviewsCount: 142,
    createdDate: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    categories: ['Dharka Dumarka', 'Dharka Raga', 'Hijabs & Shawls', 'Kabo & Boorsooyin'],
    products: [
      {
        id: 'prod-h1',
        title: 'Men Fashion Casual Top Quality 100% Cotton Cool T-Shirt',
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
        sizes: ['M', 'L', 'XL', 'XXL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewsCount: 38,
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
      {
        id: 'prod-h2',
        title: "Men's Summer Graphic T-Shirt - Bold CAFFEINE & GASOLINE Print",
        price: 15.72,
        compareAtPrice: 25.00,
        discountPercent: 37,
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
          'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800',
        ],
        category: 'Dharka Raga',
        stockQuantity: 28,
        sku: 'HLC-GRP-002',
        description: 'Graphic T-shirt casri ah oo leh qoraal farshaxan ah oo aad u soo jiidasho badan. Ku habboon dhalinyarada iyo socodka xagaaga.',
        colors: ['White', 'Cream', 'Olive'],
        sizes: ['S', 'M', 'L', 'XL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.9,
        reviewsCount: 22,
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
      {
        id: 'prod-h3',
        title: "India Hat Hijabs Cap African Headwrap Ladies Head Wraps Turban",
        price: 5.56,
        compareAtPrice: 10.00,
        discountPercent: 44,
        images: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
          'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=800',
        ],
        category: 'Hijabs & Shawls',
        stockQuantity: 90,
        sku: 'HLC-CAP-003',
        description: 'Koofiyad iyo maro madaxeed aad u qurux badan oo leh kuul iyo luul dhalaalaya. Waxay ku siinaysaa sharaf iyo xarrago heer sare ah munaasabadaha iyo ciidaha.',
        colors: ['Red Diamond', 'Royal Blue', 'Emerald Green', 'Pitch Black'],
        sizes: ['One Size (Elastic)'],
        isFeatured: true,
        isPopular: true,
        rating: 5.0,
        reviewsCount: 54,
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
      {
        id: 'prod-h4',
        title: "New Instant Jersey Hijab Undercap Hijabs For Somali Women",
        price: 7.63,
        compareAtPrice: 14.00,
        discountPercent: 45,
        images: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
        ],
        category: 'Hijabs & Shawls',
        stockQuantity: 120,
        sku: 'HLC-HIJ-004',
        description: 'Hijab Jersey ah oo jilicsan, aan taraaricin, si sahlan loo xidho. Xulasho ballaadhan oo midabbo dabiici ah leh (Nude, Coffee, Caramel, Sage).',
        colors: ['Mocha Brown', 'Dusty Rose', 'Midnight Black', 'Ivory White'],
        sizes: ['Standard 180x70cm'],
        isFeatured: true,
        isPopular: true,
        rating: 4.9,
        reviewsCount: 88,
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
      {
        id: 'prod-h5',
        title: "Men's Linen Long Sleeve Casual Shirt Loose Fit Cotton Linen",
        price: 13.99,
        compareAtPrice: 24.00,
        discountPercent: 42,
        images: [
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        ],
        category: 'Dharka Raga',
        stockQuantity: 34,
        sku: 'HLC-LIN-005',
        description: 'Shaadh Linen & Cotton ah oo jilicsan, gacmo-dheer leh oo loogu talagalay cimilada diirran. Waxay siinaysaa qofka xidha raaxo iyo xarrago dabiici ah.',
        colors: ['Sage Green', 'Sky Blue', 'Pure White', 'Beige Sand'],
        sizes: ['M', 'L', 'XL'],
        isFeatured: true,
        isPopular: true,
        rating: 4.7,
        reviewsCount: 19,
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
      {
        id: 'prod-h6',
        title: "Men's Custom T-shirt With Your Own Logo Text And Photo Print",
        price: 12.68,
        compareAtPrice: 19.99,
        discountPercent: 36,
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
        ],
        category: 'Dharka Raga',
        stockQuantity: 50,
        sku: 'HLC-CUS-006',
        description: 'Ku daabaco fariintaada, sawirkaaga, ama calaamadda shirkaddaada T-shirt suuf saafi ah. Daabacaad dhalaalaysa oo aan go’in ama dhiqin.',
        colors: ['White', 'Black'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        isFeatured: false,
        isPopular: true,
        rating: 4.8,
        reviewsCount: 15,
        storeSlug: 'hilaac-fashion',
        storeName: 'Hilaac Fashion & Modesty',
        condition: 'NEW',
      },
    ],
  },
  {
    id: 'store-2',
    slug: 'somali-tech',
    businessName: 'Somali Tech & Electronics Hub',
    tagline: 'Qalabka Casriga ah, Kaamirooyinka CCTV & Moobilada',
    bio: 'Xarunta Somali Tech Hub waa meesha aad ka helayso qalabka elektarooniga ah ee tayada sare leh ee dalka laga helo: CCTV Security cameras, Smartwatches, Mobile accessories, Sound systems, iyo qalabka dayactirka shaashadaha.',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=500&fit=crop',
    themeColor: '#0284c7',
    city: 'Garoowe',
    district: 'Waddada Wadnaha',
    whatsappNumber: '+252618889900',
    phone: '+252906112233',
    isVerified: true,
    rating: 4.9,
    reviewsCount: 310,
    createdDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    categories: ['Kaamirooyinka CCTV', 'Smart Watches', 'Phone Essentials', 'Qalabka Dayactirka', 'Cod-baahiyeyaasha'],
    products: [
      {
        id: 'prod-t1',
        title: '2MP 1080P Full High Definition Security Camera Outdoor/Indoor Infrared Night Vision CCTV',
        price: 34.47,
        compareAtPrice: 65.60,
        discountPercent: 47,
        images: [
          'https://images.unsplash.com/photo-1557862921-37829c790f19?w=800',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
          'https://images.unsplash.com/photo-1580983218765-f663bec07b37?w=800',
        ],
        category: 'Kaamirooyinka CCTV',
        stockQuantity: 45,
        sku: 'E200020460023307HZ',
        description: 'Kaamirada ilaalada tayada sare leh (CCTV Bullet Camera) oo bixisa muuqaal cad 1080P HD habeen iyo maalinba (Infrared Night Vision). Waxay u adkaysataa roobka, kuleylka iyo boorka (IP66 Waterproof). Waxaa si toos ah looga daawan karaa moobilkaaga.',
        colors: ['Ivory White', 'Dark Graphite'],
        isFeatured: true,
        isPopular: true,
        rating: 4.9,
        reviewsCount: 96,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-t2',
        title: '7 in 1 Strap Smart Watch Sports Watch Men Women AMOLED Screen',
        price: 5.61,
        compareAtPrice: 15.00,
        discountPercent: 62,
        images: [
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        ],
        category: 'Smart Watches',
        stockQuantity: 62,
        sku: 'SMT-7ST-002',
        description: 'Saacad Smartwatch ah oo wadata 7 suun oo kala duwan oo midabbo qurxoon leh. Waxay cabbireysaa garaaca wadnaha, tallaabooyinka, hurdada, waxayna qabataa wicitaanada Bluetooth.',
        colors: ['Multi-color 7 Straps Pack'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewsCount: 71,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-t3',
        title: 'OnePlus 4K Ultra HD Action Mini Camera 180 Rotatable Vlog Camera',
        price: 1.22,
        compareAtPrice: 4.50,
        discountPercent: 73,
        images: [
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800',
        ],
        category: 'Kaamirooyinka CCTV',
        stockQuantity: 80,
        sku: 'ONE-ACT-003',
        description: 'Mini Action Camera 4K ah oo 180 digrii wareegi karta, ku habboon vlogs, socdaalka iyo duubista degdegga ah.',
        colors: ['Black'],
        isFeatured: false,
        isPopular: true,
        rating: 4.5,
        reviewsCount: 14,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-t4',
        title: '16MP Digital Camera with 2.4 Inch LCD Screen Vlogging Camera',
        price: 42.83,
        compareAtPrice: 75.00,
        discountPercent: 43,
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
        ],
        category: 'Kaamirooyinka CCTV',
        stockQuantity: 15,
        sku: 'CAM-16MP-004',
        description: 'Kaamirada digital-ka ah oo 16MP ah leh shaashad 2.4 inch ah, xallin sarreeya iyo zoom awood badan.',
        colors: ['Classic Black'],
        isFeatured: false,
        isPopular: true,
        rating: 4.7,
        reviewsCount: 29,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-t5',
        title: 'Outdoor Bluetooth Speaker Portable Wireless 10W Bass Audio',
        price: 25.10,
        compareAtPrice: 50.21,
        discountPercent: 50,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800',
        ],
        category: 'Cod-baahiyeyaasha',
        stockQuantity: 35,
        sku: 'SPK-BT-005',
        description: 'Cod-baahiye Bluetooth ah oo dhawaaq xooggan leh (Super Bass), xadhig-la’aan ku shaqeeya batarigiisuna qaato ilaa 12 saacadood.',
        colors: ['Vibrant Red', 'Midnight Black', 'Army Green'],
        isFeatured: true,
        isPopular: true,
        rating: 4.9,
        reviewsCount: 42,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      // Essential Deals Products (from Screenshot 3)
      {
        id: 'prod-e1',
        title: 'Original Garmin Vivofit 4 Activity Fitness Tracker Step Counter Waterproof',
        price: 36.18,
        compareAtPrice: 200.00,
        discountPercent: 82,
        images: [
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800',
        ],
        category: 'Phone Essentials',
        stockQuantity: 20,
        sku: 'GAR-VIV-001',
        description: 'Fitness tracker heer caalami ah oo u adkaysta biyaha, cabbira talaabooyinka iyo caafimaadka guud.',
        colors: ['Black'],
        isFeatured: false,
        isPopular: false,
        rating: 4.9,
        reviewsCount: 60,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-e2',
        title: 'Luxury Liquid Silicone Case For Samsung Galaxy A14 A24 A34 A54 A15 A25 A35 A55',
        price: 2.96,
        compareAtPrice: 6.04,
        discountPercent: 51,
        images: [
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
        ],
        category: 'Phone Essentials',
        stockQuantity: 150,
        sku: 'SAM-CAS-002',
        description: 'Kiis silicone raaxo leh oo jilicsan oo ka ilaaliya moobilkaaga dhicitaanka iyo xoqidda.',
        colors: ['Mint Green', 'Lavender', 'Dark Blue', 'Matte Black'],
        isFeatured: false,
        isPopular: false,
        rating: 4.8,
        reviewsCount: 88,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-e3',
        title: 'Mobile Phone Battery 3000mAh Premium Replacement High Capacity',
        price: 23.87,
        compareAtPrice: 45.04,
        discountPercent: 47,
        images: [
          'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=800',
        ],
        category: 'Phone Essentials',
        stockQuantity: 40,
        sku: 'BAT-300-003',
        description: 'Batari cusub oo awood badan leh oo loogu talagalay moobilada.',
        colors: ['Standard'],
        isFeatured: false,
        isPopular: false,
        rating: 4.6,
        reviewsCount: 20,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-e4',
        title: 'Travel WiFi Hotspot SIM Slot LED Display 4G 5G Mobile Hotspot 300Mbps',
        price: 20.55,
        compareAtPrice: 41.96,
        discountPercent: 51,
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
        ],
        category: 'Phone Essentials',
        stockQuantity: 30,
        sku: 'WIF-HOT-004',
        description: 'Mifi internet xawaare sare leh oo qaata SIM card-ka Telesom, Hormuud ama Golis. Batarigiisu wuxuu shaqeeyaa 10 saacadood.',
        colors: ['White LED Display'],
        isFeatured: false,
        isPopular: false,
        rating: 4.9,
        reviewsCount: 75,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-e5',
        title: 'Car Charger 250W 5 Ports Fast Charging PD QC3.0 USB C Car Phone Charger Adapter',
        price: 2.88,
        compareAtPrice: 6.70,
        discountPercent: 57,
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800',
        ],
        category: 'Phone Essentials',
        stockQuantity: 110,
        sku: 'CAR-CHG-005',
        description: 'Qalabka dab-qaadaha gaadhiga oo 5 dekadood leh (USB + Type-C) oo si xawli ah u buuxiya 5 moobil isku mar.',
        colors: ['Black LED Ring'],
        isFeatured: false,
        isPopular: false,
        rating: 4.9,
        reviewsCount: 115,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-e6',
        title: 'Tempered Glass Screen Protector for iPad Pro Air 9.7 Inch 2017 2018 Glass',
        price: 2.62,
        compareAtPrice: 5.04,
        discountPercent: 48,
        images: [
          'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
        ],
        category: 'Phone Essentials',
        stockQuantity: 95,
        sku: 'SCR-GLS-006',
        description: 'Muraayad difaac ah oo 9H adag oo ka difaacaysa iPad-ka jabka iyo qashinka.',
        colors: ['Clear HD'],
        isFeatured: false,
        isPopular: false,
        rating: 4.8,
        reviewsCount: 30,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
      {
        id: 'prod-e7',
        title: 'Mobile Screen Repair Clip & Suction Clamp Fixture Tool',
        price: 4.50,
        compareAtPrice: 9.38,
        discountPercent: 52,
        images: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
        ],
        category: 'Qalabka Dayactirka',
        stockQuantity: 40,
        sku: 'REP-CLP-007',
        description: 'Qalabka dayactirka shaashadaha moobilada ee farsamo-yaqaanada.',
        colors: ['Standard Metal'],
        isFeatured: false,
        isPopular: false,
        rating: 4.7,
        reviewsCount: 18,
        storeSlug: 'somali-tech',
        storeName: 'Somali Tech & Electronics Hub',
        condition: 'NEW',
      },
    ],
  },
  {
    id: 'store-3',
    slug: 'dahab-luxury',
    businessName: 'Bakaaraha Dahab & Saacado Luxury',
    tagline: 'Saacadaha Asalka ah ee Raga iyo Dahabka Qurxoon',
    bio: 'Meheradda Dahab & Saacado Luxury waxay ku takhasustay keenista saacadaha Automatic-ka ah ee ragga, silsiladaha qalbiga leh ee lammaanaha, iyo dahabka ugu casrisan ee dalka.',
    logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
    bannerUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1600&h=500&fit=crop',
    themeColor: '#d97706',
    city: 'Muqdisho',
    district: 'Suuqa Bakaaraha',
    whatsappNumber: '+252617772211',
    phone: '+252907008899',
    isVerified: true,
    rating: 4.95,
    reviewsCount: 188,
    createdDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    categories: ['Saacadaha Raga', 'Silsiladaha & Dahabka', 'Saacadaha Dumarka'],
    products: [
      {
        id: 'prod-d1',
        title: 'Automatic Watches for Men Mechanical Genuine Leather Square Dial Luxury',
        price: 31.51,
        compareAtPrice: 55.00,
        discountPercent: 43,
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
        ],
        category: 'Saacadaha Raga',
        stockQuantity: 24,
        sku: 'DAH-WTC-001',
        description: 'Saacad Automatic ah oo aan batari u baahnayn, ku socota dhaqdhaqaaqa gacanta. Dusha sare waa muraayad Crystal Sapphire adag oo aan xoqmin, suunkuna waa harag saafi ah.',
        colors: ['Black Leather with Orange Dial', 'Brown Leather with Gold Dial'],
        isFeatured: true,
        isPopular: true,
        rating: 5.0,
        reviewsCount: 46,
        storeSlug: 'dahab-luxury',
        storeName: 'Bakaaraha Dahab & Saacado Luxury',
        condition: 'NEW',
      },
      {
        id: 'prod-d2',
        title: 'Couple Necklace Heart and Sword Pendant Necklace For Lovers Gift Set',
        price: 1.38,
        compareAtPrice: 2.71,
        discountPercent: 49,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
        ],
        category: 'Silsiladaha & Dahabka',
        stockQuantity: 85,
        sku: 'DAH-NCK-002',
        description: 'Silsilad aad u macaan oo wadnaha iyo seef isku xiran ah oo hadiyad gaar ah u noqota lammaanaha is jecel.',
        colors: ['Silver with Ruby Red Crystal'],
        isFeatured: true,
        isPopular: true,
        rating: 4.8,
        reviewsCount: 33,
        storeSlug: 'dahab-luxury',
        storeName: 'Bakaaraha Dahab & Saacado Luxury',
        condition: 'NEW',
      },
    ],
  },
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<MerchantStore[]>(INITIAL_STORES);
  const [currentMerchantStore, setCurrentMerchantStore] = useState<MerchantStore | null>(null);

  // Load stored stores from localStorage or fallback to INITIAL_STORES
  useEffect(() => {
    try {
      localStorage.removeItem('fududeeye_merchant_stores'); // Clear legacy mock data
      const saved = localStorage.getItem('kaafi_merchant_stores_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStores(parsed);
          return;
        }
      }
      // Save initial
      localStorage.setItem('kaafi_merchant_stores_v4', JSON.stringify(INITIAL_STORES));
    } catch (e) {
      console.error('Failed to load stores from localStorage', e);
    }
  }, []);

  // Save changes
  const saveStores = (updated: MerchantStore[]) => {
    setStores(updated);
    try {
      localStorage.setItem('kaafi_merchant_stores_v4', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist stores to localStorage', e);
    }
  };

  const getStoreBySlug = (slug: string) => {
    return stores.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
  };

  const createStore = (storeData: Partial<MerchantStore>): MerchantStore => {
    const slug = (storeData.slug || storeData.businessName?.toLowerCase().replace(/\s+/g, '-') || `store-${Date.now()}`)
      .replace(/[^a-z0-9-]/g, '');

    const newStore: MerchantStore = {
      id: `store-${Date.now()}`,
      slug,
      businessName: storeData.businessName || 'Meherad Cusub',
      tagline: storeData.tagline || 'Ganacsi Casri ah oo Ku yaalla Soomaaliya',
      bio: storeData.bio || 'Ku soo dhowow meheraddeena rasmiga ah.',
      logoUrl: storeData.logoUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200&h=200&fit=crop',
      bannerUrl: storeData.bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=500&fit=crop',
      themeColor: storeData.themeColor || '#ea580c',
      city: storeData.city || 'Garoowe',
      district: storeData.district || 'Suuqa Dhexe',
      whatsappNumber: storeData.whatsappNumber || '+252615000000',
      phone: storeData.phone || '+252907000000',
      isVerified: true,
      rating: 5.0,
      reviewsCount: 1,
      createdDate: new Date().toISOString().split('T')[0],
      categories: storeData.categories && storeData.categories.length > 0
        ? storeData.categories
        : ['Guud', 'Kuwa Cusub', 'Kuwa Ugu Iibka Badan'],
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

    const discount = productData.compareAtPrice && productData.compareAtPrice > productData.price
      ? Math.round(((productData.compareAtPrice - productData.price) / productData.compareAtPrice) * 100)
      : undefined;

    const newProduct: StoreProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      storeSlug: slug,
      storeName,
      discountPercent: discount || productData.discountPercent,
      rating: 5.0,
      reviewsCount: 1,
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
                merged.discountPercent = Math.round(((merged.compareAtPrice - merged.price) / merged.compareAtPrice) * 100);
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

  // Aggregated all products from all stores
  const allProducts = stores.flatMap((s) => s.products);
  const popularProducts = allProducts.filter((p) => p.isPopular);
  const essentialProducts = allProducts.filter((p) => p.category === 'Phone Essentials' || (p.discountPercent && p.discountPercent >= 45));

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
        allProducts,
        popularProducts,
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
