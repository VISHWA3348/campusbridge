import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getRecommendedAlumni } from '../controllers/matchingController.js';

const router = express.Router();

router.get('/', authenticate, getRecommendedAlumni);

export default router;
