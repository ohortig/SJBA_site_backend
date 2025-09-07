import express from 'express';
import { param, query, validationResult } from 'express-validator';
import { Event } from '../models/index.js';
import { asyncHandler, validateInput } from '../middleware/index.js';

const router = express.Router();

// Apply input validation middleware
router.use(validateInput);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
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
], handleValidationErrors, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    isPublic = 'true',
    isFeatured,
    status = 'published',
    category,
    upcoming,
    past
  } = req.query;

  // Build query
  const query = {
    isPublic: isPublic === 'true',
    status
  };

  if (isFeatured !== undefined) {
    query.isFeatured = isFeatured === 'true';
  }

  if (category) {
    query.categories = category;
  }

  // Date filtering
  const now = new Date();
  if (upcoming === 'true') {
    query.date = { $gte: now };
  } else if (past === 'true') {
    query.date = { $lt: now };
  }

  // Execute query with pagination
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    isPublic: isPublic === 'true',
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    status,
    category,
    upcoming: upcoming === 'true',
    past: past === 'true',
    orderBy: upcoming === 'true' ? 'event_date' : 'event_date',
    orderDirection: upcoming === 'true' ? 'asc' : 'desc'
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
], handleValidationErrors, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

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
], handleValidationErrors, asyncHandler(async (req, res) => {
  const {
    q: searchQuery,
    page = 1,
    limit = 10,
    category
  } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    categories: category ? [category] : undefined
  };

  const result = await Event.search(searchQuery, options);

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
], handleValidationErrors, asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      }
    });
  }

  // Check if event is public
  if (!event.isPublic || event.status !== 'published') {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      }
    });
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
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { category } = req.params;
  const {
    page = 1,
    limit = 10,
    upcoming
  } = req.query;

  const query = {
    categories: category,
    isPublic: true,
    status: 'published'
  };

  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: upcoming === 'true' ? { date: 1 } : { date: -1 }
  };

  const result = await Event.findAll({
    page: options.page,
    limit: options.limit,
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

/*
  @desc    Create event (admin endpoint - would require authentication in production)
  @route   POST /api/v1/events
  @access  Private (commented out for public API)
*/
/*
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Description is required and must be less than 2000 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
  body('categories').optional().isArray().withMessage('Categories must be an array'),
  body('categories.*').optional().isIn(['workshop', 'conference', 'networking', 'seminar', 'hackathon', 'meetup', 'webinar', 'other']).withMessage('Invalid category')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event
  });
}));
*/

export default router;
