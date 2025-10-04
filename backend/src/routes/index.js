import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import roleRoutes from './roles.js';
import permissionRoutes from './permissions.js';
import moduleRoutes from './modules.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/modules', moduleRoutes);

export default router;
