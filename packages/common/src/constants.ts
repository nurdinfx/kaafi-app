export const LAUNCH_MARKET = {
  country: 'Somalia',
  region: 'Puntland',
  primaryCity: 'Garoowe',
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'SOS'],
  exchangeRateSOSPerUSD: 26000,
};

export const GAROOWE_DISTRICTS = [
  'Waberi',
  'Hodan',
  '1-da August',
  'Hantiwadaag',
  'Israac',
  'Banaadir',
  'Garsoor',
] as const;

export const GAROOWE_KEY_LANDMARKS = [
  'Near Hotel Rugsan',
  'Near Suuqa Hantiwadaag (Main Market)',
  'Near University of Puntland (PSU)',
  'Near East Africa University Garoowe',
  'Near Wadada 30-ka (30th Street)',
  'Near Garowe General Hospital',
  'Near Puntland State House / Madaxtooyada',
  'Near Garoowe International Airport Road',
  'Near Hotel New Rays',
  'Near Amal Plaza Garoowe',
  'Near Daryeel Bank Garoowe Branch',
] as const;

export const DEFAULT_COMMISSION_RATES: Record<string, number> = {
  VEHICLE: 3.5, // 3.5%
  REAL_ESTATE: 2.5, // 2.5%
  LAND: 2.0, // 2.0%
  PRODUCT: 5.0, // 5.0%
  SERVICE: 7.5, // 7.5%
  WHOLESALE: 2.0, // 2.0%
};
