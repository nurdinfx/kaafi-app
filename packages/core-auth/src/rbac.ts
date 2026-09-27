import { RoleType } from '@hudisoft/common';

export const ADMIN_ROLES = [
  RoleType.SUPER_ADMIN,
  RoleType.FINANCE_ADMIN,
  RoleType.OPERATIONS_ADMIN,
  RoleType.MODERATOR,
  RoleType.SUPPORT_AGENT,
  RoleType.MARKETING_ADMIN,
];

export const SELLER_ROLES = [
  RoleType.INDIVIDUAL_SELLER,
  RoleType.BUSINESS_SELLER,
  RoleType.WHOLESALE_SELLER,
  RoleType.SERVICE_PROVIDER,
  RoleType.PROPERTY_AGENT,
  RoleType.VEHICLE_DEALER,
  RoleType.SUPER_ADMIN,
];

export const hasAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  if (userRoles.includes(RoleType.SUPER_ADMIN)) return true;
  return userRoles.some((role) => requiredRoles.includes(role));
};

export const isAdmin = (userRoles: string[]): boolean => {
  return hasAnyRole(userRoles, ADMIN_ROLES);
};

export const isSeller = (userRoles: string[]): boolean => {
  return hasAnyRole(userRoles, SELLER_ROLES);
};
