"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const realtime_1 = require("./realtime");
const db_1 = __importDefault(require("./db"));
const startServer = async () => {
    const app = (0, app_1.default)();
    const server = http_1.default.createServer(app);
    // Initialize Realtime WebSockets on /ws
    (0, realtime_1.initRealtime)(server);
    // Self-healing database check & auto-migration for PostgreSQL (Render/Supabase)
    try {
        await db_1.default.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';`);
        await db_1.default.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`);
        console.log('[DB] Auto-migration columns verified.');
    }
    catch (mErr) {
        console.warn('[DB] Auto-migration notice:', mErr?.message);
    }
    // Ensure default categories exist in database
    try {
        const catCount = await db_1.default.category.count();
        if (catCount === 0) {
            console.log('[DB] Seeding default categories...');
            const defaultCats = [
                { name: 'Dharka Dumarka & Fashion', slug: 'fashion', verticalType: 'PRODUCT', icon: '👗', displayOrder: 1 },
                { name: 'Telefoonnada & Electronics', slug: 'electronics', verticalType: 'PRODUCT', icon: '📱', displayOrder: 2 },
                { name: 'Gaadiidka & Baabuurta', slug: 'vehicles', verticalType: 'VEHICLE', icon: '🚗', displayOrder: 3 },
                { name: 'Guryaha & Dhulka', slug: 'real-estate', verticalType: 'REAL_ESTATE', icon: '🏢', displayOrder: 4 },
                { name: 'Dhul & Boosas', slug: 'land', verticalType: 'LAND', icon: '📐', displayOrder: 5 },
                { name: 'Qalabka Guriga & Jikada', slug: 'home-living', verticalType: 'PRODUCT', icon: '🏠', displayOrder: 6 },
                { name: 'Caafimaadka & Qurxinta', slug: 'health-beauty', verticalType: 'PRODUCT', icon: '✨', displayOrder: 7 },
                { name: 'Caruurta & Ciyaarta', slug: 'kids', verticalType: 'PRODUCT', icon: '🧸', displayOrder: 8 },
                { name: 'Adeegyada & Xirfadaha', slug: 'services', verticalType: 'SERVICE', icon: '🛠', displayOrder: 9 },
                { name: 'Ganacsiga Jumlada', slug: 'wholesale', verticalType: 'WHOLESALE', icon: '🏭', displayOrder: 10 },
                { name: 'Alaabta Guud', slug: 'general', verticalType: 'PRODUCT', icon: '📦', displayOrder: 11 },
            ];
            for (const c of defaultCats) {
                await db_1.default.category.upsert({
                    where: { slug: c.slug },
                    create: c,
                    update: c,
                }).catch(() => { });
            }
            console.log('[DB] Default categories seeded successfully.');
        }
    }
    catch (cErr) {
        console.warn('[DB] Category auto-seed notice:', cErr?.message);
    }
    // Ensure hudi-soft store is verified and gaari is linked
    try {
        const hudi = await db_1.default.businessProfile.findFirst({ where: { slug: 'hudi-soft' } });
        if (hudi) {
            if (!hudi.isVerified) {
                await db_1.default.businessProfile.update({ where: { id: hudi.id }, data: { isVerified: true } });
                console.log('[DB] Auto-verified hudi-soft store.');
            }
            // Link gaari listing to hudi-soft and make VERIFIED + ACTIVE
            await db_1.default.listing.updateMany({
                where: { slug: { contains: 'gaari' } },
                data: { businessId: hudi.id, verificationStatus: 'VERIFIED', status: 'ACTIVE' },
            });
            // Ensure all hudi-soft listings are VERIFIED and ACTIVE
            await db_1.default.listing.updateMany({
                where: { businessId: hudi.id },
                data: { verificationStatus: 'VERIFIED', status: 'ACTIVE' },
            });
        }
    }
    catch (syncErr) {
        console.warn('[DB] Store auto-heal notice:', syncErr?.message);
    }
    const port = parseInt(process.env.PORT || String(config_1.CONFIG.PORT || 5000), 10);
    const host = '0.0.0.0';
    server.listen(port, host, () => {
        console.log(`====================================================`);
        console.log(`🚀 HUDI-SOFT CANONICAL BACKEND (Fududeeye App)`);
        console.log(`🌐 Server running on http://${host}:${port}`);
        console.log(`📡 WebSocket server running on ws://${host}:${port}/ws`);
        console.log(`📍 Launch Market: Garoowe, Puntland, Somalia`);
        console.log(`====================================================`);
    });
};
startServer().catch((err) => {
    console.error('Fatal server startup error:', err);
    process.exit(1);
});
