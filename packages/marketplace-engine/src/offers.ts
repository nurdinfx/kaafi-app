import { OfferStatus } from '@hudisoft/common';

export const canCounterOffer = (currentStatus: OfferStatus | string): boolean => {
  return currentStatus === OfferStatus.PENDING || currentStatus === OfferStatus.COUNTERED;
};

export const canAcceptOffer = (currentStatus: OfferStatus | string): boolean => {
  return currentStatus === OfferStatus.PENDING || currentStatus === OfferStatus.COUNTERED;
};

export const canRejectOffer = (currentStatus: OfferStatus | string): boolean => {
  return currentStatus === OfferStatus.PENDING || currentStatus === OfferStatus.COUNTERED;
};
