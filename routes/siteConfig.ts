import express, { type Request, type Response } from 'express';
import {
  query,
  validationResult,
  type ValidationChain,
  type Result,
  type ValidationError,
} from 'express-validator';
import { getSupabase } from '../config/supabase.js';
import { asyncHandler, validateInput } from '../middleware/index.js';

const router = express.Router();

router.use(validateInput);

const handleValidationErrors = (req: Request, res: Response, next: express.NextFunction): void => {
  const errors: Result<ValidationError> = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Missing required query parameter: keys',
        code: 'MISSING_PARAM',
      },
    });
    return;
  }
  next();
};

/*
  @desc    Get site configuration values
  @route   GET /v1/site-config
  @access  Public
*/
router.get(
  '/',
  [
    query('keys').notEmpty().withMessage('Missing required query parameter: keys').isString(),
  ] as ValidationChain[],
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const keysParam = req.query.keys as string;
    const keysMatch = keysParam
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (keysMatch.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Missing required query parameter: keys',
          code: 'MISSING_PARAM',
        },
      });
      return;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', keysMatch);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data: data || [],
    });
  })
);

/*
  TODO: Future implementation
  @desc    Update site configuration values
  @route   POST /v1/site-config
  @access  Private/Admin
  @note    This endpoint is planned for creation once the internal admin portal 
           is set up to allow authenticated users to make changes to the site config.
*/

export default router;
