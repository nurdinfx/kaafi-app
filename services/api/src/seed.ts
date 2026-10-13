import bcrypt from 'bcryptjs';
import prisma from './db';

export const seedDatabase = async () => {
  console.log('🌱 Starting Canonical Database Seeding for Garoowe & Somalia Launch Market...');

  // 1. Roles
  const roles = [
    'CUSTOMER',
    'INDIVIDUAL_SELLER',
    'BUSINESS_SELLER',
    'CREATOR',
    'SERVICE_PROVIDER',
    'WHOLESALE_BUYER',
    'WHOLESALE_SELLER',
    'DRIVER',
    'MERCHANT_STAFF',
    'PROPERTY_AGENT',
    'VEHICLE_DEALER',
    'MODERATOR',
    'SUPPORT_AGENT',
    'FINANCE_ADMIN',
    'OPERATIONS_ADMIN',
    'MARKETING_ADMIN',
    'SUPER_ADMIN',
  ];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName, description: `${roleName} capability in Hudi-Soft ecosystem` },
      update: {},
    });
  }
  console.log(`✅ Roles seeded (${roles.length} roles).`);

  // 2. Comprehensive Real Categories Matching Somali Market
  const categoriesData = [
    {
      name: 'Dharka Dumarka & Fashion',
      slug: 'fashion',
      verticalType: 'PRODUCT',
      icon: '👗',
      description: 'Diracyo xariir ah, Abayado casri ah, Gambo, Jalabiya, Hijabs & dharka raga.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Nooca Dharka', key: 'clothingType', type: 'SELECT', isRequired: true, options: 'Dirac,Abaya,T-Shirt,Surwaal,Khamiis,Gambo' },
        { name: 'Cabbirka (Size)', key: 'size', type: 'SELECT', isRequired: false, options: 'S,M,L,XL,XXL,Free Size' },
        { name: 'Midabka', key: 'color', type: 'TEXT', isRequired: false },
      ],
    },
    {
      name: 'Telefoonnada & Electronics',
      slug: 'electronics',
      verticalType: 'PRODUCT',
      icon: '📱',
      description: 'Smartphones, iPhone, Samsung, Laptops, Smartwatches, & Qalabka casriga ah.',
      commissionRate: 4.5,
      attributes: [
        { name: 'Brand', key: 'brand', type: 'SELECT', isRequired: true, options: 'Apple,Samsung,Xiaomi,HP,Dell,Lenovo,Sony,Other' },
        { name: 'Xaaladda (Condition)', key: 'condition', type: 'SELECT', isRequired: true, options: 'Cusub (New),Isticmaal Wacan (Like New),Second Hand (Good)' },
        { name: 'Storage', key: 'storage', type: 'SELECT', isRequired: false, options: '64GB,128GB,256GB,512GB,1TB' },
      ],
    },
    {
      name: 'Gaadiidka & Baabuurta',
      slug: 'vehicles',
      verticalType: 'VEHICLE',
      icon: '🚗',
      description: 'Land Cruiser Prado, Hilux, Vitz, Noah, Booyado, Gaadiid xamuul & Mootooyin.',
      commissionRate: 3.5,
      attributes: [
        { name: 'Make / Shirkadda', key: 'make', type: 'SELECT', isRequired: true, options: 'Toyota,Nissan,Hyundai,Kia,Mitsubishi,Suzuki,Other' },
        { name: 'Model', key: 'model', type: 'TEXT', isRequired: true },
        { name: 'Sanadka (Year)', key: 'year', type: 'NUMBER', isRequired: true },
        { name: 'Gudbinta (Transmission)', key: 'transmission', type: 'SELECT', isRequired: true, options: 'AUTOMATIC,MANUAL' },
        { name: 'Shidaalka (Fuel)', key: 'fuelType', type: 'SELECT', isRequired: true, options: 'PETROL,DIESEL,HYBRID' },
      ],
    },
    {
      name: 'Guryaha & Dhulka (Real Estate)',
      slug: 'real-estate',
      verticalType: 'REAL_ESTATE',
      icon: '🏢',
      description: 'Guryo kiro ah, Guryo iib ah, Dukaamo, Villas, & Xafiisyo ku yaal Garoowe & Puntland.',
      commissionRate: 2.5,
      attributes: [
        { name: 'Nooca Hantida', key: 'propertyType', type: 'SELECT', isRequired: true, options: 'HOUSE,APARTMENT,VILLA,OFFICE,SHOP,WAREHOUSE' },
        { name: 'Kiro mise Iib', key: 'transactionType', type: 'SELECT', isRequired: true, options: 'RENT,SALE' },
        { name: 'Qolalka (Bedrooms)', key: 'bedrooms', type: 'NUMBER', isRequired: false },
        { name: 'Musqulaha (Bathrooms)', key: 'bathrooms', type: 'NUMBER', isRequired: false },
      ],
    },
    {
      name: 'Dhul & Boosas (Land & Plots)',
      slug: 'land',
      verticalType: 'LAND',
      icon: '📐',
      description: 'Boosas deegaan, Dhul ganacsi, & Beeraha Nugaal, Garoowe, iyo magaalooyinka kale.',
      commissionRate: 2.0,
      attributes: [
        { name: 'Nooca Dhulka', key: 'landType', type: 'SELECT', isRequired: true, options: 'DEEGAAN,GANACSI,BEER,DEVELOPMENT' },
        { name: 'Cabbirka (m²)', key: 'areaSqMeters', type: 'NUMBER', isRequired: true },
        { name: 'Xaaladda Dukumiintiga', key: 'documentStatus', type: 'SELECT', isRequired: true, options: 'WARQAD_DOWLADEED,NOTARIYO,HABRAAC_SOCDA' },
      ],
    },
    {
      name: 'Qalabka Guriga & Jikada',
      slug: 'home-living',
      verticalType: 'PRODUCT',
      icon: '🏠',
      description: 'Fadhiga martida, Qalabka jikada, Gogosha, Qaboojiyeyaasha & Nalalka casriga ah.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Qeybta Guriga', key: 'homeSection', type: 'SELECT', isRequired: false, options: 'Jikada,Fadhiga,Jiifka,Musqusha,Beerta' },
      ],
    },
    {
      name: 'Caafimaadka & Qurxinta (Beauty & Oud)',
      slug: 'health-beauty',
      verticalType: 'PRODUCT',
      icon: '✨',
      description: 'Uunsiga carfada leh, Cuud tayo sare leh, Cadarrada dabiiciga ah, & Qurxinta dumarka.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Nooca', key: 'beautyType', type: 'SELECT', isRequired: false, options: 'Uunsi,Cuud,Cadar,Kiriim,Qurxin' },
      ],
    },
    {
      name: 'Caruurta & Alaabta Ciyaarta (Kids)',
      slug: 'kids',
      verticalType: 'PRODUCT',
      icon: '🧸',
      description: 'Dharka caruurta, Alaabta waxbarashada & ciyaarta, Baaskiillada, & Agabka dhallaanka.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Da\'da (Age)', key: 'ageGroup', type: 'SELECT', isRequired: false, options: '0-2 sano,3-5 sano,6-12 sano,13+ sano' },
      ],
    },
    {
      name: 'Adeegyada & Xirfadaha (Services)',
      slug: 'services',
      verticalType: 'SERVICE',
      icon: '🛠️',
      description: 'Makanikada, Korontada, Dhismaha, Rinjiyeynta, Qaboojiyeyaasha, & Gaadiidka.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Nooca Adeegga', key: 'serviceType', type: 'TEXT', isRequired: true },
        { name: 'Qaabka Qiimaha', key: 'pricingModel', type: 'SELECT', isRequired: true, options: 'SAACADLE,QIIMO_GO\'AN,HESHIIS' },
      ],
    },
    {
      name: 'Ganacsiga Jumlada (B2B Wholesale)',
      slug: 'wholesale',
      verticalType: 'WHOLESALE',
      icon: '🏭',
      description: 'Kartoomo jumlad ah, Raashin, Dhar jumlad ah, Qalab dhisid, & Alaab toos uga timid dibadda.',
      commissionRate: 3.0,
      attributes: [
        { name: 'Tirada Ugu Yar (MOQ)', key: 'moq', type: 'NUMBER', isRequired: true },
      ],
    },
  ];

  const categoryMap = new Map<string, any>();

  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        name: cat.name,
        slug: cat.slug,
        verticalType: cat.verticalType,
        icon: cat.icon,
        description: cat.description,
        commissionRate: cat.commissionRate,
        status: 'ACTIVE',
        isActive: true,
      },
      update: {
        name: cat.name,
        verticalType: cat.verticalType,
        icon: cat.icon,
        description: cat.description,
        commissionRate: cat.commissionRate,
        status: 'ACTIVE',
        isActive: true,
      },
    });
    categoryMap.set(cat.slug, category);

    if (cat.attributes) {
      for (const attr of cat.attributes) {
        await prisma.categoryAttribute.upsert({
          where: {
            categoryId_key: {
              categoryId: category.id,
              key: attr.key,
            },
          },
          create: {
            categoryId: category.id,
            name: attr.name,
            key: attr.key,
            type: attr.type,
            isRequired: attr.isRequired,
            options: attr.options || null,
          },
          update: {
            name: attr.name,
            type: attr.type,
            isRequired: attr.isRequired,
            options: attr.options || null,
          },
        });
      }
    }
  }
  console.log(`✅ Real Categories seeded (${categoriesData.length} categories).`);

  // 3. Super Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@Garoowe2026', 10);
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });

  const adminUser = await prisma.user.upsert({
    where: { phoneNumber: '+252907000001' },
    create: {
      phoneNumber: '+252907000001',
      email: 'admin@hudisoft.com',
      passwordHash: adminPasswordHash,
      fullName: 'Super Admin Hudi-Soft',
      city: 'Garoowe',
      verificationStatus: 'VERIFIED',
      wallet: {
        create: { balance: 1000.0, currency: 'USD' },
      },
    },
    update: {},
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
      update: {},
    });
  }

  // 4. Real Verified Business Store ("Hilaac & Dukaami Trading")
  const businessSellerRole = await prisma.role.findUnique({ where: { name: 'BUSINESS_SELLER' } });
  const merchantUser = await prisma.user.upsert({
    where: { phoneNumber: '+252907000002' },
    create: {
      phoneNumber: '+252907000002',
      email: 'sales@dukaamionline.so',
      passwordHash: adminPasswordHash,
      fullName: 'Dukaami Online Merchant',
      city: 'Garoowe',
      verificationStatus: 'VERIFIED',
      wallet: { create: { balance: 850.0, currency: 'USD' } },
    },
    update: {},
  });

  if (businessSellerRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: merchantUser.id, roleId: businessSellerRole.id } },
      create: { userId: merchantUser.id, roleId: businessSellerRole.id },
      update: {},
    });
  }

  const businessStore = await prisma.businessProfile.upsert({
    where: { ownerId: merchantUser.id },
    create: {
      ownerId: merchantUser.id,
      businessName: 'Dukaami Online Store',
      slug: 'dukaami-online',
      tagline: 'Suuqa Ganacsiga Casriga ah ee Garoowe & Puntland',
      description: 'Badeecooyin tayo leh, gaarsiin degdeg ah, iyo adeeg hufan.',
      phone: '+252907000002',
      whatsappNumber: '+252907000002',
      city: 'Garoowe',
      landmarkAddress: 'Suuqa Sare, Wadada Madaxtooyada',
      openingHours: 'Sat - Thu: 7:30 AM - 10:00 PM',
      isVerified: true,
      rating: 4.95,
      totalReviews: 48,
      followersCount: 1250,
      branches: {
        create: [
          {
            branchName: 'Garoowe Main Branch',
            city: 'Garoowe',
            landmark: 'Near Xarunta Gobolka',
            phone: '+252907000002',
          },
        ],
      },
    },
    update: {},
  });

  // 5. Seed Real Initial Listings with Actual Real Timestamps
  const now = Date.now();
  const sampleListings = [
    {
      title: 'Diracyo Xariir ah oo Dhoof ah (Dubai Silk)',
      slug: 'diracyo-xariir-dubai-silk-2026',
      catSlug: 'fashion',
      verticalType: 'PRODUCT',
      price: 28.0,
      currency: 'USD',
      condition: 'NEW',
      description: 'Diracyo tayo aad u sarreeya oo laga keenay Dubai, xariir saafi ah oo jilicsan, midabbo aad u qurux badan oo ku habboon aroosyada iyo munaasabadaha.',
      city: 'Garoowe',
      district: 'Hodan',
      landmark: 'Suuqa Sare, Dukaami Online',
      minutesAgo: 15, // 15 mins ago
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
      ],
    },
    {
      title: 'iPhone 15 Pro Max 256GB Natural Titanium (Original)',
      slug: 'iphone-15-pro-max-natural-titanium-garoowe',
      catSlug: 'electronics',
      verticalType: 'PRODUCT',
      price: 1040.0,
      currency: 'USD',
      condition: 'NEW',
      description: 'iPhone 15 Pro Max 256GB, cusub oo baakadiisa ku jira (Brand New Sealed), Factory Unlocked, dammaanad 1 sano ah.',
      city: 'Garoowe',
      district: 'Israac',
      landmark: 'Wadada 30-ka, kasoo horjeedka Masjidka Weyn',
      minutesAgo: 45, // 45 mins ago
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02543?w=800',
      ],
    },
    {
      title: 'Toyota Land Cruiser Prado TX-L 2021 (Very Clean)',
      slug: 'toyota-land-cruiser-prado-txl-2021-somalia',
      catSlug: 'vehicles',
      verticalType: 'VEHICLE',
      price: 37500.0,
      currency: 'USD',
      condition: 'LIKE_NEW',
      description: 'Toyota Prado TX-L sanadkii 2021, shidaalka Petrol, Automatic, 32,000 KM oo kaliya socotay, taargada Puntland, gudihiisa maqaar nadiif ah.',
      city: 'Garoowe',
      district: 'Wadajir',
      landmark: 'Kasoo horjeedka Xarunta Gobolka Nugaal',
      minutesAgo: 120, // 2 hours ago
      images: [
        'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800',
      ],
      vehicleDetail: {
        make: 'Toyota',
        model: 'Land Cruiser Prado TX-L',
        year: 2021,
        transmission: 'AUTOMATIC',
        fuelType: 'PETROL',
        mileageKm: 32000,
      },
    },
    {
      title: 'Guri Villa Casri ah oo Iib ah (4 Qol & Dayr Weyn)',
      slug: 'villa-casri-ah-iib-garoowe-hodan',
      catSlug: 'real-estate',
      verticalType: 'REAL_ESTATE',
      price: 68000.0,
      currency: 'USD',
      condition: 'NEW',
      description: 'Villa cusub oo qurux badan oo ku taal xaafadda Hodan ee Garoowe. 4 Qol, 3 Musqulood, Fadhi weyn, Jiko casri ah, iyo barxad baabuur.',
      city: 'Garoowe',
      district: 'Hodan',
      landmark: 'Laamiga cusub ee Hodan',
      minutesAgo: 360, // 6 hours ago
      images: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      ],
      propertyDetail: {
        propertyType: 'HOUSE',
        transactionType: 'SALE',
        bedrooms: 4,
        bathrooms: 3,
        areaSqMeters: 400,
        furnished: false,
      },
    },
    {
      title: 'Boos Ganacsi iyo Deegaan 20x20m oo Laamiga Saaran',
      slug: 'boos-ganacsi-20x20-garoowe-wadada-madaxtooyada',
      catSlug: 'land',
      verticalType: 'LAND',
      price: 18500.0,
      currency: 'USD',
      condition: 'NEW',
      description: 'Boos ku yaal goob istiraatiiji ah oo laamiga saaran, cabbirka 20x20 mitir, warqadda dowladda hoose diyaar tahay, biyaha iyo korontada diyaar.',
      city: 'Garoowe',
      district: 'Waaberi',
      landmark: 'Wadada Madaxtooyada',
      minutesAgo: 720, // 12 hours ago
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
      ],
    },
    {
      title: 'Cuud Malaki & Uunsi Carfeeya oo Dhoof ah',
      slug: 'cuud-malaki-uunsi-carfeeya-dubai',
      catSlug: 'health-beauty',
      verticalType: 'PRODUCT',
      price: 14.5,
      currency: 'USD',
      condition: 'NEW',
      description: 'Cuud Malaki saafi ah oo aad u caraf badan, ma gubanayo muddo dheer, ku habboon guryaha, dharka, iyo aroosyada.',
      city: 'Garoowe',
      district: 'Suuqa Sare',
      landmark: 'Dukaami Online',
      minutesAgo: 1440, // 1 day ago
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
      ],
    },
    {
      title: 'Kartoono Dhar Caruur oo Jumlad ah (Wholesale 50pcs)',
      slug: 'kartoono-dhar-caruur-jumlad-50pcs',
      catSlug: 'wholesale',
      verticalType: 'WHOLESALE',
      price: 175.0,
      currency: 'USD',
      condition: 'NEW',
      description: 'Kartoon ka kooban 50 xabbo oo dharka caruurta tayada sare ah (da\'da 1 ilaa 8 sano). Ku habboon meheradaha iyo ganacsatada tafaariiqda.',
      city: 'Garoowe',
      district: 'Suuqa Sare',
      landmark: 'Bakhaarka Jumlada',
      minutesAgo: 2880, // 2 days ago
      images: [
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
      ],
    },
  ];

  for (const item of sampleListings) {
    const category = categoryMap.get(item.catSlug);
    if (!category) continue;

    const createdAtDate = new Date(now - item.minutesAgo * 60 * 1000);

    const listing = await prisma.listing.upsert({
      where: { slug: item.slug },
      create: {
        sellerId: merchantUser.id,
        businessId: businessStore.id,
        categoryId: category.id,
        verticalType: item.verticalType,
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: item.price,
        currency: item.currency,
        condition: item.condition,
        city: item.city,
        district: item.district,
        landmark: item.landmark,
        status: 'ACTIVE',
        createdAt: createdAtDate,
        updatedAt: createdAtDate,
        media: {
          create: item.images.map((url, idx) => ({
            url,
            mediaType: 'IMAGE',
            sortOrder: idx,
          })),
        },
      },
      update: {
        title: item.title,
        description: item.description,
        price: item.price,
        city: item.city,
        landmark: item.landmark,
        status: 'ACTIVE',
        createdAt: createdAtDate,
      },
    });

    if (item.vehicleDetail) {
      await prisma.vehicleDetail.upsert({
        where: { listingId: listing.id },
        create: {
          listingId: listing.id,
          ...item.vehicleDetail,
        },
        update: {
          ...item.vehicleDetail,
        },
      });
    }

    if (item.propertyDetail) {
      await prisma.propertyDetail.upsert({
        where: { listingId: listing.id },
        create: {
          listingId: listing.id,
          ...item.propertyDetail,
        },
        update: {
          ...item.propertyDetail,
        },
      });
    }
  }

  console.log(`✅ Real Listings seeded (${sampleListings.length} listings with real timestamps).`);
  console.log('🎉 Seeding successfully completed for HUDI-SOFT & DUKAAMIONLINE MARKETPLACE.');
};

seedDatabase()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished successfully.');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
