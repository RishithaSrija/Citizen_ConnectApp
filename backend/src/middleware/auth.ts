import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt-access-tokens-12345!';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-key-for-jwt-refresh-tokens-98765!';

export interface TokenPayload {
  userId: string;
  role: string;
}

export const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
};

/**
 * Express Middleware to authenticate incoming requests via JWT
 * Supports Authorization Header (Bearer <token>) and Cookie validation (access_token)
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = '';

    // 1. Check Auth Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } 
    // 2. Check cookies fallback
    else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }
    // 3. Next.js mock session cookie compatibility check
    else if (req.cookies && req.cookies.user_session) {
      // In case frontend still sends the raw json session cookie from frontend layout
      try {
        const sessionData = JSON.parse(req.cookies.user_session);
        if (sessionData && sessionData.id) {
          const user = await prisma.user.findUnique({
            where: { id: sessionData.id },
            select: { id: true, email: true, fullName: true, role: true, phone: true }
          });
          if (user) {
            (req as any).user = user;
            return next();
          }
        }
      } catch (err) {
        // Continue to unauthorized check
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication token is required.' });
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, fullName: true, role: true, phone: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User does not exist or has been deleted.' });
    }

    // Attach user metadata to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('JWT Verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

/**
 * Middleware Role Guard to restrict actions by role
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};
