import express, { type Request, type Response } from 'express';
import { param, query, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { Event } from '../models/index.js';
import { asyncHandler, validateInput } from '../middleware/index.js';
import type { EventCategory, EventStatus } from '../types/index.js';

const router = express.Router();

// Apply input validation middleware
router.use(validateInput);

// Query parameter types
interface EventsQuery {
  page?: string;
  limit?: string;
  isPublic?: string;
  isFeatured?: string;
  status?: EventStatus;
  category?: EventCategory;
  upcoming?: string;
  past?: string;
}

interface SearchQuery {
  q?: string;
  page?: string;
  limit?: string;
  category?: EventCategory;
}



// Validation middleware
const handleValidationErrors = (
  req: Request,
  res: Response,
  next: express.NextFunction
): void => {
  const errors: Result<ValidationError> = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
    return;
  }
  next();
};

// @desc    Get all events with pagination and filtering
// @route   GET /api/v1/events
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean'),
  query('isFeatured').optional().isBoolean().withMessage('isFeatured must be a boolean'),
  query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']).withMessage('Invalid status'),
  query('category').optional().isIn(['workshop', 'conference', 'networking', 'seminar', 'hackathon', 'meetup', 'webinar', 'other']).withMessage('Invalid category')
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request<object, object, object, EventsQuery>, res: Response) => {
  const {
    page = '1',
    limit = '10',
    isPublic = 'true',
    isFeatured,
    status = 'published',
    category,
    upcoming,
    past
  } = req.query;

  // Execute query with pagination
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    isPublic: isPublic === 'true',
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    status: status as EventStatus,
    category: category as EventCategory | undefined,
    upcoming: upcoming === 'true',
    past: past === 'true',
    orderBy: upcoming === 'true' ? 'event_date' : 'event_date',
    orderDirection: (upcoming === 'true' ? 'asc' : 'desc') as 'asc' | 'desc'
  };

  const result = await Event.findAll(options);

  res.status(200).json({
    success: true,
    count: result.events.length,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1
    },
    data: result.events.map(event => event.toJSON())
  });
}));

// @desc    Get upcoming events
// @route   GET /api/v1/events/upcoming
// @access  Public
router.get('/upcoming', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 5;

  const events = await Event.findUpcoming(limit);

  res.status(200).json({
    success: true,
    count: events.length,
    data: events.map(event => event.toJSON())
  });
}));

// @desc    Search events
// @route   GET /api/v1/events/search
// @access  Public
router.get('/search', [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['workshop', 'conference', 'networking', 'seminar', 'hackathon', 'meetup', 'webinar', 'other']).withMessage('Invalid category')
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request<object, object, object, SearchQuery>, res: Response) => {
  const {
    q: searchQuery,
    page = '1',
    limit = '10',
    category
  } = req.query;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    categories: category ? [category] : undefined
  };

  const result = await Event.search(searchQuery as string, options);

  res.status(200).json({
    success: true,
    count: result.events.length,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1
    },
    data: result.events.map(event => event.toJSON())
  });
}));

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid event ID')
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id as string);

  if (!event) {
    res.status(404).json({
      success: false,
      error: {
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      }
    });
    return;
  }

  // Check if event is public
  if (!event.isPublic || event.status !== 'published') {
    res.status(404).json({
      success: false,
      error: {
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: event.toJSON()
  });
}));

/*
  @desc    Get events by category
  @route   GET /api/v1/events/category/:category
  @access  Public
*/
router.get('/category/:category', [
  param('category').isIn(['workshop', 'conference', 'networking', 'seminar', 'hackathon', 'meetup', 'webinar', 'other']).withMessage('Invalid category'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const category = req.params.category as EventCategory;
  const page = (req.query.page as string) ?? '1';
  const limit = (req.query.limit as string) ?? '10';
  const upcoming = req.query.upcoming as string | undefined;

  const result = await Event.findAll({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    isPublic: true,
    status: 'published',
    category,
    upcoming: upcoming === 'true',
    orderBy: 'event_date',
    orderDirection: upcoming === 'true' ? 'asc' : 'desc'
  });

  res.status(200).json({
    success: true,
    count: result.events.length,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1
    },
    data: result.events.map(event => event.toJSON())
  });
}));

export default router;
