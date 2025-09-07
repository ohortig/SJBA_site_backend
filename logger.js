import pino from 'pino';

// Configure logger based on environment
const loggerConfig = {
  level: 'info'
};

// Only use pino-pretty in development
if (process.env.NODE_ENV === 'development') {
  loggerConfig.transport = {
    target: 'pino-pretty'
  };
}

export const logger = pino(loggerConfig);