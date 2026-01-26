import express, { type Request, type Response } from 'express';
import { body, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { NewsletterSignup } from '../models/index.js';
import { asyncHandler, validateInput } from '../middleware/index.js';
import { addSubscriber, removeSubscriber } from '../config/index.js';
import { logger } from '../logger.js';

const router = express.Router();

// Apply input validation middleware
router.use(validateInput);

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

/*
  @desc    Sign up for newsletter
  @route   POST /api/v1/newsletter-sign-ups
  @access  Public
*/

router.post('/', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .matches(/@([a-z0-9-]+\.)?nyu\.edu$/i)
    .withMessage('Please use your NYU email address (@nyu.edu)'),
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { email, first_name, last_name } = req.body as {
    email: string;
    first_name: string;
    last_name: string;
  };

  // Attempt Mailchimp subscription first
  try {
    await addSubscriber(email, first_name, last_name);
  } catch (error) {
    // If Mailchimp fails, do not proceed to DB and return error to user
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to subscribe to newsletter. Please try again later.',
        code: 'MAILCHIMP_ERROR'
      }
    });
    return;
  }

  // Now attempt database operation with rollback on failure
  try {
    // Check if email already exists
    let newsletterSignup = await NewsletterSignup.findByEmail(email);

    if (newsletterSignup) {
      // Update existing signup
      newsletterSignup.firstName = first_name;
      newsletterSignup.lastName = last_name;
      await newsletterSignup.save();
    } else {
      // Create new signup
      newsletterSignup = await NewsletterSignup.create({
        email,
        first_name,
        last_name
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully signed up for newsletter',
      data: newsletterSignup?.toJSON()
    });
  } catch (dbError: any) {
    // Database operation failed - attempt to rollback Mailchimp subscription
    logger.error({
      message: 'Critical: Database operation failed after successful Mailchimp subscription',
      email,
      dbError: dbError.message || dbError
    });
    try {
      await removeSubscriber(email);
      logger.info({
        message: 'Successfully rolled back Mailchimp subscription after database failure',
        email
      });
    } catch (rollbackError: any) {
      // Rollback failed - this is a critical inconsistency that requires manual intervention
      logger.error({
        message: 'CRITICAL INCONSISTENCY: Failed to rollback Mailchimp subscription after database failure',
        email,
        dbError: dbError.message || dbError,
        rollbackError: rollbackError.message || rollbackError,
        action: 'MANUAL_RECONCILIATION_REQUIRED'
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to complete newsletter signup. Please try again later.',
        code: 'DATABASE_ERROR'
      }
    });
  }

  res.status(isNewSignup ? 201 : 200).json({
    success: true,
    message: 'Successfully signed up for newsletter',
    data: newsletterSignup?.toJSON()
  }); 
}));

export default router;
