# Stern Jewish Business Association Backend API

A secure and scalable Node.js/Express backend API for the Stern Jewish Business Association website.

🌐 **Live API**: [sjba-site-backend.vercel.app](https://sjba-site-backend.vercel.app)
📊 **Frontend**: [sjba-site.vercel.app](https://sjba-site.vercel.app)

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Pino with structured logging
- **Validation**: Express Validator
- **Deployment**: Vercel (Serverless)
- **Environment**: ESM (ES Modules)

## API Endpoints

### Public Endpoints
- `GET /api/v1/board-members` - Get all board members
- `GET /api/v1/board-members/:id` - Get specific board member
- `POST /api/v1/newsletter-sign-ups` - Subscribe to newsletter
- `GET /api/v1/events` - Get upcoming events
- `GET /health` - Health check endpoint

### System Endpoints
- `GET /` - API information and status
- `GET /api/v1` - API documentation

## Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Git
- Supabase account and project

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ohortig/SJBA_site_backend.git
   cd SJBA_site_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory and add:
   ```env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Frontend Configuration
   FRONTEND_URL=http://localhost:5173
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```
   
   **Environment Values:**
   - **SUPABASE_URL**: Your Supabase project URL (from Supabase dashboard)
   - **SUPABASE_ANON_KEY**: Your Supabase anonymous key (from Supabase dashboard)
   - **FRONTEND_URL**: Frontend URL for CORS configuration
     - **Development**: `http://localhost:5173`
     - **Production**: `https://sjba-site.vercel.app`

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The API will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm test` - Run Jest tests
- `npm run seed` - Seed database with sample data
- `npm run seed:clear` - Clear database

## Project Structure

```
/
├── api/
│   └── index.js          # Vercel serverless entry point
├── config/
│   ├── index.js          # Configuration exports
│   └── supabase.js       # Supabase client configuration
├── middleware/
│   ├── errorHandler.js   # Global error handling
│   ├── security.js       # Security and validation middleware
│   └── index.js          # Middleware exports
├── models/
│   ├── BoardMember.js    # Board member data model
│   ├── Event.js          # Event data model
│   ├── NewsletterSignup.js # Newsletter subscription model
│   └── index.js          # Model exports
├── routes/
│   ├── boardMembers.js   # Board member API routes
│   ├── events.js         # Event API routes
│   ├── newsletter.js     # Newsletter API routes
│   └── index.js          # Route exports
├── logger.js             # Structured logging configuration
├── server.js             # Main Express application
├── vercel.json           # Vercel deployment configuration
└── package.json          # Dependencies and scripts
```

## Database Schema

The API uses Supabase (PostgreSQL) with the following main tables:
- `board_members` - Board member profiles and information
- `newsletter_signups` - Email newsletter subscriptions
- `events` - Upcoming events and announcements

## Deployment

This API is deployed on Vercel as a serverless function.

### Production Environment Variables
Set the following in your Vercel dashboard:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `FRONTEND_URL`
- `NODE_ENV=production`

## Contributing

This project is actively maintained by the SJBA tech team. To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contact

Omer Hortig  
📧 Email: [oh2065@nyu.edu](mailto:oh2065@nyu.edu)

Feel free to reach out to report bugs, ask questions, or inquire about joining the development team.