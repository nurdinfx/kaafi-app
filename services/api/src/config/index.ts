import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || 'http://localhost:5000',
  WEB_URL: process.env.WEB_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'hudisoft_super_secret_production_ready_jwt_key_2026_garoowe',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'hudisoft_super_secret_refresh_token_key_2026',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET || 'hudisoft_webhook_verification_secret_2026',

  // Launch Market Defaults (Garoowe, Puntland, Somalia)
  DEFAULT_COUNTRY: process.env.DEFAULT_COUNTRY || 'Somalia',
  DEFAULT_REGION: process.env.DEFAULT_REGION || 'Puntland',
  DEFAULT_CITY: process.env.DEFAULT_CITY || 'Garoowe',
  SUPPORTED_CURRENCIES: (process.env.SUPPORTED_CURRENCIES || 'USD,SOS').split(','),
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || 'USD',

  // Commission Engine
  DEFAULT_PLATFORM_COMMISSION_PERCENT: parseFloat(process.env.DEFAULT_PLATFORM_COMMISSION_PERCENT || '5.0'),
  DEFAULT_MIN_COMMISSION_USD: parseFloat(process.env.DEFAULT_MIN_COMMISSION_USD || '0.50'),
};
