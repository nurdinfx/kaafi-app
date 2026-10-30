import http from 'http';
import createApp from './app';
import { CONFIG } from './config';
import { initRealtime } from './realtime';
import prisma from './db';

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Realtime WebSockets on /ws
  initRealtime(server);

  // Self-healing database check & auto-migration for PostgreSQL (Render/Supabase)
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`);
    console.log('[DB] Auto-migration columns verified.');
  } catch (mErr: any) {
    console.warn('[DB] Auto-migration notice:', mErr?.message);
  }

  // Ensure default categories exist in database
  try {
    const catCount = await prisma.category.count();
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
        await prisma.category.upsert({
          where: { slug: c.slug },
          create: c,
          update: c,
        }).catch(() => {});
      }
      console.log('[DB] Default categories seeded successfully.');
    }
  } catch (cErr: any) {
    console.warn('[DB] Category auto-seed notice:', cErr?.message);
  }

  // Ensure hudi-soft store is verified and gaari is linked
  try {
    const hudi = await prisma.businessProfile.findFirst({ where: { slug: 'hudi-soft' } });
    if (hudi) {
      if (!hudi.isVerified) {
        await prisma.businessProfile.update({ where: { id: hudi.id }, data: { isVerified: true } });
        console.log('[DB] Auto-verified hudi-soft store.');
      }
      // Link gaari listing to hudi-soft and make VERIFIED + ACTIVE
      await prisma.listing.updateMany({
        where: { slug: { contains: 'gaari' } },
        data: { businessId: hudi.id, verificationStatus: 'VERIFIED', status: 'ACTIVE' },
      });
      // Ensure all hudi-soft listings are VERIFIED and ACTIVE
      await prisma.listing.updateMany({
        where: { businessId: hudi.id },
        data: { verificationStatus: 'VERIFIED', status: 'ACTIVE' },
      });
    }
  } catch (syncErr: any) {
    console.warn('[DB] Store auto-heal notice:', syncErr?.message);
  }

  const port = parseInt(process.env.PORT || String(CONFIG.PORT || 5000), 10);
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
