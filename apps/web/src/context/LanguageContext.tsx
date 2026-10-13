'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'so' | 'ar' | 'en';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'so', name: 'Somali', nativeName: 'Af Soomaali', flag: '🇸🇴', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  so: {
    // Ticker announcements
    ticker_1: '🚚 Gaarsiin Degdeg ah dhammaan Gobollada Soomaaliya',
    ticker_2: '💳 Lacag bixin: EVC Plus · ZAAD · SAHAL · eDahab',
    ticker_3: '🏬 Fur Store-kaaga Online sida Shopify — BILAASH!',
    ticker_4: '⭐ Tayo la hubiyay — Dammaanad 7 Maalmood ah',
    ticker_5: '📦 Dalabso haddeer — ka Hel Galabta',
    ticker_6: '🔥 Qiimaha ugu hooseeya guaranteed — Price Match!',

    // Navbar
    nav_best_sellers: 'Kuwa Ugu Iibka Badan',
    nav_new_in: 'Kuwa Cusub',
    nav_stores: 'Meheradaha',
    nav_open_store: 'Fur Store',
    nav_search_placeholder: 'Raadi badeecooyinka...',
    nav_visual_search: 'Raadi Sawir ahaan',
    nav_login: 'Gal',
    nav_my_account: 'Akoonkayga',
    nav_my_orders: 'Dalabaadka',
    nav_my_store: 'Dhis Store-kaaga',
    nav_wallet: 'Jeebka (Wallet)',
    nav_messages: 'Fariimaha (Chat)',
    nav_admin: 'Admin OS',
    nav_logout: 'Ka Bax',

    // Shein Categories
    cat_categories: 'Categories',
    cat_new_in: 'New In',
    cat_est_workdays: 'Est. 3 Workdays',
    cat_women_clothing: 'Women Clothing',
    cat_beachwear: 'Beachwear',
    cat_curve_plus: 'Curve +',
    cat_kids: 'Kids',
    cat_men_clothing: 'Men Clothing',
    cat_home_living: 'Home & Living',
    cat_underwear_sleepwear: 'Underwear & Sleepwear',
    cat_shoes: 'Shoes',
    cat_jewelry_accessories: 'Jewelry & Accessories',
    cat_beauty_health: 'Beauty & Health',

    // Hero Section - Slide 1 (Fashion)
    hero_fashion_brand: 'DukaamiOnline\nFashion',
    hero_fashion_sub: 'Dharka Dumarka ee Ugu Quruuxda Badan',
    hero_fashion_pill1_title: 'Qaabab',
    hero_fashion_pill1_sub: 'Qurux Badan',
    hero_fashion_pill2_title: 'Tayo',
    hero_fashion_pill2_sub: 'Sare Leh',
    hero_fashion_pill3_title: 'Dukaameysi',
    hero_fashion_pill3_sub: 'Aman Ah',
    hero_fashion_cta: 'Daawo Dharka →',

    // Hero Section - Slide 2 (Tech)
    hero_tech_brand: 'DukaamiOnline\nTech Hub',
    hero_tech_sub: 'Kaamirooyinka CCTV, Moobillada & Qalabka Casriga ah',
    hero_tech_pill1_title: 'HD Quality',
    hero_tech_pill1_sub: 'Xallin Sare',
    hero_tech_pill2_title: 'Gaarsiin',
    hero_tech_pill2_sub: 'Degdeg Ah',
    hero_tech_pill3_title: 'Dammaanad',
    hero_tech_pill3_sub: '1 Sano Ah',
    hero_tech_cta: 'Daawo Qalabka →',

    // Hero Section - Slide 3 (Luxury)
    hero_luxury_brand: 'DukaamiOnline\nLuxury',
    hero_luxury_sub: 'Saacadaha Automatic-ka ah & Dahabka Raaxada',
    hero_luxury_pill1_title: 'Brand Asal',
    hero_luxury_pill1_sub: 'Tayo Heer Sare',
    hero_luxury_pill2_title: 'Dahab & Luul',
    hero_luxury_pill2_sub: 'Dhalaal Joogto',
    hero_luxury_pill3_title: 'Baakidh',
    hero_luxury_pill3_sub: 'Hadiyadeed',
    hero_luxury_cta: 'Daawo Saacadaha →',

    // Trust Badges
    badge_across_somalia: 'Across Somalia',
    badge_across_somalia_sub: 'Gaarsiin degdeg ah dhammaan gobollada',
    badge_premium_quality: 'Premium Quality',
    badge_premium_quality_sub: 'Badeecooyin tayo sare leh oo la hubiyay',
    badge_safe_reliable: 'Safe & Reliable',
    badge_safe_reliable_sub: 'Iibsi aamin ah & lacag bixin xaqiijisan',
    badge_help: "We're Here to Help",
    badge_help_sub: 'Adeeg macaamiil 24/7 diyaar ah',

    // Section 1: Best sellers
    sec_best_sellers_badge: 'Doorashada Ugu Wanaagsan',
    sec_best_sellers_title: 'Kuwa Ugu Iibka Badan',
    sec_view_all_products: 'Daawo Dhammaan Alaabta →',

    // Section 2: Live real market
    sec_live_badge: 'Toos uga Socda Suuqa (Live Real Market)',
    sec_live_title: 'Xayeysiisyada Ugu Dambeeyay',
    sec_live_desc: 'Alaab, gaadiid, guryo & adeegyo hadda la soo dhigay oo leh taariikh dhab ah.',
    sec_all_listings: 'Dhammaan Xayeysiisyada',

    // Section 3: Essentials
    sec_essentials_badge: 'La Muujiyay',
    sec_essentials_title: 'Phone Essentials & Qiimo Dhimis Gaar Ah',
    sec_essentials_desc: 'Qalabka casriga ah ee taleefannada oo leh dhimis gaareysa ilaa -82%',

    // Section 4: Merchant stores
    sec_stores_badge: 'Shopify-Like Stores',
    sec_stores_title: 'Meheradaha Ganacsatada ee Rasmi ah',
    sec_stores_desc: 'Booqo dukaamada xaqiijisan ee gudaha Kaafi, kala xiriir toos Chat-ka sugan.',
    sec_view_store: 'Booqo Store-ka →',

    // Promo banner
    promo_badge: '🔥 Heshiis Gaar Ah',
    promo_title: 'Gadaal u Gal Hargeysa, Muqdisho, iyo Garoowe!',
    promo_sub: 'Waxaan gaynaa dhammaan magaalooyinka waaweyn ee Soomaaliya',
    promo_btn: 'Dukaameyso Haddeer →',

    // Seller Invitation
    invite_badge: '🚀 Ku Iibi DukaamiOnline',
    invite_title: 'Ma rabtaa inaad yeelato Store Online ah sida Shopify?',
    invite_desc: 'Ku dhex sameyso meherad buuxda: ku dar logo-gaaga, cover banner, samayso qaybaha alaabta, maamul stock-gaaga, oo macaamiishu toos ugula xiriiraan Chat-ka app-ka!',
    invite_btn: 'Fur Store-kaaga Bilaash →',
    invite_explore: 'Eeg Meheradaha Kale',

    // Product & Actions
    btn_add_to_cart: 'Ku Dar Shanta',
    btn_buy_now: 'Iibso Hadda',
    btn_chat_seller: 'Chat Gaar ah',
    btn_send_message: 'Fariin U Dir',
    status_in_stock: 'Waa la Helaa (In Stock)',
    status_out_of_stock: 'Wuu Dhamaaday (Out of Stock)',
    label_verified_store: '✓ Verified Store',
    label_tax_included: '✓ Cashuurtu way ku jirtaa',
    label_safe_payment: 'Lacag bixin aamin ah: EVC Plus / eDahab / Sahal / Zaad',
  },

  ar: {
    // Ticker announcements
    ticker_1: '🚚 توصيل سريع لجميع المحافظات في الصومال',
    ticker_2: '💳 طرق الدفع المعتمدة: EVC Plus · ZAAD · SAHAL · eDahab',
    ticker_3: '🏬 افتح متجرك الإلكتروني كالمحترفين — مجاناً!',
    ticker_4: '⭐ جودة أصلية مضمونة — استرجاع خلال ٧ أيام',
    ticker_5: '📦 اطلب الآن — واستلم طلبك مساء اليوم',
    ticker_6: '🔥 أفضل الأسعار المضمونة في السوق!',

    // Navbar
    nav_best_sellers: 'الأكثر مبيعاً',
    nav_new_in: 'وصل حديثاً',
    nav_stores: 'المتاجر',
    nav_open_store: 'افتح متجرك',
    nav_search_placeholder: 'ابحث عن المنتجات والعروض...',
    nav_visual_search: 'بحث بالصور',
    nav_login: 'تسجيل الدخول',
    nav_my_account: 'حسابي',
    nav_my_orders: 'طلباتي',
    nav_my_store: 'إدارة متجري',
    nav_wallet: 'المحفظة',
    nav_messages: 'الرسائل والمحادثات',
    nav_admin: 'لوحة الإدارة',
    nav_logout: 'تسجيل الخروج',

    // Shein Categories
    cat_categories: 'الأقسام',
    cat_new_in: 'وصل حديثاً',
    cat_est_workdays: 'توصيل خلال ٣ أيام',
    cat_women_clothing: 'ملابس نسائية',
    cat_beachwear: 'ملابس الشاطئ',
    cat_curve_plus: 'مقاسات خاصة +',
    cat_kids: 'أطفال',
    cat_men_clothing: 'ملابس رجالية',
    cat_home_living: 'المنزل والمعيشة',
    cat_underwear_sleepwear: 'ملابس النوم والداخلية',
    cat_shoes: 'أحذية',
    cat_jewelry_accessories: 'مجوهرات وإكسسوارات',
    cat_beauty_health: 'الجمال والصحة',

    // Hero Section - Slide 1 (Fashion)
    hero_fashion_brand: 'دوكامي أونلاين\nللأزياء',
    hero_fashion_sub: 'أحدث صيحات الموضة والأزياء النسائية الراقية',
    hero_fashion_pill1_title: 'تصاميم',
    hero_fashion_pill1_sub: 'عصرية وجذابة',
    hero_fashion_pill2_title: 'جودة',
    hero_fashion_pill2_sub: 'عالية ومضمونة',
    hero_fashion_pill3_title: 'تسوق',
    hero_fashion_pill3_sub: 'آمن وموثوق',
    hero_fashion_cta: 'تسوق الأزياء الآن ←',

    // Hero Section - Slide 2 (Tech)
    hero_tech_brand: 'دوكامي أونلاين\nللتقنية',
    hero_tech_sub: 'كاميرات المراقبة، الهواتف الذكية وأحدث الأجهزة الإلكترونية',
    hero_tech_pill1_title: 'دقة فائقة',
    hero_tech_pill1_sub: 'Full HD',
    hero_tech_pill2_title: 'توصيل',
    hero_tech_pill2_sub: 'سريع وفوري',
    hero_tech_pill3_title: 'ضمان',
    hero_tech_pill3_sub: 'لمدة عام كامل',
    hero_tech_cta: 'عرض الإلكترونيات ←',

    // Hero Section - Slide 3 (Luxury)
    hero_luxury_brand: 'دوكامي أونلاين\nللفخامة',
    hero_luxury_sub: 'الساعات السويسرية الأوتوماتيكية والمجوهرات الأصلية',
    hero_luxury_pill1_title: 'ماركات أصلية',
    hero_luxury_pill1_sub: 'مضمونة ١٠٠٪',
    hero_luxury_pill2_title: 'ذهب ومجوهرات',
    hero_luxury_pill2_sub: 'بريق دائم',
    hero_luxury_pill3_title: 'تغليف',
    hero_luxury_pill3_sub: 'هدايا فاخر',
    hero_luxury_cta: 'تسوق الساعات الفاخرة ←',

    // Trust Badges
    badge_across_somalia: 'توصيل لكافة الصومال',
    badge_across_somalia_sub: 'شحن سريع ومباشر لجميع المدن والمحافظات',
    badge_premium_quality: 'جودة استثنائية',
    badge_premium_quality_sub: 'منتجات فحصت بعناية ومعتمدة',
    badge_safe_reliable: 'آمن وموثوق',
    badge_safe_reliable_sub: 'حماية كاملة للمشتري عبر نظام الضمان',
    badge_help: 'خدمة العملاء ٢٤/٧',
    badge_help_sub: 'فريق دعم متواجد دائماً لخدمتك',

    // Section 1: Best sellers
    sec_best_sellers_badge: 'الاختيار الأفضل',
    sec_best_sellers_title: 'المنتجات الأكثر مبيعاً',
    sec_view_all_products: 'عرض جميع المنتجات ←',

    // Section 2: Live real market
    sec_live_badge: 'مباشر من السوق الصومالي',
    sec_live_title: 'أحدث الإعلانات والعروض',
    sec_live_desc: 'عقارات، سيارات، إلكترونيات وخدمات مضافة حديثاً مع تواريخ حقيقية.',
    sec_all_listings: 'جميع الإعلانات',

    // Section 3: Essentials
    sec_essentials_badge: 'عروض مميزة',
    sec_essentials_title: 'مستلزمات الهواتف وخصومات هائلة',
    sec_essentials_desc: 'إكسسوارات وهواتف حديثة بتخفيضات تصل إلى -٨٢٪',

    // Section 4: Merchant stores
    sec_stores_badge: 'متاجر معتمدة',
    sec_stores_title: 'متاجر البائعين الرسمية',
    sec_stores_desc: 'تصفح المتاجر الموثوقة وتواصل معهم مباشرة عبر المحادثة الخاصة الآمنة.',
    sec_view_store: 'زيارة المتجر ←',

    // Promo banner
    promo_badge: '🔥 عرض خاص ومحدود',
    promo_title: 'توصيل فوري إلى مقديشو، هرجيسا، وغاروي!',
    promo_sub: 'نصلك أينما كنت في كافة أرجاء الصومال',
    promo_btn: 'تسوق الآن ←',

    // Seller Invitation
    invite_badge: '🚀 ابدأ البيع معنا',
    invite_title: 'هل ترغب في امتلاك متجر إلكتروني متكامل؟',
    invite_desc: 'أنشئ متجرك مجاناً بالكامل: أضف شعارك، غلاف المتجر، أقسام المنتجات، وتواصل مع زبائنك بأمان عبر شات التطبيق الخاص!',
    invite_btn: 'افتح متجرك مجاناً الآن ←',
    invite_explore: 'تصفح المتاجر الأخرى',

    // Product & Actions
    btn_add_to_cart: 'أضف إلى السلة',
    btn_buy_now: 'اشتري الآن',
    btn_chat_seller: 'محادثة خاصة مع البائع',
    btn_send_message: 'إرسال رسالة',
    status_in_stock: 'متوفر في المخزون',
    status_out_of_stock: 'نفذت الكمية',
    label_verified_store: '✓ متجر موثق',
    label_tax_included: '✓ شامل كافة الرسوم',
    label_safe_payment: 'دفع آمن ومحمي: EVC Plus / eDahab / Sahal / Zaad',
  },

  en: {
    // Ticker announcements
    ticker_1: '🚚 Fast Delivery Across All Regions of Somalia',
    ticker_2: '💳 Secure Payments: EVC Plus · ZAAD · SAHAL · eDahab',
    ticker_3: '🏬 Open Your Online Store like Shopify — 100% FREE!',
    ticker_4: '⭐ Certified Quality — 7-Day Buyer Protection',
    ticker_5: '📦 Order Now — Get Same Day Delivery',
    ticker_6: '🔥 Lowest Prices Guaranteed — Price Match Promise!',

    // Navbar
    nav_best_sellers: 'Best Sellers',
    nav_new_in: 'New In',
    nav_stores: 'Stores',
    nav_open_store: 'Open Store',
    nav_search_placeholder: 'Search products, brands, essentials...',
    nav_visual_search: 'Visual Search',
    nav_login: 'Sign In',
    nav_my_account: 'My Account',
    nav_my_orders: 'My Orders',
    nav_my_store: 'Store Builder',
    nav_wallet: 'Wallet',
    nav_messages: 'Private Chat',
    nav_admin: 'Admin OS',
    nav_logout: 'Sign Out',

    // Shein Categories
    cat_categories: 'Categories',
    cat_new_in: 'New In',
    cat_est_workdays: 'Est. 3 Workdays',
    cat_women_clothing: 'Women Clothing',
    cat_beachwear: 'Beachwear',
    cat_curve_plus: 'Curve +',
    cat_kids: 'Kids',
    cat_men_clothing: 'Men Clothing',
    cat_home_living: 'Home & Living',
    cat_underwear_sleepwear: 'Underwear & Sleepwear',
    cat_shoes: 'Shoes',
    cat_jewelry_accessories: 'Jewelry & Accessories',
    cat_beauty_health: 'Beauty & Health',

    // Hero Section - Slide 1 (Fashion)
    hero_fashion_brand: 'DukaamiOnline\nFashion',
    hero_fashion_sub: 'The Most Elegant Women Fashion & Trends',
    hero_fashion_pill1_title: 'Styles',
    hero_fashion_pill1_sub: 'Trendsetting',
    hero_fashion_pill2_title: 'Quality',
    hero_fashion_pill2_sub: 'Premium Grade',
    hero_fashion_pill3_title: 'Shopping',
    hero_fashion_pill3_sub: 'Safe & Secure',
    hero_fashion_cta: 'Shop Fashion →',

    // Hero Section - Slide 2 (Tech)
    hero_tech_brand: 'DukaamiOnline\nTech Hub',
    hero_tech_sub: 'CCTV Security Cameras, Smartphones & Modern Gadgets',
    hero_tech_pill1_title: 'HD Clarity',
    hero_tech_pill1_sub: 'Ultra Crisp',
    hero_tech_pill2_title: 'Delivery',
    hero_tech_pill2_sub: 'Express Speed',
    hero_tech_pill3_title: 'Warranty',
    hero_tech_pill3_sub: '1-Year Full',
    hero_tech_cta: 'Explore Tech →',

    // Hero Section - Slide 3 (Luxury)
    hero_luxury_brand: 'DukaamiOnline\nLuxury',
    hero_luxury_sub: 'Automatic Timepieces & Fine Gold Jewelry',
    hero_luxury_pill1_title: 'Authentic',
    hero_luxury_pill1_sub: '100% Genuine',
    hero_luxury_pill2_title: 'Precious Gold',
    hero_luxury_pill2_sub: 'Everlasting Luster',
    hero_luxury_pill3_title: 'Packaging',
    hero_luxury_pill3_sub: 'Luxury Boxed',
    hero_luxury_cta: 'Explore Luxury →',

    // Trust Badges
    badge_across_somalia: 'Across Somalia',
    badge_across_somalia_sub: 'Fast express delivery across all regions',
    badge_premium_quality: 'Premium Quality',
    badge_premium_quality_sub: 'Verified items vetted for authenticity',
    badge_safe_reliable: 'Safe & Reliable',
    badge_safe_reliable_sub: 'Protected escrow payment & buyer guarantee',
    badge_help: "We're Here to Help",
    badge_help_sub: '24/7 dedicated customer service ready',

    // Section 1: Best sellers
    sec_best_sellers_badge: 'Top Picks',
    sec_best_sellers_title: 'Best Sellers',
    sec_view_all_products: 'View All Products →',

    // Section 2: Live real market
    sec_live_badge: 'Live Marketplace',
    sec_live_title: 'Latest Listings & Deals',
    sec_live_desc: 'Vehicles, real estate, electronics & services added in real-time.',
    sec_all_listings: 'All Listings',

    // Section 3: Essentials
    sec_essentials_badge: 'Spotlight',
    sec_essentials_title: 'Phone Essentials & Mega Discounts',
    sec_essentials_desc: 'State-of-the-art tech accessories with up to -82% discount',

    // Section 4: Merchant stores
    sec_stores_badge: 'Verified Merchants',
    sec_stores_title: 'Official Merchant Stores',
    sec_stores_desc: 'Visit verified storefronts and communicate safely via in-app private chat.',
    sec_view_store: 'Visit Store →',

    // Promo banner
    promo_badge: '🔥 Special Deal',
    promo_title: 'Delivering to Hargeisa, Mogadishu, and Garowe!',
    promo_sub: 'We reach all major cities and towns across Somalia',
    promo_btn: 'Shop Now →',

    // Seller Invitation
    invite_badge: '🚀 Sell on DukaamiOnline',
    invite_title: 'Ready to launch your own online store?',
    invite_desc: 'Build your storefront in minutes: custom logo, cover banner, product catalog, inventory management, and direct buyer communication through private in-app chat!',
    invite_btn: 'Open Your Store for Free →',
    invite_explore: 'Explore Other Stores',

    // Product & Actions
    btn_add_to_cart: 'Add to Cart',
    btn_buy_now: 'Buy Now',
    btn_chat_seller: 'Chat with Seller',
    btn_send_message: 'Send Message',
    status_in_stock: 'In Stock',
    status_out_of_stock: 'Out of Stock',
    label_verified_store: '✓ Verified Store',
    label_tax_included: '✓ Taxes Included',
    label_safe_payment: 'Secure Payments: EVC Plus / eDahab / Sahal / Premier Bank',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
  currentLangInfo: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'so',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  isRTL: false,
  dir: 'ltr',
  currentLangInfo: LANGUAGES[0],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('so');

  // Load persisted language from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('kaafi_app_language') as Language;
      if (savedLang && (savedLang === 'so' || savedLang === 'ar' || savedLang === 'en')) {
        setLanguageState(savedLang);
        applyDocumentLanguage(savedLang);
      }
    } catch {}
  }, []);

  const applyDocumentLanguage = (lang: Language) => {
    if (typeof document !== 'undefined') {
      const isArabic = lang === 'ar';
      document.documentElement.lang = lang;
      document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
      if (isArabic) {
        document.documentElement.classList.add('rtl-lang');
      } else {
        document.documentElement.classList.remove('rtl-lang');
      }
    }
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('kaafi_app_language', newLang);
    } catch {}
    applyDocumentLanguage(newLang);
  };

  const isRTL = language === 'ar';
  const dir: 'ltr' | 'rtl' = isRTL ? 'rtl' : 'ltr';
  const currentLangInfo = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to Somali then fallback string
    return TRANSLATIONS.so[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
        dir,
        currentLangInfo,
      }}
    >
      <div dir={dir} className={isRTL ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
