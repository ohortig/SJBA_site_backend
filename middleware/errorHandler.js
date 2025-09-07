import { logger } from '../logger.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

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
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export { errorHandler, notFound, asyncHandler };
