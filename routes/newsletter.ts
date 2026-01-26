import express, { type Request, type Response } from 'express';
import { body, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { NewsletterSignup } from '../models/index.js';
import { asyncHandler, validateInput } from '../middleware/index.js';
import { addSubscriber } from '../config/index.js';

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
    .matches(/@(.+\.)?nyu\.edu$/i)
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
}));

export default router;
