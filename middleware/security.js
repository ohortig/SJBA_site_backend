const validateReferer = (req, res, next) => {
  // Skip referer validation for development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const referer = req.get('Referer') || req.get('Origin');

  // Allow requests with no referer (like curl, direct API calls, etc.)
  if (!referer) {
    return next();
  }

  const allowedDomains = [
    process.env.FRONTEND_DOMAIN,
  ].filter(Boolean);

  // If no allowed domains are configured, allow all requests
  if (allowedDomains.length === 0) {
    return next();
  }

  const isAllowed = allowedDomains.some(domain => {
    return referer.includes(domain);
  });

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Forbidden - Invalid referer',
        code: 'INVALID_REFERER'
      }
    });
  }

  next();
};

const validateInput = (req, res, next) => {
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  };

  const sanitizeObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    } else if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    } else if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

export { validateReferer, validateInput };
