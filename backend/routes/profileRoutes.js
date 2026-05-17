import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadProfile, uploadResume } from '../utils/upload.js';
import { 
  getMyProfile, 
  getProfileById, 
  updateProfile, 
  uploadPhoto, 
  removePhoto,
  uploadResumeFile
} from '../controllers/profileController.js';

const router = express.Router();

router.get('/me', authenticate, getMyProfile);
router.get('/:id', authenticate, getProfileById);
router.put('/me', authenticate, updateProfile);
router.post('/photo', authenticate, uploadProfile.single('photo'), uploadPhoto);
router.delete('/photo', authenticate, removePhoto);
router.post('/resume', authenticate, uploadResume.single('resume'), uploadResumeFile);
router.post('/re-verify', authenticate, (req, res, next) => {
    // We'll use a dynamic import or just call a new function in profileController
    next();
}, (req, res) => {
    import('../controllers/profileController.js').then(ctrl => ctrl.reVerify(req, res));
});

export default router;
