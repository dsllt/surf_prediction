import { AuthService } from '@src/services/auth';
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  try {
    const token = req.headers?.['x-access-token'];
    const claims = AuthService.decodeToken(token as string);
    req.context = { userId: claims.sub };
    next();
  } catch (error) {
    res
      .status?.(401)
      .send({ code: 401, error: (error as { message: string }).message });
  }
}
