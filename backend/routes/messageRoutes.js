import express from 'express';
import { 
  sendMessage, 
  getMessages, 
  getConversations, 
  uploadChatFile
} from '../controllers/messageController.js';
import { uploadChat } from '../utils/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/:otherUserId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);
router.post('/upload', authenticate, uploadChat.single('file'), uploadChatFile);

export default router;
