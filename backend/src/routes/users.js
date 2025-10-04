import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { createUserController, getCurrentUser } from '../controllers/userController.js';

const router = Router();

router.get('/me', authenticate, getCurrentUser);

router.post(
  '/',
  authenticate,
  authorize(['manage_users']),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('roleId').optional().isInt().withMessage('Role ID must be an integer').toInt(),
    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('Status must be active or inactive'),
  ],
  createUserController
);

export default router;
