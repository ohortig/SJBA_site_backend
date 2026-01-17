import pino from 'pino';
import pinoHttp from 'pino-http';

// Configure logger based on environment
const loggerConfig = {
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
export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent']
      }
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  },
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/favicon.ico'
  }
});