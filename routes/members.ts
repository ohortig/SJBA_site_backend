import express, { type Request, type Response } from 'express';
import { body, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { Member } from '../models/index.js';
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
  @desc    Get all members
  @route   GET /v1/members
  @access  Public
*/
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
     const members = await Member.findAll();

     res.status(200).json({
          success: true,
          count: members.length,
          data: members.map(member => Member.toJSON(member.toDatabase()))
     });
}));

/*
  @desc    Create a new member
  @route   POST /v1/members
  @access  Public
*/
router.post('/', [
     body('firstName').trim().notEmpty().withMessage('First name is required')
          .isLength({ max: 100 }).withMessage('First name cannot exceed 100 characters'),
     body('lastName').trim().notEmpty().withMessage('Last name is required')
          .isLength({ max: 100 }).withMessage('Last name cannot exceed 100 characters'),
     body('semester').trim().notEmpty().withMessage('Semester is required'),
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
     const { firstName, lastName, semester } = req.body;

     const member = await Member.create({
          first_name: firstName,
          last_name: lastName,
          semester: semester,
     });

     res.status(201).json({
          success: true,
          data: member ? Member.toJSON(member.toDatabase()) : null
     });
}));

export default router;
