import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Request } from '../../types/express';

export class TokenMiddleware {
  async tokenValidation(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    // ✅ 1. Early return if no authorization
    if (!authorization) {
      return res
        .status(400)
        .json({ error: 'Authorization header is required' });
    }

    // ✅ 2. Check format: "Bearer <token>"
    const parts = authorization.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(400).json({ error: 'Invalid authorization format' });
    }

    const token = parts[1];

    try {
      // ✅ 3. Verify token
      const verifyJwt = await jwt.verify(
        token,
        process.env.JWT_SECRET_ACCESS_TOKEN as string
      );

      if (!verifyJwt || typeof verifyJwt !== 'object') {
        return res.status(401).json({ error: 'Token payload is invalid' });
      }

      if (!verifyJwt.isVerified) {
        return res.status(401).json({ error: 'Email not yet veri' });
      }

      // ✅ 4. Attach email to request (better: use req.user or req.auth)
      console.log('Token payload:', verifyJwt.email);
      req.user = {
        email: verifyJwt.email,
      };

      next();
    } catch (error) {
      // ✅ 5. Catch verification errors
      console.error('JWT verification failed:', error);
      return res.status(401).json({ error: 'Token is invalid or expired' });
    }
  }
}
