import { VerticalType } from '@hudisoft/common';

export interface VehicleListingData {
  make: string;
  model: string;
  year: number;
  transmission: 'AUTOMATIC' | 'MANUAL';
  fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC';
  mileageKm?: number;
  inspectionPassed?: boolean;
}

export interface PropertyListingData {
  propertyType: 'HOUSE' | 'APARTMENT' | 'OFFICE' | 'SHOP' | 'WAREHOUSE';
  transactionType: 'RENT' | 'SALE';
  bedrooms?: number;
  bathrooms?: number;
  areaSqMeters?: number;
  furnished?: boolean;
  landTitleStatus?: 'NOTARIZED' | 'TITLE_DEED' | 'IN_PROCESS';
}

export interface ServiceListingData {
  serviceType: string;
  pricingModel: 'FIXED' | 'HOURLY' | 'QUOTE';
  yearsExperience?: number;
  serviceArea: string;
  availability?: string;
}

export const validateVerticalData = (
  vertical: VerticalType | string,
  payload: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (vertical === VerticalType.VEHICLE) {
    if (!payload?.make) errors.push('Vehicle make is required.');
    if (!payload?.model) errors.push('Vehicle model is required.');
    if (!payload?.year || payload.year < 1980 || payload.year > new Date().getFullYear() + 1) {
      errors.push('A valid vehicle year is required.');
    }
  } else if (vertical === VerticalType.REAL_ESTATE || vertical === VerticalType.LAND) {
    if (!payload?.propertyType && vertical === VerticalType.REAL_ESTATE) {
      errors.push('Property type is required.');
    }
    if (!payload?.transactionType && vertical === VerticalType.REAL_ESTATE) {
      errors.push('Transaction type (RENT or SALE) is required.');
    }
  } else if (vertical === VerticalType.SERVICE) {
    if (!payload?.serviceType) errors.push('Service type is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
