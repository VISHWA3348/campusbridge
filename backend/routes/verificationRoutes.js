import express from 'express';
import { uploadVerification } from '../utils/upload.js';

const router = express.Router();

router.post('/upload-proof', uploadVerification.single('proof'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Cloudinary storage provides 'path' as the URL and 'filename' as the public ID
  res.json({ 
    fileUrl: req.file.path,
    publicId: req.file.filename
  });
});

export default router;
