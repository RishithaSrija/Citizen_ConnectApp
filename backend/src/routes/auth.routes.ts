import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticateJWT, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Compatibility route for Next.js frontend me check
router.get('/me', authenticateJWT, (req, res) => {
  return res.json({ user: (req as any).user });
});

export default router;
