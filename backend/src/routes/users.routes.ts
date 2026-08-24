import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticateJWT, UsersController.getProfile);
router.put('/profile', authenticateJWT, UsersController.updateProfile);

export default router;
