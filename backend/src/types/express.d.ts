import type { UserPayload } from '../middleware/jwtAuth';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
