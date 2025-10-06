import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import {
  createRoleController,
  listRolesController,
  getRoleModulePermissionsController,
  updateRoleModulePermissionsController,
} from '../controllers/roleController.js';

const router = Router();

router.get('/', authenticate, authorize(['manage_roles', 'manage_users'], { mode: 'any' }), listRolesController);

router.post(
  '/',
  authenticate,
  authorize(['manage_roles']),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().isString(),
    body('permissionIds').optional().isArray().withMessage('permissionIds must be an array'),
    body('permissionIds.*')
      .optional()
      .isInt().withMessage('permissionIds must contain integers only')
      .toInt(),
  ],
  createRoleController
);

router.get(
  '/:roleId/module-permissions',
  authenticate,
  authorize(['manage_roles', 'manage_permissions', 'manage_users'], { mode: 'any' }),
  [param('roleId').isInt().toInt()],
  getRoleModulePermissionsController
);

router.put(
  '/:roleId/module-permissions',
  authenticate,
  authorize(['manage_roles', 'manage_permissions'], { mode: 'any' }),
  [
    param('roleId').isInt().toInt(),
    body('permissions').isArray({ min: 0 }).withMessage('permissions must be an array'),
    body('permissions.*.module').isString().withMessage('module is required'),
    body('permissions.*.actions').optional().isArray().withMessage('actions must be an array of strings'),
    body('permissions.*.actions.*').optional().isString(),
  ],
  updateRoleModulePermissionsController
);

export default router;
