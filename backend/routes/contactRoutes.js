import express from 'express';
import { submitContactForm, getContactMessages } from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContactForm);
router.get('/', authenticate, getContactMessages); // Only admins should see this, but for now authenticated users

export default router;
