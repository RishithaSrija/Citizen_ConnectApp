import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/analyze', authenticateJWT, AIController.analyze);
router.post('/summarize', authenticateJWT, AIController.analyze); // Next.js frontend calls /summarize
router.post('/chat', authenticateJWT, AIController.chat);
router.post('/image-analyze', authenticateJWT, AIController.imageAnalyze);

export default router;
