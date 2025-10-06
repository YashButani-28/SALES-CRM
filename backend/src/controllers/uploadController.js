// backend/src/controllers/uploadController.js
import { createPresignedUploadUrl } from '../services/uploadService.js';

export const signUploadHandler = async (req, res) => {
  const { filename, contentType } = req.body;
  
  if (!filename || !contentType) {
    return res.status(400).json({ 
      success: false, 
      error: 'Filename and contentType are required' 
    });
  }

  try {
    const { url, key } = await createPresignedUploadUrl(filename, contentType);
    return res.json({ 
      success: true, 
      data: { 
        url, 
        key,
        publicUrl: `http://localhost:4000/files/${key}`
      } 
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to sign upload' 
    });
  }
};
