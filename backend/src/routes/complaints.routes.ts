import { Router } from 'express';
import { ComplaintsController } from '../controllers/complaints.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, ComplaintsController.create);
router.get('/', authenticateJWT, ComplaintsController.list);
router.get('/:id', authenticateJWT, ComplaintsController.getById);
router.patch('/:id', authenticateJWT, ComplaintsController.update);
router.put('/:id', authenticateJWT, ComplaintsController.update); // Compatibility PUT route for frontend updates
router.delete('/:id', authenticateJWT, ComplaintsController.delete);

export default router;
