import express from 'express';
import { applyForJob, updateApplicationStatus, getStudentApplications } from '../controllers/applicationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authenticate, getStudentApplications);
router.post('/apply', authenticate, applyForJob);
router.patch('/:id/status', authenticate, updateApplicationStatus);

export default router;
