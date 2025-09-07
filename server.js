import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { initializeSupabase, testConnection } from './config/supabase.js';
import { errorHandler, notFound, validateReferer } from './middleware/index.js';

import { boardMembersRoutes, newsletterRoutes, eventsRoutes } from './routes/index.js';

import { logger } from './logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy when deployed (Vercel)
if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
  app.set('trust proxy', 1);
}

initializeSupabase();

testConnection().catch(error => {
  logger.error({
    message: 'Failed to connect to Supabase',
    error: error.message
  });
  process.exit(1);
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.some(allowed => origin.includes(allowed.replace(/^https?:\/\//, '')))) {
      callback(null, true);
    } else {
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
    'Accept-Encoding'
  ]
};

app.use(cors(corsOptions));

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use('/api', validateReferer);

// Root route for Vercel health checks and screenshots
app.get('/', (req, res) => {
  res.json({
    name: 'SJBA API',
    version: '0.5.0',
    status: 'running',
    description: 'Backend API for SJBA website',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle favicon requests to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

// API Routes
app.use('/api/v1/board-members', boardMembersRoutes);
app.use('/api/v1/newsletter-sign-ups', newsletterRoutes);
app.use('/api/v1/events', eventsRoutes);

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'SJBA API',
    version: '0.5.0',
    description: 'Backend API for SJBA website with secure public endpoints',
    endpoints: {
      'GET /api/v1/board-members': 'Get all board members',
      'GET /api/v1/board-members/:id': 'Get specific board member',
      'POST /api/v1/newsletter-sign-ups': 'Sign up for newsletter',
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

let server;

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info({
    message: `Received ${signal}, shutting down gracefully...`
  })
  if (server) {
    server.close((err) => {
      if (err) {
        logger.error({
          message: `Error shutting down server`,
          error: err
        })
        process.exit(1);
      }
      
      logger.info({
        message: 'Server shut down gracefully'
      })
      process.exit(0);
    });
  } else {
    logger.info({
      message: 'No server to close, shutting down gracefully'
    })
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error({
    message: "Uncaught exception",
    error: err
  })
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error({
    message: "Unhandled rejection",
    reason: reason,
    promise: promise
  })
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
      apiInfo: `http://localhost:${PORT}/api/v1`
    });
  });
}

export default app;
