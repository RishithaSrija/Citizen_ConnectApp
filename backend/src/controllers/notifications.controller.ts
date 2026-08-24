import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationsController {
  static async list(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const list = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });

      // Map DB field `read` to frontend field `readStatus`
      const formatted = list.map(n => ({
        id: n.id,
        userId: n.userId,
        message: n.message,
        readStatus: n.read,
        createdAt: n.createdAt,
      }));

      return res.json({ notifications: formatted });
    } catch (error) {
      console.error('List notifications error:', error);
      return res.status(500).json({ error: 'Server error while loading notifications.' });
    }
  }

  // PUT /api/notifications (body check for id or all)
  static async updateRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id, all } = req.body;

      if (all) {
        await prisma.notification.updateMany({
          where: { userId: user.id },
          data: { read: true },
        });
        return res.json({ success: true, message: 'All notifications marked as read.' });
      }

      if (!id) {
        return res.status(400).json({ error: 'Notification ID is required.' });
      }

      const notif = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notif || notif.userId !== user.id) {
        return res.status(404).json({ error: 'Notification not found.' });
      }

      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
      console.error('Update notifications read error:', error);
      return res.status(500).json({ error: 'Server error while marking notification as read.' });
    }
  }

  // PATCH /api/notifications/:id
  static async patchRead(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;

      const notif = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notif || notif.userId !== user.id) {
        return res.status(404).json({ error: 'Notification not found.' });
      }

      await prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      return res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
      console.error('Patch notification read error:', error);
      return res.status(500).json({ error: 'Server error.' });
    }
  }
}
