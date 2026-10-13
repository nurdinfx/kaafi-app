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

    // Store Creator & Store Builder (Fur Store)
    sb_badge_creator: 'Dukaami Online • Store Creator',
    sb_badge_private_chat: '🔒 100% Private In-App Chat',
    sb_title: 'Dhis & Qurxi Meheraddaada Ganacsi',
    sb_desc: 'Sameyso meherad casri ah oo u gaar ah astaantaada. Macaamiishu waxay toos kuugula xiriirayaan kaliya Chat-ka sugan ee app-ka si xogtaada lambarrada loogu dhowro si buuxda.',
    sb_btn_view_storefront: 'Eeg Storefront-ka Tooska ah',
    sb_label_your_stores: 'Meheraddaada:',
    sb_btn_new_store: '+ Fur Meherad Cusub',
    sb_tab_branding: 'Astaanta, Logo-ga & Cover-ka',
    sb_tab_categories: 'Qaybaha Store-ka (Categories)',
    sb_tab_inventory: 'Maamulka Alaabta (Inventory)',
    sb_section_general_info: 'Macluumaadka Guud ee Meheradda',
    sb_section_general_desc: 'Waxaa loo soo bandhigayaa macaamiisha',
    sb_label_store_name: 'Magaca Store-ka (Business Name)*',
    sb_placeholder_store_name: 'e.g. Hilaac Fashion Store',
    sb_label_store_slug: 'URL Handle / Slug (Link-ga Tooska ah)*',
    sb_label_tagline: 'Halkudhegga Meheradda (Slogan / Tagline)',
    sb_placeholder_tagline: 'e.g. Dharka Dumarka & Raga ee Ugu Tayada Sarreeya Dalka',
    sb_label_bio: 'Faahfaahinta Meheradda (Bio / About)',
    sb_placeholder_bio: 'Ka sheekee badeecooyinka aad iibiso, tayadaada, dammaanadda, iyo goobta aad ku taal...',
    sb_label_city: 'Magaalada (City)',
    sb_label_district: 'Degmada ama Suuqa (District / Market)',
    sb_placeholder_district: 'e.g. Suuqa Bakaaraha, Suuqa Sare',
    sb_privacy_box_title: 'Xogtaada Waa Qarsoodi (No Phone Numbers Required)',
    sb_privacy_box_desc: 'Lambaradaada taleefanka lama weydiinayo lamana muujinayo dukaanka dhexdiisa. Macaamiisha iyo adiga waxaad si toos ah oo aamin ah ugu wada hadli doontaan kaliya Chat-ka Gaarka ah ee App-ka si looga fogaado khaladaadka.',
    sb_section_media: 'Logo & Hero Cover Banner',
    sb_section_media_sub: 'Muuqaalka Astaantaada',
    sb_label_logo_url: 'Sawirka Logo-ga (URL)',
    sb_logo_presets: 'Tusaalooyinka Logo-ga:',
    sb_label_banner_url: 'Sawirka Cover Banner (Dusha Sare ee Storefront-ka)',
    sb_banner_presets: 'Xulo Banner Qosol Leh:',
    sb_btn_save_store: 'Keydi & Daabac Meheraddaada (Save Storefront)',
    sb_preview_title: 'MUUQAALKA TOOSKA AH (LIVE PREVIEW)',
    sb_preview_sub: 'Macaamiishu sidaan ayay u arkaan',
    sb_preview_verified: '✓ Verified Store',
    sb_preview_high_rating: '5.0 (Qiimeyn Sarreysa)',
    sb_preview_items: 'Alaab',
    sb_preview_secure_chat: 'Wadahadal Sugan',
    sb_preview_chat_btn: 'Chat Gaar ah',
    sb_preview_why_no_phone_title: 'Maxaa looga saaray lambarada dadweynaha?',
    sb_preview_why_no_phone_desc: 'Si loo ilaaliyo xogta gaarka ah ee iibiyaha iyo macmiilka, dhammaan iibsiyada iyo su\'aalaha waxaa lagu maareeyaa Chat-ka tooska ah ee nidaamka Fududeeye, kaasoo dammaanad buuxda siinaya alaabta iyo lacagta.',
    sb_cat_title: 'Qaybaha Alaabta ee',
    sb_cat_desc: 'U samee meheraddaada qaybo kala soocan sida Collections (tusaale: Dharka Dumarka, Kabaha, Saacadaha). Qaybaha cusub waxay si toos ah u gelayaan xaaladda sugitaanka (WAIT) ilaa maamulku ansixiyo.',
    sb_cat_input_placeholder: 'Magaca qaybta cusub (e.g. Diracyada Xariirta ah)',
    sb_cat_btn_add: '+ Ku Dar Qayb (WAIT / Sugitaan)',
    sb_cat_waiting_badge: '⏳ WAIT / Sugitaan',
    sb_cat_items_count: 'alaab ah ayaa ku jira',
    sb_cat_delete: '🗑️ Ka saar',
    sb_inv_title: 'Maamulka Alaabta & Stock-ga',
    sb_inv_count_msg: 'Waxaad haysataa badeecadood. Waxaad wax ka beddeli kartaa tirada yaalla bakhaarka, qiimaha, ama ku dari kartaa alaab cusub oo leh kalaro iyo cabirro casri ah sida SHEIN.',
    sb_inv_btn_add_product: '+ Ku Dar Alaab Cusub (SHEIN Style)',
    sb_inv_th_product: 'Alaabta',
    sb_inv_th_category: 'Qaybta',
    sb_inv_th_price: 'Qiimaha',
    sb_inv_th_stock_qty: 'Cadadka Stock-ga',
    sb_inv_th_status: 'Xaaladda Stock-ga',
    sb_inv_th_actions: 'Hawlaha',
    sb_inv_status_in_stock: 'Waa Buuxaa (In Stock)',
    sb_inv_status_low: 'Wuu Gabaabsi yahay',
    sb_inv_status_out: 'Wuu Dhamaaday',
    sb_modal_title: 'Ku Dar Alaab Cusub Stock-gaaga (SHEIN Style)',
    sb_modal_store_label: 'Meheradda:',
    sb_modal_prod_title: 'Magaca Alaabta (Product Title)*',
    sb_modal_prod_category: 'Qaybta (Category)*',
    sb_modal_prod_sku: 'SKU / Koodhka Alaabta',
    sb_modal_price: 'Qiimaha Iibka ($)*',
    sb_modal_compare_price: 'Qiimihii Hore ($ Compare-at)',
    sb_modal_stock: 'Cadadka Stock-ga (Tirada yaalla)',
    sb_modal_main_image: 'Sawirka Weyn (Main Image URL)*',
    sb_modal_extra_images: 'Sawirro Dheeraad ah (Kala saar hakad ",")',
    sb_modal_colors: 'Midabbada & Sawirrada (Kalaro badan sida SHEIN)',
    sb_modal_colors_hint: 'Tusaale: White, Black, Almond, Sage Green',
    sb_modal_sizes: 'Cabbirrada (Sizes - e.g. 4 (XXS), 6 (XS), 8 (S), 10 (M), 12/14 (L), 16 (XL))',
    sb_modal_sizes_hint: 'Tusaale: 4 (XXS), 6 (XS), 8 (S), 10 (M), 12/14 (L), 16 (XL)',
    sb_modal_description: 'Sharaxaadda Alaabta (Description)',
    sb_modal_submit: 'Ku Dar Stock-ga (Add to Catalog)',
    sb_toast_saved: '✓ Xogta meheraddaada si guul leh ayaa loo keydiyay!',
    sb_toast_created: '🎉 Hambalyo! Meheraddaada cusub waa la sameeyay!',
    sb_toast_prod_added: '✓ Alaabta cusub si guul leh ayaa loogu daray Stock-gaaga!',

    // SHEIN Style Details & Customer Reviews
    shein_trends: 'Trends',
    shein_bestseller_badge: '#1 Bestseller in Fashion',
    shein_free_shipping_est: 'Free Shipping & Est. 3 Working Days',
    shein_pay_installments: 'Pay in full, or in 3 instalments with mobile money',
    shein_color_label: 'Color:',
    shein_large_image: 'Large Image',
    shein_size_label: 'Size',
    shein_uk_size: 'UK Size',
    shein_size_guide: 'Size Guide',
    shein_not_your_size: 'Not your size? Tell me your size',
    shein_eligible_delivery: 'eligible for Est. 3 Working Days',
    shein_add_to_cart_btn: 'ADD TO CART',
    shein_points_note: 'Earn loyalty reward points calculated at checkout.',
    shein_shipping_to: 'Shipping to Somalia & East Africa',
    shein_free_returns: '30-Day Free Returns',
    shein_shopping_security: 'Shopping Security',
    shein_safe_payments_badge: 'Safe Payments',
    shein_privacy_protection_badge: 'Privacy Protection',
    shein_sold_by_trader: 'Sold by Business Trader:',
    shein_ships_from: 'Ships from Local Warehouse Hub',
    shein_customer_reviews: 'Customer Reviews',
    shein_view_more: 'View More',
    shein_review_policy: 'Review Policy',
    shein_overall_fit: 'Overall Fit:',
    shein_fit_small: 'Small',
    shein_fit_true: 'True to Size',
    shein_fit_large: 'Large',
    shein_view_local_reviews: 'View Local Somali Reviews',
    shein_write_review: '✍️ Qor Qiimeyn Cusub (Write Review)',
    shein_write_review_title: 'Ku Dar Qiimeyntaada Alaabtan',
    shein_your_name: 'Magacaaga',
    shein_your_rating: 'Xiddigaha (Rating 1 - 5)',
    shein_select_fit: 'Cabirka Muxuu Noqday?',
    shein_select_color: 'Midabka aad qaadatay',
    shein_select_size: 'Cabirka aad qaadatay',
    shein_review_comment: 'Faalladaada iyo aragtidaada alaabta...',
    shein_submit_review: 'Daabac Qiimeynta',
    shein_helpful: 'Helpful',
    shein_verified_purchase: 'Verified Purchase',
    shein_product_description: 'Description & Details',
    shein_more_colors: '+ midabbo kale',
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

    // Store Creator & Store Builder (Fur Store)
    sb_badge_creator: 'دوكامي أونلاين • منشئ المتاجر',
    sb_badge_private_chat: '🔒 محادثة داخلية خاصة ومحمية ١٠٠٪',
    sb_title: 'أنشئ وصمم متجرك التجاري',
    sb_desc: 'صمّم متجراً احترافياً يعبر عن هويتك التجارية. يتواصل معك العملاء مباشرة عبر الشات الداخلي الآمن للتطبيق لحماية أرقامك وبياناتك بالكامل.',
    sb_btn_view_storefront: 'عرض المتجر المباشر',
    sb_label_your_stores: 'متاجرك:',
    sb_btn_new_store: '+ فتح متجر جديد',
    sb_tab_branding: 'الهوية والشعار والغلاف',
    sb_tab_categories: 'أقسام المتجر (التصنيفات)',
    sb_tab_inventory: 'إدارة المنتجات والمخزون',
    sb_section_general_info: 'المعلومات العامة للمتجر',
    sb_section_general_desc: 'يتم عرض هذه البيانات للعملاء في واجهة المتجر',
    sb_label_store_name: 'اسم المتجر التجاري*',
    sb_placeholder_store_name: 'مثال: متجر هلال للأزياء',
    sb_label_store_slug: 'رابط المتجر المباشر (URL Slug)*',
    sb_label_tagline: 'شعار المتجر (Slogan / Tagline)',
    sb_placeholder_tagline: 'مثال: أرقى وأجود الملابس العصرية والإكسسوارات',
    sb_label_bio: 'نبذة عن المتجر (Bio / About)',
    sb_placeholder_bio: 'اكتب نبذة تعريفية بالمنتجات، الجودة، الضمان، وموقع المحل التجاري...',
    sb_label_city: 'المدينة',
    sb_label_district: 'الحي أو السوق',
    sb_placeholder_district: 'مثال: سوق بكارة، السوق الكبير',
    sb_privacy_box_title: 'بياناتك وخصوصيتك في أمان تام (بدون كشف أرقام الهواتف)',
    sb_privacy_box_desc: 'لن يُطلب منك رقم هاتفك ولن يظهر للعامة أبداً. تتم جميع محادثات البيع والشراء حصرياً عبر الشات الداخلي الآمن للتطبيق لضمان حماية الطرفين.',
    sb_section_media: 'شعار المتجر وغلاف الواجهة (Banner)',
    sb_section_media_sub: 'الهوية البصرية لمتجرك',
    sb_label_logo_url: 'رابط صورة الشعار (URL)',
    sb_logo_presets: 'نماذج جاهزة للشعار:',
    sb_label_banner_url: 'رابط غلاف المتجر (Cover Banner)',
    sb_banner_presets: 'اختر غلافاً مميزاً:',
    sb_btn_save_store: 'حفظ ونشر واجهة المتجر (Save Storefront)',
    sb_preview_title: 'المعاينة المباشرة (LIVE PREVIEW)',
    sb_preview_sub: 'هكذا يرى العملاء متجرك التجاري',
    sb_preview_verified: '✓ متجر معتمد',
    sb_preview_high_rating: '٥.٠ (تقييم ممتاز)',
    sb_preview_items: 'منتجات',
    sb_preview_secure_chat: 'محادثة آمنة ومحمية',
    sb_preview_chat_btn: 'محادثة خاصة',
    sb_preview_why_no_phone_title: 'لماذا لا تظهر أرقام الهواتف الشخصية؟',
    sb_preview_why_no_phone_desc: 'لحماية خصوصية التجار والمشترين من الإزعاج والاتصالات غير الموثوقة، تتم جميع الاستفسارات والطلبات عبر الشات الداخلي مع توفير نظام الضمان المتكامل.',
    sb_cat_title: 'أقسام المنتجات لـ',
    sb_cat_desc: 'نظّم منتجاتك في مجموعات واضحة كالمجموعات والتصنيفات (مثل: ملابس نسائية، أحذية، حقائب). تدخل الأقسام الجديدة حالة المراجعة (WAIT) فوراً.',
    sb_cat_input_placeholder: 'اسم القسم الجديد (مثال: فساتين سهرة، أطقم كاجوال...)',
    sb_cat_btn_add: '+ إضافة قسم (قيد الانتظار WAIT)',
    sb_cat_waiting_badge: '⏳ قيد المراجعة / WAIT',
    sb_cat_items_count: 'منتجات في هذا القسم',
    sb_cat_delete: '🗑️ حذف القسم',
    sb_inv_title: 'إدارة المنتجات والمخزون',
    sb_inv_count_msg: 'لديك منتجات مسجلة. يمكنك تعديل الكميات المتوفرة، الأسعار، أو إضافة منتجات جديدة بألوان ومقاسات متعددة على طراز شي إن (SHEIN).',
    sb_inv_btn_add_product: '+ إضافة منتج جديد (طراز شي إن)',
    sb_inv_th_product: 'المنتج',
    sb_inv_th_category: 'القسم',
    sb_inv_th_price: 'السعر',
    sb_inv_th_stock_qty: 'كمية المخزون',
    sb_inv_th_status: 'حالة التوفر',
    sb_inv_th_actions: 'الإجراءات',
    sb_inv_status_in_stock: 'متوفر بكثرة (In Stock)',
    sb_inv_status_low: 'مخزون منخفض',
    sb_inv_status_out: 'نفذت الكمية',
    sb_modal_title: 'إضافة منتج جديد للمخزون (طراز شي إن SHEIN)',
    sb_modal_store_label: 'المتجر:',
    sb_modal_prod_title: 'اسم المنتج (Product Title)*',
    sb_modal_prod_category: 'القسم (Category)*',
    sb_modal_prod_sku: 'رمز المنتج (SKU)',
    sb_modal_price: 'سعر البيع ($)*',
    sb_modal_compare_price: 'السعر الأصلي قبل الخصم ($ Compare-at)',
    sb_modal_stock: 'الكمية المتوفرة بالمخزون',
    sb_modal_main_image: 'رابط الصورة الرئيسية (Main Image URL)*',
    sb_modal_extra_images: 'صور إضافية (مفصولة بفاصلة ",")',
    sb_modal_colors: 'الألوان المتعددة (طراز شي إن)',
    sb_modal_colors_hint: 'مثال: أبيض، أسود، بيج، بني كلاسيكي',
    sb_modal_sizes: 'المقاسات المتوفرة (Sizes - e.g. 4 (XXS), 6 (XS), 8 (S), 10 (M), 12/14 (L), 16 (XL))',
    sb_modal_sizes_hint: 'مثال: 4 (XXS), 6 (XS), 8 (S), 10 (M), 12/14 (L), 16 (XL)',
    sb_modal_description: 'وصف المنتج وتفاصيله (Description)',
    sb_modal_submit: 'إضافة إلى المخزون (Add to Catalog)',
    sb_toast_saved: '✓ تم حفظ بيانات المتجر بنجاح!',
    sb_toast_created: '🎉 مبارك! تم إنشاء متجرك الجديد بنجاح!',
    sb_toast_prod_added: '✓ تمت إضافة المنتج الجديد بنجاح إلى مخزونك!',

    // SHEIN Style Details & Customer Reviews
    shein_trends: 'Trends ترند',
    shein_bestseller_badge: 'الأكثر مبيعاً #1 في الموضة',
    shein_free_shipping_est: 'شحن مجاني وتوصيل تقديري خلال ٣ أيام عمل',
    shein_pay_installments: 'ادفع كاملاً أو على ٣ دفعات ميسرة عبر المحافظ الإلكترونية',
    shein_color_label: 'اللون:',
    shein_large_image: 'تكبير الصورة',
    shein_size_label: 'المقاس',
    shein_uk_size: 'المقاس البريطاني UK',
    shein_size_guide: 'دليل المقاسات',
    shein_not_your_size: 'ليس مقاسك؟ أخبرنا بمقاسك',
    shein_eligible_delivery: 'مؤهل للتوصيل السريع خلال ٣ أيام عمل',
    shein_add_to_cart_btn: 'أضف إلى السلة (ADD TO CART)',
    shein_points_note: 'اكسب نقاط مكافآت تسوق يتم احتسابها عند الدفع.',
    shein_shipping_to: 'الشحن إلى الصومال والقرن الإفريقي',
    shein_free_returns: 'استرجاع مجاني خلال ٣٠ يوماً',
    shein_shopping_security: 'أمان التسوق وحماية المشتري',
    shein_safe_payments_badge: 'دفع إلكتروني آمن ومحمي',
    shein_privacy_protection_badge: 'حماية كاملة للخصوصية',
    shein_sold_by_trader: 'يباع بواسطة التاجر المعتمد:',
    shein_ships_from: 'يشحن من مستودع الصومال المركزي',
    shein_customer_reviews: 'تقييمات وآراء العملاء (Customer Reviews)',
    shein_view_more: 'عرض المزيد',
    shein_review_policy: 'سياسة التقييمات',
    shein_overall_fit: 'ملاءمة المقاس (Overall Fit):',
    shein_fit_small: 'صغير',
    shein_fit_true: 'مطابق للمقاس تماماً',
    shein_fit_large: 'واسع / كبير',
    shein_view_local_reviews: 'عرض التقييمات المحلية في الصومال',
    shein_write_review: '✍️ كتابة تقييم جديد (Write Review)',
    shein_write_review_title: 'أضف تقييمك ورأيك حول هذا المنتج',
    shein_your_name: 'اسمك الكريم',
    shein_your_rating: 'تقييمك بالنجوم (١ إلى ٥)',
    shein_select_fit: 'كيف كان المقاس معك؟',
    shein_select_color: 'اللون الذي طلبته',
    shein_select_size: 'المقاس الذي اخترته',
    shein_review_comment: 'اكتب رأيك وتجربتك مع جودة وخامة المنتج...',
    shein_submit_review: 'نشر التقييم',
    shein_helpful: 'مفيد',
    shein_verified_purchase: 'شراء مؤكد',
    shein_product_description: 'الوصف وتفاصيل المنتج',
    shein_more_colors: '+ ألوان أخرى',
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

    // Store Creator & Store Builder (Fur Store)
    sb_badge_creator: 'Dukaami Online • Store Creator',
    sb_badge_private_chat: '🔒 100% Private In-App Chat',
    sb_title: 'Build & Customize Your Online Store',
    sb_desc: 'Create a modern online storefront tailored to your brand. Customers connect directly through our secure in-app chat, keeping your personal numbers completely private.',
    sb_btn_view_storefront: 'View Live Storefront',
    sb_label_your_stores: 'Your Stores:',
    sb_btn_new_store: '+ Open New Store',
    sb_tab_branding: 'Branding, Logo & Cover',
    sb_tab_categories: 'Store Categories',
    sb_tab_inventory: 'Inventory & Stock Management',
    sb_section_general_info: 'General Store Information',
    sb_section_general_desc: 'Visible to all customers visiting your store',
    sb_label_store_name: 'Store Name (Business Name)*',
    sb_placeholder_store_name: 'e.g. Hilaac Fashion Store',
    sb_label_store_slug: 'Direct URL Slug / Handle*',
    sb_label_tagline: 'Store Slogan / Tagline',
    sb_placeholder_tagline: 'e.g. Premium Fashion & Modesty for Everyone',
    sb_label_bio: 'Store Description (Bio / About)',
    sb_placeholder_bio: 'Tell customers about your products, quality, warranty, and location...',
    sb_label_city: 'City',
    sb_label_district: 'District / Market',
    sb_placeholder_district: 'e.g. Central Market, Bakaro Market',
    sb_privacy_box_title: 'Your Privacy is 100% Protected (No Phone Numbers Required)',
    sb_privacy_box_desc: 'Your personal phone number is never shown publicly. You and your customers communicate safely and exclusively via in-app Private Chat to protect your privacy and guarantee orders.',
    sb_section_media: 'Logo & Hero Cover Banner',
    sb_section_media_sub: 'Visual Brand Identity',
    sb_label_logo_url: 'Store Logo URL',
    sb_logo_presets: 'Quick Logo Presets:',
    sb_label_banner_url: 'Cover Banner Image URL',
    sb_banner_presets: 'Featured Banner Presets:',
    sb_btn_save_store: 'Save & Publish Storefront',
    sb_preview_title: 'LIVE PREVIEW',
    sb_preview_sub: 'How customers will see your storefront',
    sb_preview_verified: '✓ Verified Store',
    sb_preview_high_rating: '5.0 (Top Rated)',
    sb_preview_items: 'Products',
    sb_preview_secure_chat: 'Secure Conversation',
    sb_preview_chat_btn: 'Private Chat',
    sb_preview_why_no_phone_title: 'Why are phone numbers kept private?',
    sb_preview_why_no_phone_desc: 'To protect seller and customer privacy and prevent unsolicited spam, all transactions and inquiries are safely handled via Fududeeye in-app chat with full order protection.',
    sb_cat_title: 'Product Collections for',
    sb_cat_desc: 'Organize your store into clear collections (e.g. Women\'s Clothing, Shoes, Accessories). Newly added categories enter WAIT status until verified.',
    sb_cat_input_placeholder: 'New collection name (e.g. Silk Dresses, Summer Wear)',
    sb_cat_btn_add: '+ Add Category (WAIT / Pending)',
    sb_cat_waiting_badge: '⏳ WAIT / Pending Review',
    sb_cat_items_count: 'items in this category',
    sb_cat_delete: '🗑️ Remove',
    sb_inv_title: 'Product & Stock Management',
    sb_inv_count_msg: 'You have active products in your inventory. You can edit stock quantities, adjust prices, or add new items with multi-colors and sizes like SHEIN.',
    sb_inv_btn_add_product: '+ Add New Product (SHEIN Style)',
    sb_inv_th_product: 'Product',
    sb_inv_th_category: 'Category',
    sb_inv_th_price: 'Price',
    sb_inv_th_stock_qty: 'Stock Qty',
    sb_inv_th_status: 'Stock Status',
    sb_inv_th_actions: 'Actions',
    sb_inv_status_in_stock: 'In Stock',
    sb_inv_status_low: 'Low Stock',
    sb_inv_status_out: 'Out of Stock',
    sb_modal_title: 'Add New Product to Inventory (SHEIN Style)',
    sb_modal_store_label: 'Store:',
    sb_modal_prod_title: 'Product Title*',
    sb_modal_prod_category: 'Category*',
    sb_modal_prod_sku: 'Product SKU',
    sb_modal_price: 'Sale Price ($)*',
    sb_modal_compare_price: 'Original Price ($ Compare-at)',
    sb_modal_stock: 'Available Stock Quantity',
    sb_modal_main_image: 'Main Image URL*',
    sb_modal_extra_images: 'Additional Image URLs (comma separated)',
    sb_modal_colors: 'Multi-Colors & Swatches (SHEIN style)',
    sb_modal_colors_hint: 'e.g. White, Black, Almond, Sage Green',
    sb_modal_sizes: 'Available Sizes (e.g. 4 (XXS), 6 (XS), 8 (S), 10 (M), 12/14 (L), 16 (XL))',
    sb_modal_sizes_hint: 'e.g. 4 (XXS), 6 (XS), 8 (S), 10 (M), 12/14 (L), 16 (XL)',
    sb_modal_description: 'Product Description',
    sb_modal_submit: 'Add to Catalog',
    sb_toast_saved: '✓ Store details saved successfully!',
    sb_toast_created: '🎉 Congratulations! Your new store has been created!',
    sb_toast_prod_added: '✓ New product added successfully to your inventory!',

    // SHEIN Style Details & Customer Reviews
    shein_trends: 'Trends',
    shein_bestseller_badge: '#1 Bestseller in Fashion',
    shein_free_shipping_est: 'Free Shipping & Est. 3 Working Days',
    shein_pay_installments: 'Pay in full, or in 3 instalments with mobile money',
    shein_color_label: 'Color:',
    shein_large_image: 'Large Image',
    shein_size_label: 'Size',
    shein_uk_size: 'UK Size',
    shein_size_guide: 'Size Guide',
    shein_not_your_size: 'Not your size? Tell me your size',
    shein_eligible_delivery: 'eligible for Est. 3 Working Days',
    shein_add_to_cart_btn: 'ADD TO CART',
    shein_points_note: 'Earn loyalty reward points calculated at checkout.',
    shein_shipping_to: 'Shipping to Somalia & East Africa',
    shein_free_returns: '30-Day Free Returns',
    shein_shopping_security: 'Shopping Security',
    shein_safe_payments_badge: 'Safe Payments',
    shein_privacy_protection_badge: 'Privacy Protection',
    shein_sold_by_trader: 'Sold by Business Trader:',
    shein_ships_from: 'Ships from Local Warehouse Hub',
    shein_customer_reviews: 'Customer Reviews',
    shein_view_more: 'View More',
    shein_review_policy: 'Review Policy',
    shein_overall_fit: 'Overall Fit:',
    shein_fit_small: 'Small',
    shein_fit_true: 'True to Size',
    shein_fit_large: 'Large',
    shein_view_local_reviews: 'View Local Somali Reviews',
    shein_write_review: '✍️ Write a Review',
    shein_write_review_title: 'Rate & Review this Product',
    shein_your_name: 'Your Name',
    shein_your_rating: 'Rating (1 - 5 Stars)',
    shein_select_fit: 'How was the fit?',
    shein_select_color: 'Color purchased',
    shein_select_size: 'Size purchased',
    shein_review_comment: 'Share your thoughts and feedback on quality, fabric, and fit...',
    shein_submit_review: 'Submit Review',
    shein_helpful: 'Helpful',
    shein_verified_purchase: 'Verified Purchase',
    shein_product_description: 'Description & Details',
    shein_more_colors: '+ more colors',
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
