import express from 'express';
import { createJob, getJobs, getAlumniJobs, deleteJob, updateJob } from '../controllers/jobController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getJobs);
router.post('/', authenticate, createJob);
router.get('/alumni', authenticate, getAlumniJobs);
router.put('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);

export default router;
