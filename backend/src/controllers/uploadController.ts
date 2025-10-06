import { Request, Response } from 'express';
import { z } from 'zod';
import { createPresignedUploadUrl } from '../services/uploadService';

const signSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export const signUploadHandler = async (req: Request, res: Response) => {
  const parse = signSchema.safeParse(req.body);

  if (!parse.success) {
    return res.status(400).json({ success: false, error: parse.error.message });
  }

  try {
    const { url, key } = await createPresignedUploadUrl(
      parse.data.filename,
      parse.data.contentType
    );
    return res.json({ success: true, data: { url, key } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to sign upload' });
  }
};
