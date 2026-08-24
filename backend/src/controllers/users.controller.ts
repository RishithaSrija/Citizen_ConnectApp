import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from '../services/cloudinary.service';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.').optional(),
  email: z.string().email('Invalid email.').optional(),
  phone: z.string().min(6, 'Invalid phone number.').optional(),
  profileImage: z.string().optional(), // base64 representation
  password: z.string().min(6, 'Password must be at least 6 characters.').optional(),
});

export class UsersController {
  static async getProfile(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          profileImage: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      return res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Server error while loading user profile.' });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const validated = updateProfileSchema.parse(req.body);

      const updateData: any = {};

      if (validated.fullName) {
        updateData.fullName = validated.fullName;
      }
      
      if (validated.email) {
        const lowerEmail = validated.email.toLowerCase();
        if (lowerEmail !== authUser.email) {
          const emailCheck = await prisma.user.findUnique({
            where: { email: lowerEmail },
          });
          if (emailCheck) {
            return res.status(400).json({ error: 'Email address is already in use.' });
          }
          updateData.email = lowerEmail;
        }
      }

      if (validated.phone) {
        updateData.phone = validated.phone;
      }

      if (validated.password) {
        updateData.password = await bcrypt.hash(validated.password, 10);
      }

      // Handle avatar image upload to Cloudinary
      if (validated.profileImage) {
        if (validated.profileImage.startsWith('data:image')) {
          const url = await CloudinaryService.uploadImage(validated.profileImage, 'avatars');
          updateData.profileImage = url;
        } else {
          updateData.profileImage = validated.profileImage;
        }
      }

      const updated = await prisma.user.update({
        where: { id: authUser.id },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          profileImage: true,
          createdAt: true,
        },
      });

      // Update cookie user session details for frontend sync
      res.cookie('user_session', JSON.stringify({
        id: updated.id,
        name: updated.fullName,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'lax',
        path: '/',
      });

      return res.json({
        message: 'Profile updated successfully.',
        user: updated,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Server error while updating profile.' });
    }
  }
}
