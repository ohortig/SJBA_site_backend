import express, { type Request, type Response } from 'express';
import { param, validationResult, type ValidationChain, type Result, type ValidationError } from 'express-validator';
import { BoardMember } from '../models/index.js';
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
  @desc    Get all board members
  @route   GET /api/v1/board-members
  @access  Public
*/
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const boardMembers = await BoardMember.findAll();

  res.status(200).json({
    success: true,
    count: boardMembers.length,
    data: boardMembers.map(member => BoardMember.toJSON(member.toDatabase()))
  });
}));

/*
  @desc    Get single board member
  @route   GET /api/v1/board-members/:id
  @access  Public
*/
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid board member ID')
] as ValidationChain[], handleValidationErrors, asyncHandler(async (req: Request, res: Response) => {
  const boardMember = await BoardMember.findById(req.params.id as string);

  if (!boardMember) {
    res.status(404).json({
      success: false,
      error: {
        message: 'Board member not found',
        code: 'BOARD_MEMBER_NOT_FOUND'
      }
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: BoardMember.toJSON(boardMember.toDatabase())
  });
}));

export default router;