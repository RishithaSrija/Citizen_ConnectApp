import { Router } from 'express';
import authRoutes from './auth.routes';
import complaintsRoutes from './complaints.routes';
import usersRoutes from './users.routes';
import notificationsRoutes from './notifications.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintsRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/ai', aiRoutes);

export default router;
