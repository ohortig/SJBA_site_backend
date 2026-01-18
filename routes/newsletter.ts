import express, { type Request, type Response } from 'express';
import { body, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { NewsletterSignup } from '@models/index.js';
import { asyncHandler, validateInput } from '@middleware/index.js';

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
    .withMessage('Please provide a valid email address'),
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
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Year must be less than 50 characters'),
  body('college')
    .notEmpty()
    .withMessage('College is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('College must be less than 50 characters'),
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const { email, first_name, last_name, year, college } = req.body as {
    email: string;
    first_name: string;
    last_name: string;
    year: string;
    college: string;
  };

  // Check if email already exists
  const existingSignup = await NewsletterSignup.findByEmail(email);

  if (existingSignup) {
    res.status(409).json({
      success: false,
      error: {
        message: 'Email is already subscribed to the newsletter',
        code: 'EMAIL_ALREADY_SUBSCRIBED'
      }
    });
    return;
  }

  const signupData = {
    email,
    first_name,
    last_name,
    year,
    college
  };

  const newsletterSignup = await NewsletterSignup.create(signupData);

  res.status(201).json({
    success: true,
    message: 'Successfully signed up for newsletter',
    data: newsletterSignup?.toJSON()
  });
}));

export default router;
