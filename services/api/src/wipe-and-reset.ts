import bcrypt from 'bcryptjs';
import prisma from './db';

export async function wipeAllData() {
  console.log('🧹 [WIPE] Starting total database purge...');

  // 1. Social & Chat
  await prisma.postComment.deleteMany({});
  await prisma.postLike.deleteMany({});
  await prisma.linkedListing.deleteMany({});
  await prisma.socialPost.deleteMany({});
  await prisma.userFollow.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatParticipant.deleteMany({});
  await prisma.chatConversation.deleteMany({});

  // 2. Reviews & Disputes
  await prisma.review.deleteMany({});
  await prisma.dispute.deleteMany({});

  // 3. Logistics & Delivery
  await prisma.deliveryJob.deleteMany({});
  await prisma.driverProfile.deleteMany({});

  // 4. Payments, Escrow & Wallets
  await prisma.paymentAttempt.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.paymentWebhook.deleteMany({});
  await prisma.escrowHold.deleteMany({});
  await prisma.ledgerEntry.deleteMany({});
  await prisma.payoutRequest.deleteMany({});
  await prisma.wallet.deleteMany({});

  // 5. Transactions & Items
  await prisma.transactionStatusHistory.deleteMany({});
  await prisma.transactionItem.deleteMany({});
  await prisma.marketplaceTransaction.deleteMany({});

  // 6. Offers & Requests
  await prisma.offerHistory.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.buyerRequest.deleteMany({});
  await prisma.wholesaleQuote.deleteMany({});
  await prisma.wholesaleRFQ.deleteMany({});

  // 7. Listings & Details
  await prisma.productVariant.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.vehicleDetail.deleteMany({});
  await prisma.propertyDetail.deleteMany({});
  await prisma.serviceDetail.deleteMany({});
  await prisma.listingMedia.deleteMany({});
  await prisma.listingAttributeValue.deleteMany({});
  await prisma.listing.deleteMany({});

  // 8. Stores & Businesses
  await prisma.businessEmployee.deleteMany({});
  await prisma.businessBranch.deleteMany({});
  await prisma.businessProfile.deleteMany({});
  await prisma.sellerProfile.deleteMany({});

  // 9. Notifications, Verifications, Audit Logs
  await prisma.notification.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.auditLog.deleteMany({});

  // 10. Users & Roles
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✨ [WIPE] All tables cleared. 0 users, 0 orders, 0 products, 0 stores.');

  // 11. Ensure Roles exist
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

  // 12. Create the ONE clean Super Admin account
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const adminPasswordHash = await bcrypt.hash('Admin@Garoowe2026', 10);

  const cleanAdmin = await prisma.user.create({
    data: {
      phoneNumber: '+252907000001',
      email: 'admin@hudisoft.com',
      passwordHash: adminPasswordHash,
      fullName: 'Super Admin Kaafi',
      city: 'Garoowe',
      country: 'Somalia',
      verificationStatus: 'VERIFIED',
      isActive: true,
      wallet: {
        create: {
          balance: 0.0,
          pendingBalance: 0.0,
          currency: 'USD',
        },
      },
    },
  });

  if (superAdminRole) {
    await prisma.userRole.create({
      data: {
        userId: cleanAdmin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  console.log('👑 [SUPER ADMIN] Clean Super Admin created successfully:');
  console.log(`   Email: admin@hudisoft.com`);
  console.log(`   Phone: +252907000001`);
  console.log(`   Password: Admin@Garoowe2026`);
  console.log(`   ID: ${cleanAdmin.id}`);

  // Seed default canonical categories if empty
  const catCount = await prisma.category.count();
  if (catCount === 0) {
    const defaultCats = [
      { name: 'Telefoonnada & Tech', slug: 'electronics', verticalType: 'PRODUCT', icon: '📱', commissionRate: 4.5 },
      { name: 'Dharka Dumarka & Fashion', slug: 'fashion', verticalType: 'PRODUCT', icon: '👗', commissionRate: 5.0 },
      { name: 'Gaadiidka & Baabuurta', slug: 'vehicles', verticalType: 'VEHICLE', icon: '🚗', commissionRate: 3.5 },
      { name: 'Guryaha & Dhulka', slug: 'real-estate', verticalType: 'REAL_ESTATE', icon: '🏠', commissionRate: 3.0 },
      { name: 'Dhul & Boosas', slug: 'land', verticalType: 'LAND', icon: '📐', commissionRate: 2.5 },
      { name: 'Qalabka Guriga & Jikada', slug: 'home-living', verticalType: 'PRODUCT', icon: '🛋️', commissionRate: 4.0 },
      { name: 'Caafimaadka & Qurxinta', slug: 'health-beauty', verticalType: 'PRODUCT', icon: '✨', commissionRate: 5.0 },
      { name: 'Caruurta & Ciyaarta', slug: 'kids', verticalType: 'PRODUCT', icon: '🧸', commissionRate: 4.0 },
      { name: 'Ganacsiga Jumlada', slug: 'wholesale', verticalType: 'WHOLESALE', icon: '📦', commissionRate: 2.0 },
      { name: 'Adeegyada & Xirfadaha', slug: 'services', verticalType: 'SERVICE', icon: '🔧', commissionRate: 5.0 },
    ];
    for (const c of defaultCats) {
      await prisma.category.create({ data: { ...c, status: 'ACTIVE', isActive: true } });
    }
    console.log('✅ Seeded 10 canonical Somali categories in Supabase Postgres.');
  }
  const userCount = await prisma.user.count();
  const listingCount = await prisma.listing.count();
  const orderCount = await prisma.marketplaceTransaction.count();
  const storeCount = await prisma.businessProfile.count();

  console.log(`📊 [STATUS VERIFICATION]:`);
  console.log(`   Users in DB: ${userCount} (only Super Admin)`);
  console.log(`   Products in DB: ${listingCount}`);
  console.log(`   Orders in DB: ${orderCount}`);
  console.log(`   Stores in DB: ${storeCount}`);
}

wipeAllData()
  .then(async () => {
    await prisma.$disconnect();
    console.log('✅ Wipe and reset completed cleanly!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Wipe error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
