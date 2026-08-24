import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, NotificationsController.list);
router.put('/', authenticateJWT, NotificationsController.updateRead);
router.patch('/:id', authenticateJWT, NotificationsController.patchRead);

export default router;
