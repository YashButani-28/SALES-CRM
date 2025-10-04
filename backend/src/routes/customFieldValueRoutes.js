import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import {
  createCustomFieldValueHandler,
  getCustomFieldValuesHandler,
  updateCustomFieldValueHandler,
} from '../controllers/customFieldValueController';

const router = Router();

router.use(jwtAuth);

router.get('/', getCustomFieldValuesHandler);
router.post('/', createCustomFieldValueHandler);
router.put('/:id', updateCustomFieldValueHandler);

export default router;
