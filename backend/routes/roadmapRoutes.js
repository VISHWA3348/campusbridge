import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getRoadmaps, createRoadmap, updateRoadmapStep } from '../controllers/roadmapController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getRoadmaps);
router.post('/', createRoadmap);
router.post('/step', updateRoadmapStep);

export default router;
