import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  requestMentorship, 
  getAlumniMentorshipRequests, 
  getStudentMentorshipRequests,
  updateMentorshipStatus,
  submitMentorshipFeedback,
  getMentorshipAnalytics,
  updateAlumniExpertise,
  getAlumniSlots,
  getOwnSlots,
  addAlumniSlot,
  deleteAlumniSlot
} from '../controllers/mentorshipController.js';

const router = express.Router();

router.use(authenticate);

router.post('/request', requestMentorship);
router.get('/requests', getAlumniMentorshipRequests);
router.get('/my-requests', getStudentMentorshipRequests);
router.patch('/requests/:id', updateMentorshipStatus);
router.post('/feedback/:id', submitMentorshipFeedback);
router.get('/analytics', getMentorshipAnalytics);
router.patch('/expertise', updateAlumniExpertise);
router.get('/slots/:alumniId', getAlumniSlots);
router.get('/my-slots', getOwnSlots);
router.post('/slots', addAlumniSlot);
router.delete('/slots/:id', deleteAlumniSlot);

export default router;
