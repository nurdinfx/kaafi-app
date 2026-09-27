import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import roleRoutes from './modules/roles/roles.routes';
import categoryRoutes from './modules/categories/categories.routes';
import listingRoutes from './modules/listings/listings.routes';
import storeRoutes from './modules/stores/stores.routes';
import requestRoutes from './modules/requests/requests.routes';
import offerRoutes from './modules/offers/offers.routes';
import wholesaleRoutes from './modules/wholesale/wholesale.routes';
import transactionRoutes from './modules/transactions/transactions.routes';
import paymentRoutes from './modules/payments/payments.routes';
import logisticsRoutes from './modules/logistics/logistics.routes';
import trustRoutes from './modules/trust/trust.routes';
import socialRoutes from './modules/social/social.routes';
import adminRoutes from './modules/admin/admin.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import disputeRoutes from './modules/disputes/disputes.routes';
import escrowRoutes from './modules/escrow/escrow.routes';
import chatRoutes from './modules/chat/chat.routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Express => {
  const app = express();

  // Standard Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // relaxed for dev/embeds
  }));
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'HUDI-SOFT CANONICAL API (Fududeeye App)',
      timestamp: new Date().toISOString(),
      launchMarket: 'Garoowe, Puntland, Somalia',
      version: '1.0.0',
    });
  });

  // Canonical Versioned API Routes (/api/v1)
  const apiV1 = express.Router();
  apiV1.use('/auth', authRoutes);
  apiV1.use('/users', userRoutes);
  apiV1.use('/roles', roleRoutes);
  apiV1.use('/categories', categoryRoutes);
  apiV1.use('/listings', listingRoutes);
  apiV1.use('/stores', storeRoutes);
  apiV1.use('/requests', requestRoutes);
  apiV1.use('/offers', offerRoutes);
  apiV1.use('/wholesale', wholesaleRoutes);
  apiV1.use('/transactions', transactionRoutes);
  apiV1.use('/payments', paymentRoutes);
  apiV1.use('/logistics', logisticsRoutes);
  apiV1.use('/trust', trustRoutes);
  apiV1.use('/social', socialRoutes);
  apiV1.use('/admin', adminRoutes);
  apiV1.use('/inventory', inventoryRoutes);
  apiV1.use('/disputes', disputeRoutes);
  apiV1.use('/escrow', escrowRoutes);
  apiV1.use('/chat', chatRoutes);

  app.use('/api/v1', apiV1);

  // Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp;
