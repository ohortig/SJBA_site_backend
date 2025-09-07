# Backend API Integration

This directory contains the Axios-based API client and data services for connecting to the SJBA backend.

### Project Structure

```
/
├── config/
│   └── supabase.js     # Supabase client configuration
├── database/
│   └── schema.sql      # PostgreSQL schema
├── middleware/
│   ├── errorHandler.js # Error handling middleware
│   └── security.js    # Security middleware
├── models/
│   ├── BoardMember.js  # Board member model
│   ├── Event.js       # Event model
│   └── NewsletterSignup.js # Newsletter model
├── routes/
│   ├── boardMembers.js # Board member routes
│   ├── events.js      # Event routes
│   └── newsletter.js  # Newsletter routes
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
└── env.example        # Environment template
```

## Features

- ✅ **Axios HTTP Client** - Modern, promise-based HTTP client with interceptors
- ✅ **Domain-Based Security** - Secure public API access without exposed secrets
- ✅ **Request/Response Interceptors** - Global error handling and request logging
- ✅ **Automatic Error Transformation** - Custom ApiError class with detailed error information
- ✅ **Request Timeouts** - 10-second timeout for all requests
- ✅ **TypeScript Support** - Full type safety for all API calls
- ✅ **Response Time Logging** - Debug performance with automatic timing

## Security Approach

⚠️ **Important**: Frontend applications cannot securely store API keys or secrets. Instead, this implementation uses:

1. **CORS Protection** - Backend restricts origins to your domain
2. **Rate Limiting** - Backend limits requests per IP
3. **Referer Checking** - Backend validates requests come from your site
4. **Public API Design** - Endpoints designed for public consumption

## Environment Variables

Add this to your `.env` file:

```env
VITE_BACKEND_URL=https://your-backend-url.com
# Note: No API key needed - frontend apps cannot securely store secrets
```

## Usage Examples

### Board Members

```typescript
import { boardMembersService } from '@/api/dataService';

// Get all board members
const members = await boardMembersService.getAll();

// Get specific board member
const member = await boardMembersService.getById('member-id');
```

### Newsletter Signup

```typescript
import { newsletterService } from '@/api/dataService';

// Sign up for newsletter
const result = await newsletterService.signup({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  source: 'homepage'
});
```

### Events

```typescript
import { eventsService } from '@/api/dataService';

// Get paginated events
const { events, pagination } = await eventsService.getAll({
  page: 1,
  limit: 10,
  isPublic: true
});

// Get upcoming events
const upcoming = await eventsService.getUpcoming(5);

// Search events
const { events: searchResults } = await eventsService.search('hackathon');

// Get specific event
const event = await eventsService.getById('event-id');
```

### Error Handling

The Axios client provides enhanced error handling with automatic transformation:

```typescript
import { ApiError } from '@/api/client';

try {
  const members = await boardMembersService.getAll();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    
    // Handle specific error types
    if (error.status === 401) {
      // Handle authentication error
      redirectToLogin();
    } else if (error.status === 0) {
      // Handle network error
      showNetworkErrorMessage();
    } else if (error.status >= 500) {
      // Handle server errors
      showServerErrorMessage();
    }
    
    // Access error code if provided by backend
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Advanced Features

```typescript
import { apiClient } from '@/api/client';

// Get the underlying axios instance for advanced usage
const axiosInstance = apiClient.getAxiosInstance();

// Add custom interceptors
axiosInstance.interceptors.request.use((config) => {
  // Add loading spinner
  showLoadingSpinner();
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    // Hide loading spinner
    hideLoadingSpinner();
    return response;
  },
  (error) => {
    hideLoadingSpinner();
    return Promise.reject(error);
  }
);
```

## API Endpoints

- `GET api/v1/board-members` - Get all board members
- `POST api/v1/newsletter-sign-ups` - Sign up for newsletter
- `GET api/v1/events` - Get paginated events with optional filtering

## Axios Benefits Over Fetch

✅ **Request/Response Interceptors** - Global handling of auth, loading states, errors  
✅ **Automatic JSON Handling** - No manual `response.json()` calls  
✅ **Better Error Information** - Rich error objects with request/response details  
✅ **Request/Response Transformation** - Automatic data transformation  
✅ **Timeout Support** - Built-in request timeouts (10s default)  
✅ **Request Cancellation** - Easy to cancel requests (extensible)  
✅ **Instance Configuration** - Reusable configuration across requests  
✅ **Wide Browser Support** - Works in older browsers

## Backend Security Recommendations

Configure your backend with these security measures:

### 1. CORS Configuration
```javascript
// Express.js example
app.use(cors({
  origin: [
    'https://yourdomain.com', 
    'https://www.yourdomain.com',
    'http://localhost:3000' // for development
  ],
  credentials: true
}));
```

### 2. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}));
```

### 3. Referer Validation
```javascript
app.use('/api', (req, res, next) => {
  const referer = req.get('Referer');
  const allowedDomains = ['yourdomain.com'];
  
  if (!referer || !allowedDomains.some(domain => referer.includes(domain))) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
```

### 4. Additional Security
- ✅ Use HTTPS in production
- ✅ Implement request size limits
- ✅ Add request logging and monitoring
- ✅ Use helmet.js for security headers
- ✅ Validate and sanitize all inputs
- ✅ Consider API versioning (`/api/v1/`)

### 5. Public API Design
Since this is a public website, design your endpoints to be safely public:
- ✅ Board members (public information)
- ✅ Public events (public information)  
- ✅ Newsletter signup (accepts public submissions)
- ❌ Avoid exposing sensitive admin data
- ❌ Avoid endpoints that modify critical data
