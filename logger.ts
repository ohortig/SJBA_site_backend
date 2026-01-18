import pino from 'pino';
import pinoHttp from 'pino-http';

interface LoggerConfig {
  level: string;
  transport?: {
    target: string;
  };
}

// Configure logger based on environment
const loggerConfig: LoggerConfig = {
  level: 'info'
};

// Use pino-pretty unless in production
if (process.env.NODE_ENV !== 'production') {
  loggerConfig.transport = {
    target: 'pino-pretty'
  };
}

export const logger = pino(loggerConfig);

// HTTP request logging middleware
// Note: pinoHttp types are complex; using type assertion for compatibility
export const httpLogger = (pinoHttp as unknown as typeof pinoHttp.default)({
  logger,
  autoLogging: {
    ignore: (req: { url?: string }) => req.url === '/health' || req.url === '/favicon.ico'
  }
});