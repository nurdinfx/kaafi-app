import bcrypt from 'bcryptjs';
import prisma from './db';
import { CONFIG } from './config';

export const seedDatabase = async () => {
  console.log('🌱 Starting HUDI-SOFT Canonical Database Seeding for Garoowe Launch Market...');

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

  // 2. Dynamic Categories and Custom Attributes
  const categoriesData = [
    {
      name: 'Vehicles & Automotive',
      slug: 'vehicles',
      verticalType: 'VEHICLE',
      icon: '🚗',
      description: 'Cars, 4WDs, trucks, commercial vehicles, and motorcycles in Puntland.',
      commissionRate: 3.5,
      attributes: [
        { name: 'Make / Brand', key: 'make', type: 'SELECT', isRequired: true, options: 'Toyota,Nissan,Hyundai,Kia,Mitsubishi,Land Rover,Suzuki,Other' },
        { name: 'Model', key: 'model', type: 'TEXT', isRequired: true },
        { name: 'Year', key: 'year', type: 'NUMBER', isRequired: true },
        { name: 'Transmission', key: 'transmission', type: 'SELECT', isRequired: true, options: 'AUTOMATIC,MANUAL' },
        { name: 'Fuel Type', key: 'fuelType', type: 'SELECT', isRequired: true, options: 'PETROL,DIESEL,HYBRID' },
        { name: 'Mileage (km)', key: 'mileageKm', type: 'NUMBER', isRequired: false },
        { name: 'Vehicle Condition', key: 'condition', type: 'SELECT', isRequired: true, options: 'NEW,EXCELLENT,GOOD,FAIR' },
      ],
    },
    {
      name: 'Real Estate & Properties',
      slug: 'real-estate',
      verticalType: 'REAL_ESTATE',
      icon: '🏢',
      description: 'Houses, apartments, shops, offices, and commercial properties for rent and sale.',
      commissionRate: 2.5,
      attributes: [
        { name: 'Property Type', key: 'propertyType', type: 'SELECT', isRequired: true, options: 'HOUSE,APARTMENT,OFFICE,SHOP,WAREHOUSE' },
        { name: 'Transaction Type', key: 'transactionType', type: 'SELECT', isRequired: true, options: 'RENT,SALE' },
        { name: 'Bedrooms', key: 'bedrooms', type: 'NUMBER', isRequired: false },
        { name: 'Bathrooms', key: 'bathrooms', type: 'NUMBER', isRequired: false },
        { name: 'Furnished', key: 'furnished', type: 'BOOLEAN', isRequired: false },
        { name: 'Area (sq m)', key: 'areaSqMeters', type: 'NUMBER', isRequired: false },
      ],
    },
    {
      name: 'Land & Plots',
      slug: 'land',
      verticalType: 'LAND',
      icon: '📐',
      description: 'Residential plots, commercial land, and agricultural acreage in Garoowe and Nugaal.',
      commissionRate: 2.0,
      attributes: [
        { name: 'Land Type', key: 'landType', type: 'SELECT', isRequired: true, options: 'RESIDENTIAL,COMMERCIAL,AGRICULTURAL,DEVELOPMENT' },
        { name: 'Area (sq m)', key: 'areaSqMeters', type: 'NUMBER', isRequired: true },
        { name: 'Document Status', key: 'documentStatus', type: 'SELECT', isRequired: true, options: 'TITLE_DEED_AVAILABLE,NOTARIZED_MUNICIPALITY,IN_PROCESS' },
      ],
    },
    {
      name: 'Electronics & Phones',
      slug: 'electronics',
      verticalType: 'PRODUCT',
      icon: '📱',
      description: 'Smartphones, laptops, tablets, smart accessories, and home appliances.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Brand', key: 'brand', type: 'SELECT', isRequired: true, options: 'Apple,Samsung,Xiaomi,HP,Dell,Lenovo,Sony,Other' },
        { name: 'Condition', key: 'condition', type: 'SELECT', isRequired: true, options: 'NEW,LIKE_NEW,USED_GOOD,USED_FAIR' },
        { name: 'Storage Capacity', key: 'storage', type: 'TEXT', isRequired: false },
        { name: 'RAM', key: 'ram', type: 'TEXT', isRequired: false },
      ],
    },
    {
      name: 'Local Services & Trades',
      slug: 'services',
      verticalType: 'SERVICE',
      icon: '🛠️',
      description: 'Mechanics, electricians, plumbers, painters, technicians, builders, and consultants.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Service Type', key: 'serviceType', type: 'SELECT', isRequired: true, options: 'MECHANIC,PLUMBER,ELECTRICIAN,CONSTRUCTION,PAINTER,CLEANER,DRIVER,TUTOR' },
        { name: 'Years of Experience', key: 'experienceYears', type: 'NUMBER', isRequired: false },
        { name: 'Pricing Structure', key: 'pricingModel', type: 'SELECT', isRequired: true, options: 'FIXED,HOURLY,QUOTE_REQUIRED' },
      ],
    },
    {
      name: 'B2B Wholesale & Bulk Goods',
      slug: 'wholesale',
      verticalType: 'WHOLESALE',
      icon: '📦',
      description: 'Bulk food commodities, construction materials, FMCG, and supplier quotes.',
      commissionRate: 3.0,
      attributes: [
        { name: 'Unit of Measure', key: 'unitOfMeasure', type: 'SELECT', isRequired: true, options: 'CARTONS,BAGS,CONTAINERS,TONS,PIECES' },
        { name: 'Minimum Order Qty (MOQ)', key: 'moq', type: 'NUMBER', isRequired: true },
      ],
    },
    {
      name: 'Fashion & Apparel',
      slug: 'fashion',
      verticalType: 'PRODUCT',
      icon: '👕',
      description: 'Traditional Somali attire, modern clothing, shoes, perfumes, and accessories.',
      commissionRate: 5.0,
      attributes: [
        { name: 'Department', key: 'department', type: 'SELECT', isRequired: true, options: 'MEN,WOMEN,KIDS,UNISEX' },
        { name: 'Size', key: 'size', type: 'TEXT', isRequired: false },
      ],
    },
  ];

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
      },
      update: {
        name: cat.name,
        verticalType: cat.verticalType,
        icon: cat.icon,
        description: cat.description,
        commissionRate: cat.commissionRate,
      },
    });

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
          options: attr.options,
        },
        update: {
          name: attr.name,
          type: attr.type,
          isRequired: attr.isRequired,
          options: attr.options,
        },
      });
    }
  }
  console.log(`✅ Categories & Attributes seeded (${categoriesData.length} verticals).`);

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

  // 4. Initial Verified Business Store ("ABC Electronics Garoowe")
  const businessSellerRole = await prisma.role.findUnique({ where: { name: 'BUSINESS_SELLER' } });
  const merchantUser = await prisma.user.upsert({
    where: { phoneNumber: '+252907000002' },
    create: {
      phoneNumber: '+252907000002',
      email: 'sales@abcelectronics.so',
      passwordHash: adminPasswordHash,
      fullName: 'ABC Electronics Owner',
      city: 'Garoowe',
      verificationStatus: 'VERIFIED',
      wallet: { create: { balance: 250.0, currency: 'USD' } },
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
      businessName: 'ABC Electronics',
      slug: 'abc-electronics',
      tagline: 'Premier Tech & Gadgets in Puntland',
      description: 'Official retailers of Apple, Samsung, Dell, and solar electronics in Garoowe.',
      phone: '+252907000002',
      whatsappNumber: '+252907000002',
      city: 'Garoowe',
      landmarkAddress: 'Near Xarunta Gobolka Nugaal, Wadada Wadnaha',
      openingHours: 'Sat - Thu: 8:00 AM - 9:30 PM',
      isVerified: true,
      rating: 4.9,
      totalReviews: 18,
      followersCount: 420,
      branches: {
        create: [
          {
            branchName: 'Garoowe Central Branch',
            city: 'Garoowe',
            landmark: 'Near Xarunta Gobolka Nugaal',
            phone: '+252907000002',
          },
          {
            branchName: 'Bosaso Main Branch',
            city: 'Bosaso',
            landmark: 'Suuqa Waaheen',
            phone: '+252907000003',
          },
        ],
      },
    },
    update: {},
  });

  console.log(`✅ Business Store seeded: "${businessStore.businessName}" (/store/abc-electronics)`);
  console.log('🎉 Seeding successfully completed for HUDI-SOFT MARKETPLACE.');
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
