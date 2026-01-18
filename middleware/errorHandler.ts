import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { logger } from '../logger.js';

interface AppError extends Error {
  status?: number;
  code?: string;
}

interface ErrorResponse {
  message: string;
  status?: number;
  code?: string;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error: ErrorResponse = { message: err.message };

  // Log error
  logger.error({
    message: `Error: ${err.message}`,
    error: err
  });

  // CORS error
  if (err.message === 'Not allowed by CORS') {
    error = {
      message: 'CORS policy violation',
      status: 403,
      code: 'CORS_ERROR'
    };
  }

  // Rate limit error
  if (err.message && err.message.includes('Too many requests')) {
    error = {
      message: 'Rate limit exceeded',
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Server Error',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      reqBody: req.body
    }
  });
};

const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

const asyncHandler = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export { errorHandler, notFound, asyncHandler };
