import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import roleRoutes from './roles.js';
import permissionRoutes from './permissions.js';
import moduleRoutes from './modules.js';
import customFieldRoutes from './customFieldRoutes.js';
import customFieldValueRoutes from './customFieldValueRoutes.js';
import uploadRoutes from './uploadRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/modules', moduleRoutes);
router.use('/custom-fields', customFieldRoutes);
router.use('/custom-field-values', customFieldValueRoutes);
router.use('/uploads', uploadRoutes);

export default router;
