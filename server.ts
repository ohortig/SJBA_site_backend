import express, { type Request, type Response, type NextFunction, type Application } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import http from 'http';

import dotenv from 'dotenv';

import { initializeSupabase, testConnection } from './config/supabase.js';
import { initializeEmailTransporter } from './config/email.js';
import { initializeMailchimp, testMailchimpConnection } from './config/mailchimp.js';
import { errorHandler, notFound, validateReferer } from './middleware/index.js';

import {
  boardMembersRoutes,
  newsletterRoutes,
  eventsRoutes,
  contactRoutes,
  membersRoutes,
  semestersRoutes,
} from './routes/index.js';

import { logger, httpLogger } from './logger.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Trust proxy when deployed (Vercel)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  app.set('trust proxy', 1);
}

initializeSupabase();
initializeEmailTransporter();
initializeMailchimp();
testMailchimpConnection().catch((error: Error) => {
  logger.error({
    message: 'Failed to connect to Mailchimp during startup - will retry on first request',
    error: error.message,
  });
  // Don't exit the process - let the server start and handle errors per-request
});

testConnection().catch((error: Error) => {
  logger.error({
    message: 'Failed to connect to Supabase during startup - will retry on first request',
    error: error.message,
  });
  // Don't exit the process - let the server start and handle errors per-request
});

// Note: Security headers are configured in vercel.json for edge-level performance

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
interface CorsCallback {
  (err: Error | null, allow?: boolean): void;
}

const corsOptions: cors.CorsOptions = {
  origin: function (origin: string | undefined, callback: CorsCallback): void {
    // Allow requests with no origin (like curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    const allowedOrigins: string[] = [process.env.FRONTEND_URL].filter(Boolean) as string[];

    if (allowedOrigins.some((allowed) => origin.includes(allowed.replace(/^https?:\/\//, '')))) {
      callback(null, true);
    } else {
      logger.warn({
        message: 'CORS blocked request',
        origin: origin,
        allowedOrigins: allowedOrigins,
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Cache-Control',
    'Accept',
    'Accept-Language',
    'Accept-Encoding',
  ],
};

app.use(cors(corsOptions));

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
app.use(httpLogger);

app.use('/api', validateReferer);

// Root route for Vercel health checks and screenshots
app.get('/', (_req: Request, res: Response): void => {
  res.json({
    name: 'SJBA API',
    version: '1.0.0',
    status: 'running',
    description: 'Backend API for SJBA website',
    endpoints: {
      health: '/health',
      api: '/v1',
    },
  });
});

app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (_req: Request, res: Response): void => {
  res.status(204).end();
});

app.get('/favicon.png', (_req: Request, res: Response): void => {
  res.status(204).end();
});

// API Routes
app.use('/v1/board-members', boardMembersRoutes);
app.use('/v1/newsletter-sign-ups', newsletterRoutes);
app.use('/v1/events', eventsRoutes);
app.use('/v1/contact', contactRoutes);
app.use('/v1/members', membersRoutes);
app.use('/v1/semesters', semestersRoutes);

// API info endpoint
app.get('/v1', (_req: Request, res: Response): void => {
  res.json({
    name: 'SJBA API',
    version: '1.0.0',
    description: 'Backend API for SJBA website with secure public endpoints',
    endpoints: {
      'GET /v1/board-members': 'Get all board members',
      'GET /v1/board-members/:id': 'Get specific board member',
      'POST /v1/newsletter-sign-ups': 'Sign up for newsletter',
      'GET /v1/events': 'Get all events',
      'GET /v1/events/upcoming': 'Get upcoming events',
      'GET /v1/events/:id': 'Get specific event',
      'POST /v1/contact': 'Submit contact form',
      'GET /v1/members': 'Get all members',
      'POST /v1/members': 'Create a new member',
      'GET /v1/semesters': 'Get all semesters',
      'POST /v1/semesters': 'Create a new semester',
    },
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler as (err: Error, req: Request, res: Response, next: NextFunction) => void);

let server: http.Server | undefined;

// Graceful shutdown
const gracefulShutdown = (signal: string): void => {
  logger.info({
    message: `Received ${signal}, shutting down gracefully...`,
  });
  if (server) {
    server.close((err?: Error) => {
      if (err) {
        logger.error({
          message: `Error shutting down server`,
          error: err,
        });
        process.exit(1);
      }

      logger.info({
        message: 'Server shut down gracefully',
      });
      process.exit(0);
    });
  } else {
    logger.info({
      message: 'No server to close, shutting down gracefully',
    });
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err: Error) => {
  logger.error({
    message: 'Uncaught exception',
    error: err,
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error({
    message: 'Unhandled rejection',
    reason: reason,
    promise: promise,
  });
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Only start server if not in Vercel (serverless) environment
if (process.env.VERCEL !== '1') {
  server = app.listen(PORT, () => {
    logger.info({
      message: `SJBA Backend server running on port ${PORT}`,
      environment: process.env.NODE_ENV || 'development',
      database: 'Supabase PostgreSQL',
      healthCheck: `http://localhost:${PORT}/health`,
      apiInfo: `http://localhost:${PORT}/v1`,
    });
  });
}

export default app;
