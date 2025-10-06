import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { createPermissionController, listPermissionsController } from '../controllers/permissionController.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['manage_permissions', 'manage_roles'], { mode: 'any' }),
  listPermissionsController
);

router.post(
  '/',
  authenticate,
  authorize(['manage_permissions']),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
  ],
  createPermissionController
);

export default router;
