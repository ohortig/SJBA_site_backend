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
     } catch (err: any) {
          const name: string | undefined = err?.name;
          const code: string | number | undefined = err?.code;
          const message: string = typeof err?.message === 'string' ? err.message : '';

          const isDuplicateError =
               code === 'ER_DUP_ENTRY' ||
               code === 'SQLITE_CONSTRAINT' ||
               (typeof code === 'number' && code === 11000) || // common Mongo duplicate
               (typeof name === 'string' && name.includes('Unique') && name.includes('Constraint')) ||
               /duplicate/i.test(message);

          const isValidationError =
               (typeof name === 'string' && name.toLowerCase().includes('validation')) ||
               /validation/i.test(message);

          if (isDuplicateError) {
               res.status(409).json({
                    success: false,
                    error: {
                         message: 'Semester with this name already exists',
                         code: 'SEMESTER_DUPLICATE'
                    }
               });
               return;
          }

          if (isValidationError) {
               res.status(400).json({
                    success: false,
                    error: {
                         message: 'Semester validation failed',
                         code: 'SEMESTER_VALIDATION_ERROR',
                         details: message || undefined
                    }
               });
               return;
          }

          // Re-throw unexpected errors to be handled by the global error handler
          throw err;
     }
}));

export default router;
