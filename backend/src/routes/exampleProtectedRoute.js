import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.get('/admin/ping', jwtAuth, requireAdmin, (req, res) => {
  return res.json({
    success: true,
    data: {
      message: `Hello ${req.user?.email}, you have ${req.user?.role} access.`,
    },
  });
});

export default router;
