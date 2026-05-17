import express from 'express';
import { createReferral, getReferrals, updateReferralStatus } from '../controllers/referralController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createReferral);
router.get('/', authenticate, getReferrals);
router.patch('/:id', authenticate, updateReferralStatus);

export default router;
