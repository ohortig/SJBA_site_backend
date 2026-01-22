import express, { type Request, type Response } from 'express';
import { param, query, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { Event } from '../models/index.js';
import { asyncHandler, validateInput } from '../middleware/index.js';

const router = express.Router();

// Apply input validation middleware
router.use(validateInput);

// Query parameter types
interface EventsQuery {
  page?: string;
  limit?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
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
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search query cannot be empty'),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request<object, object, object, EventsQuery>, res: Response) => {
  const {
    page = '1',
    limit = '10',
    search,
    startDate,
    endDate,
  } = req.query;

  const result = await Event.findAll({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search,
    startDate,
    endDate,
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
    data: result.events
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
    data: events
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

  res.status(200).json({
    success: true,
    data: event
  });
}));

export default router;
