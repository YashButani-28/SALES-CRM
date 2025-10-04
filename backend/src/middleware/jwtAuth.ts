import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

const { JWT_SECRET = '' } = process.env;

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ success: false, error: 'JWT secret not configured' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload | undefined;

    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
      return res.status(401).json({ success: false, error: 'Invalid token payload' });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
};
