import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const createStorage = (folder) => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: `campusbridge/${folder}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'docx'],
    resource_type: 'auto',
  },
});

// Profile Photos (Max 5MB)
export const uploadProfile = multer({
  storage: createStorage('profiles'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, PNG, and WebP formats are allowed for profile photos'), false);
    }
    cb(null, true);
  }
});

// Resumes (Max 10MB, PDF only)
export const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOCX, and TXT files are allowed for resumes'), false);
    }
    cb(null, true);
  }
});

// Verification Proofs (Max 10MB, Image or PDF)
export const uploadVerification = multer({
  storage: createStorage('idcards'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      return cb(new Error('Only images and PDFs are allowed for verification'), false);
    }
    cb(null, true);
  }
});

// Webinar Thumbnails (Max 10MB, Images)
export const uploadWebinar = multer({
  storage: createStorage('webinars'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed for webinar posters'), false);
    }
    cb(null, true);
  }
});

// Chat Files (Max 10MB)
export const uploadChat = multer({
  storage: createStorage('chat'),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// College Branding (Max 10MB)
export const uploadCollege = multer({
  storage: createStorage('college'),
  limits: { fileSize: 10 * 1024 * 1024 }
});
