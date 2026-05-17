import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { analyzeResume, getResumeHistory, generateResumeData } from '../controllers/resumeController.js';

const router = express.Router();

router.use(authenticate);

router.post('/analyze', analyzeResume);
router.get('/history', getResumeHistory);
router.get('/data', generateResumeData);

export default router;
