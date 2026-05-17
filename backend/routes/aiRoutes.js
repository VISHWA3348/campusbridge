import express from 'express';
import { getDashboardInsights, chatAssistant } from '../controllers/aiController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

router.get('/insights', authenticateUser, getDashboardInsights);
router.post('/chat', authenticateUser, chatAssistant);

export default router;
