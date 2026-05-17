import express from 'express';
import { 
  signup, 
  login, 
  verifyEmail, 
  forgotPassword, 
  verifyOTP, 
  resendOTP,
  resetPassword,
  getColleges,
  googleLogin
} from '../controllers/authController.js';
import { validateInviteCode } from '../controllers/signupCodeController.js';

const router = express.Router();

router.get('/colleges', getColleges);
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/reset-password', resetPassword);
router.get('/validate-invite-code', validateInviteCode);

export default router;
