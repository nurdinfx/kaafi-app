import http from 'http';
import createApp from './app';
import { CONFIG } from './config';
import { initRealtime } from './realtime';
import prisma from './db';

// ─── Global safety nets ───────────────────────────────────────────────────────
// Prevent silent crashes from killing the process without a trace
process.on('unhandledRejection', (reason: any) => {
  console.error('[UnhandledRejection]', reason?.message ?? reason);
});
process.on('uncaughtException', (err: any) => {
  console.error('[UncaughtException]', err?.message ?? err);
});

// Helper: wrap any promise with a hard timeout so it can never hang indefinitely
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[Timeout] ${label} exceeded ${ms}ms`)), ms),
    ),
  ]);
}

const runBackgroundAutoHeal = async (): Promise<void> => {
  console.log('[AutoHeal] Starting background database self-heal...');

  // Self-healing database check & auto-migration for PostgreSQL (Render/Supabase)
  // Each DDL statement gets its own 8-second timeout so a lock-wait can never block.
  try {
    await withTimeout(
      prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';`),
      8000, 'ALTER TABLE Category status',
    );
    await withTimeout(
      prisma.$executeRawUnsafe(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`),
      8000, 'ALTER TABLE Category isActive',
    );
    console.log('[DB] Auto-migration columns verified.');
  } catch (mErr: any) {
    console.warn('[DB] Auto-migration notice (non-fatal):', mErr?.message);
  }

  // Ensure default categories exist in database
  try {
    const catCount = await withTimeout(prisma.category.count(), 8000, 'category.count');
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
        await withTimeout(
          prisma.category.upsert({ where: { slug: c.slug }, create: c, update: c }).catch(() => null),
          8000, `upsert category ${c.slug}`,
        ).catch(() => {});
      }
      console.log('[DB] Default categories seeded successfully.');
    } else {
      console.log(`[DB] Found ${catCount} existing categories – skipping seed.`);
    }
  } catch (cErr: any) {
    console.warn('[DB] Category auto-seed notice (non-fatal):', cErr?.message);
  }

  // Ensure hudi-soft store is verified and gaari is linked
  try {
    const hudi = await withTimeout(
      prisma.businessProfile.findFirst({ where: { slug: 'hudi-soft' } }),
      8000, 'findFirst hudi-soft',
    );
    if (hudi) {
      if (!hudi.isVerified) {
        await withTimeout(
          prisma.businessProfile.update({ where: { id: hudi.id }, data: { isVerified: true } }),
          8000, 'update hudi-soft isVerified',
        );
        console.log('[DB] Auto-verified hudi-soft store.');
      }
      await withTimeout(
        prisma.listing.updateMany({
          where: { slug: { contains: 'gaari' } },
          data: { businessId: hudi.id, verificationStatus: 'VERIFIED', status: 'ACTIVE' },
        }),
        8000, 'updateMany gaari listing',
      );
      await withTimeout(
        prisma.listing.updateMany({
          where: { businessId: hudi.id },
          data: { verificationStatus: 'VERIFIED', status: 'ACTIVE' },
        }),
        8000, 'updateMany hudi-soft listings',
      );
    }
  } catch (syncErr: any) {
    console.warn('[DB] Store auto-heal notice (non-fatal):', syncErr?.message);
  }

  console.log('[AutoHeal] Background self-heal completed.');
};

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Realtime WebSockets on /ws
  initRealtime(server);

  const port = parseInt(process.env.PORT || String(CONFIG.PORT || 10000), 10);

  // Bind to 0.0.0.0 immediately so Render port scanner detects the port right away.
  // DB auto-heal runs AFTER the port is open — it will never block HTTP responses.
  server.listen(port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 HUDI-SOFT CANONICAL BACKEND (Fududeeye App)`);
    console.log(`🌐 Server running on port ${port}`);
    console.log(`📡 WebSocket server running on /ws`);
    console.log(`📍 Launch Market: Garoowe, Puntland, Somalia`);
    console.log(`====================================================`);

    // Fire-and-forget: timeouts inside ensure this never hangs the event loop
    setImmediate(() => {
      runBackgroundAutoHeal().catch((err) => console.error('[AutoHeal Fatal]', err?.message ?? err));
    });
  });

  server.on('error', (err: any) => {
    console.error('[Server Listen Error]:', err?.message ?? err);
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Fatal server startup error:', err?.message ?? err);
  process.exit(1);
});
