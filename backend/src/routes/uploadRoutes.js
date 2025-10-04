import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { signUploadHandler } from '../controllers/uploadController';

const router = Router();

router.post('/sign', jwtAuth, signUploadHandler);

export default router;
