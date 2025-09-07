import express from 'express';
import { param, validationResult } from 'express-validator';
import { BoardMember } from '../models/index.js';
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

/*
  @desc    Get all board members
  @route   GET /api/v1/board-members
  @access  Public
*/
router.get('/', asyncHandler(async (req, res) => {  
  const boardMembers = await BoardMember.findAll();

  res.status(200).json({
    success: true,
    count: boardMembers.length,
    data: boardMembers.map(member => member.toJSON())
  });
}));

/*
  @desc    Get single board member
  @route   GET /api/v1/board-members/:id
  @access  Public
*/
router.get('/:id', [
  param('id').isUUID().withMessage('Invalid board member ID')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const boardMember = await BoardMember.findById(req.params.id);

  if (!boardMember) {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Board member not found',
        code: 'BOARD_MEMBER_NOT_FOUND'
      }
    });
  }

  res.status(200).json({
    success: true,
    data: boardMember.toJSON()
  });
}));

export default router;