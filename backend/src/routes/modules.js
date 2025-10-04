import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { listModulesController } from '../controllers/moduleController.js';

const router = Router();

router.get('/', authenticate, listModulesController);

export default router;
