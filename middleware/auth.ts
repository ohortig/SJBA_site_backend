import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { getSupabase } from '../config/supabase.js';
import { logger } from '../logger.js';

// Helper function to extract Bearer token from Authorization header
const getBearerToken = (authorizationHeader?: string): string | null => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

// Middleware to require an authenticated user via Supabase access token
export const requireAuthenticatedUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const accessToken = getBearerToken(req.get('Authorization'));

  if (!accessToken) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Missing or invalid Authorization header',
        code: 'AUTH_TOKEN_MISSING',
      },
    });
    return;
  }

  // Verify the access token with Supabase
  try {
    const supabase = getSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      logger.warn({
        message: 'Supabase access token verification failed',
        error: error?.message || 'No user returned for access token',
        path: req.originalUrl,
      });
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired access token',
          code: 'AUTH_TOKEN_INVALID',
        },
      });
      return;
    }

    req.authToken = accessToken;
    req.authUser = user;

    next();
  } catch (error) {
    const err = error as Error;
    logger.error({
      message: 'Unexpected error while verifying Supabase access token',
      error: err.message,
      path: req.originalUrl,
    });
    next(error);
  }
};
