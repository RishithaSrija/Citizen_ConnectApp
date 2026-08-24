import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-jwt-access-tokens-12345!';

const prisma = new PrismaClient();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  phone: z.string().min(6, 'Invalid phone number.'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string(),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validated = registerSchema.parse(req.body);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email address is already in use.' });
      }

      const hashedPassword = await bcrypt.hash(validated.password, 10);

      const user = await prisma.user.create({
        data: {
          fullName: validated.name,
          email: validated.email.toLowerCase(),
          password: hashedPassword,
          phone: validated.phone,
          role: 'citizen',
        },
      });

      const { accessToken, refreshToken } = generateTokens(user.id, user.role);

      // Save refresh token to user
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Set cookie for browser session fallback
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 mins
        sameSite: 'lax',
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
      });

      // Also set the old frontend's 'user_session' cookie directly so that the layout check continues working seamlessly
      const safeUser = {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      };
      res.cookie('user_session', JSON.stringify(safeUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        path: '/',
      });

      return res.status(201).json({
        message: 'Registration successful.',
        user: safeUser,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Register error:', error);
      return res.status(500).json({ error: 'Server error during registration.' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validated = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: validated.email.toLowerCase() },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isPasswordValid = await bcrypt.compare(validated.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const { accessToken, refreshToken } = generateTokens(user.id, user.role);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      });

      // Set auth cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      const safeUser = {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      };

      res.cookie('user_session', JSON.stringify(safeUser), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        path: '/',
      });

      return res.json({
        message: 'Login successful.',
        user: safeUser,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Server error during login.' });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      res.clearCookie('user_session', { path: '/' });

      return res.json({ message: 'Logout successful.' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Server error during logout.' });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies.refresh_token || req.body.refreshToken;

      if (!token) {
        return res.status(401).json({ error: 'Refresh token is required.' });
      }

      const payload = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.refreshToken !== token) {
        return res.status(401).json({ error: 'Invalid or revoked refresh token.' });
      }

      const tokens = generateTokens(user.id, user.role);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
        sameSite: 'lax',
      });

      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return 200 for security reasons to prevent email enumerations
      return res.json({ message: 'If an account exists with this email, a reset password link has been sent.' });
    }

    // Generate a temporary mock reset token
    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      message: 'If an account exists with this email, a reset password link has been sent.',
      resetToken, // Return for simulation/integration testing convenience
    });
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });

      return res.json({ message: 'Password has been reset successfully.' });
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }
  }
}
