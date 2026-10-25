"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wipeAllData = wipeAllData;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("./db"));
async function wipeAllData() {
    console.log('🧹 [WIPE] Starting total database purge...');
    // 1. Social & Chat
    await db_1.default.postComment.deleteMany({});
    await db_1.default.postLike.deleteMany({});
    await db_1.default.linkedListing.deleteMany({});
    await db_1.default.socialPost.deleteMany({});
    await db_1.default.userFollow.deleteMany({});
    await db_1.default.chatMessage.deleteMany({});
    await db_1.default.chatParticipant.deleteMany({});
    await db_1.default.chatConversation.deleteMany({});
    // 2. Reviews & Disputes
    await db_1.default.review.deleteMany({});
    await db_1.default.dispute.deleteMany({});
    // 3. Logistics & Delivery
    await db_1.default.deliveryJob.deleteMany({});
    await db_1.default.driverProfile.deleteMany({});
    // 4. Payments, Escrow & Wallets
    await db_1.default.paymentAttempt.deleteMany({});
    await db_1.default.payment.deleteMany({});
    await db_1.default.paymentWebhook.deleteMany({});
    await db_1.default.escrowHold.deleteMany({});
    await db_1.default.ledgerEntry.deleteMany({});
    await db_1.default.payoutRequest.deleteMany({});
    await db_1.default.wallet.deleteMany({});
    // 5. Transactions & Items
    await db_1.default.transactionStatusHistory.deleteMany({});
    await db_1.default.transactionItem.deleteMany({});
    await db_1.default.marketplaceTransaction.deleteMany({});
    // 6. Offers & Requests
    await db_1.default.offerHistory.deleteMany({});
    await db_1.default.offer.deleteMany({});
    await db_1.default.buyerRequest.deleteMany({});
    await db_1.default.wholesaleQuote.deleteMany({});
    await db_1.default.wholesaleRFQ.deleteMany({});
    // 7. Listings & Details
    await db_1.default.productVariant.deleteMany({});
    await db_1.default.stockMovement.deleteMany({});
    await db_1.default.vehicleDetail.deleteMany({});
    await db_1.default.propertyDetail.deleteMany({});
    await db_1.default.serviceDetail.deleteMany({});
    await db_1.default.listingMedia.deleteMany({});
    await db_1.default.listingAttributeValue.deleteMany({});
    await db_1.default.listing.deleteMany({});
    // 8. Stores & Businesses
    await db_1.default.businessEmployee.deleteMany({});
    await db_1.default.businessBranch.deleteMany({});
    await db_1.default.businessProfile.deleteMany({});
    await db_1.default.sellerProfile.deleteMany({});
    // 9. Notifications, Verifications, Audit Logs
    await db_1.default.notification.deleteMany({});
    await db_1.default.verificationRequest.deleteMany({});
    await db_1.default.auditLog.deleteMany({});
    // 10. Users & Roles
    await db_1.default.userRole.deleteMany({});
    await db_1.default.user.deleteMany({});
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
        await db_1.default.role.upsert({
            where: { name: roleName },
            create: { name: roleName, description: `${roleName} capability in Hudi-Soft ecosystem` },
            update: {},
        });
    }
    // 12. Create the ONE clean Super Admin account
    const superAdminRole = await db_1.default.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    const adminPasswordHash = await bcryptjs_1.default.hash('Admin@Garoowe2026', 10);
    const cleanAdmin = await db_1.default.user.create({
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
        await db_1.default.userRole.create({
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
    const catCount = await db_1.default.category.count();
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
            await db_1.default.category.create({ data: { ...c, status: 'ACTIVE', isActive: true } });
        }
        console.log('✅ Seeded 10 canonical Somali categories in Supabase Postgres.');
    }
    const userCount = await db_1.default.user.count();
    const listingCount = await db_1.default.listing.count();
    const orderCount = await db_1.default.marketplaceTransaction.count();
    const storeCount = await db_1.default.businessProfile.count();
    console.log(`📊 [STATUS VERIFICATION]:`);
    console.log(`   Users in DB: ${userCount} (only Super Admin)`);
    console.log(`   Products in DB: ${listingCount}`);
    console.log(`   Orders in DB: ${orderCount}`);
    console.log(`   Stores in DB: ${storeCount}`);
}
wipeAllData()
    .then(async () => {
    await db_1.default.$disconnect();
    console.log('✅ Wipe and reset completed cleanly!');
    process.exit(0);
})
    .catch(async (e) => {
    console.error('❌ Wipe error:', e);
    await db_1.default.$disconnect();
    process.exit(1);
});
