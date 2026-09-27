import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  phoneNumber: string;
  email?: string | null;
  fullName: string;
  roles: string[];
  sellerProfileId?: string | null;
  businessProfileId?: string | null;
  driverProfileId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFLICT = 'CONFLICT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  IDEMPOTENCY_CONFLICT = 'IDEMPOTENCY_CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
}
