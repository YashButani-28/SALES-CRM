// backend/src/routes/uploadRoutes.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { createPresignedUploadUrl, getPublicUrl, deleteFile } from '../services/uploadService.js';

const router = Router();

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  return next();
};

router.use(authenticate);

router.post(
  '/sign',
  [
    body('filename').isString().notEmpty().withMessage('filename is required'),
    body('contentType').isString().notEmpty().withMessage('contentType is required'),
  ],
  handleValidation,
  async (req, res) => {
    try {
      const { filename, contentType } = req.body;
      
      const { url, key } = await createPresignedUploadUrl(filename, contentType);
      
      return res.json({
        success: true,
        data: {
          url,
          key,
          publicUrl: getPublicUrl(key)
        }
      });
    } catch (error) {
      console.error('Failed to generate upload URL', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

router.delete(
  '/:key',
  async (req, res) => {
    try {
      const { key } = req.params;
      
      const success = await deleteFile(key);
      
      if (!success) {
        return res.status(500).json({ success: false, error: 'Failed to delete file' });
      }
      
      return res.json({ success: true, data: true });
    } catch (error) {
      console.error('Failed to delete file', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Add a mock endpoint to handle uploads (this won't actually save files)
router.put('/mock-upload/:key', (req, res) => {
  res.status(200).send('File uploaded successfully');
});

export default router;