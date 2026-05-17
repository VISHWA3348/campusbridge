import express from 'express';
import { 
  createWebinar, 
  updateWebinar, 
  deleteWebinar, 
  registerForWebinar, 
  getWebinars, 
  getAlumniWebinars,
  uploadWebinarPoster
} from '../controllers/webinarController.js';
import { uploadWebinar } from '../utils/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getWebinars);
router.get('/alumni', authenticate, getAlumniWebinars);
router.post('/', authenticate, createWebinar);
router.put('/:id', authenticate, updateWebinar);
router.delete('/:id', authenticate, deleteWebinar);
router.post('/:id/register', authenticate, registerForWebinar);
router.post('/upload', authenticate, uploadWebinar.single('poster'), uploadWebinarPoster);

export default router;
