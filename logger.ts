import pino from 'pino';
import pinoHttp from 'pino-http';

interface LoggerConfig {
  level: string;
  transport?: {
    target: string;
    options?: {
      colorize: boolean;
      singleLine: boolean;
      translateTime: string;
      ignore: string;
      messageKey: string;
      customColors?: string;
    };
  };
}

// Configure logger based on environment
const loggerConfig: LoggerConfig = {
  level: 'info',
};

// Use pino-pretty unless in production
if (process.env.NODE_ENV !== 'production') {
  loggerConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: false,
      singleLine: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
      messageKey: 'message',
    },
  };
}

export const logger = pino(loggerConfig);

// HTTP request logging middleware
// Note: pinoHttp types are complex; using type assertion for compatibility
export const httpLogger = (pinoHttp as unknown as typeof pinoHttp.default)({
  logger,
  autoLogging: {
    ignore: (req: { url?: string }) => req.url === '/health' || req.url === '/favicon.ico',
  },
});
