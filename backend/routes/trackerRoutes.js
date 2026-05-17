import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getPlacementReadiness, reanalyzeReadiness } from '../controllers/trackerController.js';

const router = express.Router();

router.use(authenticate);

router.get('/readiness', getPlacementReadiness);
router.post('/analyze', reanalyzeReadiness);

export default router;
