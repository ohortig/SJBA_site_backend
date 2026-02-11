import express, { type Request, type Response } from 'express';
import { body, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { Semester } from '../models/index.js';
import { asyncHandler, validateInput } from '../middleware/index.js';

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
  @desc    Get all semesters
  @route   GET /v1/semesters
  @access  Public
*/
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
     const semesters = await Semester.findAll();

     res.status(200).json({
          success: true,
          count: semesters.length,
          data: semesters.map(semester => Semester.toJSON(semester.toDatabase()))
     });
}));

/*
  @desc    Create a new semester
  @route   POST /v1/semesters
  @access  Public
*/
router.post('/', [
     body('semesterName').trim().notEmpty().withMessage('Semester name is required')
          .isLength({ max: 100 }).withMessage('Semester name cannot exceed 100 characters'),
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
     const { semesterName } = req.body;

     try {
          const semester = await Semester.create({
               semester_name: semesterName,
          });

          res.status(201).json({
               success: true,
               data: semester ? Semester.toJSON(semester.toDatabase()) : null
          });
     } catch (error: unknown) {
          const message = error instanceof Error ? error.message : '';

          // The model throws "Semester '...' already exists." for duplicates
          if (message.includes('already exists')) {
               res.status(409).json({
                    success: false,
                    error: {
                         message: 'Semester with this name already exists',
                         code: 'SEMESTER_DUPLICATE'
                    }
               });
               return;
          }

          // The model throws "Validation failed: ..." for input validation errors
          if (message.startsWith('Validation failed')) {
               res.status(400).json({
                    success: false,
                    error: {
                         message: 'Semester validation failed',
                         code: 'SEMESTER_VALIDATION_ERROR'
                    }
               });
               return;
          }

          // Re-throw unexpected errors to be handled by the global error handler
          throw error;
     }
}));

export default router;
