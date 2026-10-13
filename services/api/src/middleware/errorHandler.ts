import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ErrorCode } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: any;

  constructor(message: string, statusCode: number = 400, errorCode: string = ErrorCode.BAD_REQUEST, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
    } as any);
    return;
  }

  // Handle Prisma errors cleanly
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'A record with this unique constraint already exists.',
      error: {
        code: ErrorCode.CONFLICT,
        message: 'A record with this unique constraint already exists.',
        details: err.meta,
      },
    } as any);
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'The requested record was not found.',
      error: {
        code: ErrorCode.NOT_FOUND,
        message: 'The requested record was not found.',
      },
    } as any);
    return;
  }

  // Fallback 500 error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Unknown error',
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Unknown error',
    },
  } as any);
};
