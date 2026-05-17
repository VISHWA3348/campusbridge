import prisma from '../prisma/db.js';
import { addPoints } from './gamificationController.js';
import fs from 'fs';
import path from 'path';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        college: true,
        student: true,
        alumni: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Sanitize
    const { password, otp, otpExpiresAt, verificationToken, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Get my profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        college: true,
        student: true,
        alumni: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Access control: College Admin should only view users from their own college
    if (req.user.role === 'COLLEGE_ADMIN' && user.collegeId !== req.user.collegeId) {
      return res.status(403).json({ error: 'Access denied. You can only view profiles from your own institution.' });
    }

    // Sanitize user object (remove sensitive info)
    const { password, otp, otpExpiresAt, verificationToken, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Get profile by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, ...roleData } = req.body;
    
    // Find current user with role data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { student: true, alumni: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1. Update common User fields
    // Only update fields that exist in User model
    const userData = {};
    if (name !== undefined) userData.name = name;
    if (bio !== undefined) userData.bio = bio;

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id: req.user.userId },
        data: userData
      });
    }

    // 2. Update role-specific fields
    // List of allowed fields for each model to prevent Prisma errors
    const studentAllowedFields = [
      'department', 'rollNumber', 'currentYear', 'totalStudents', 'fullDetails', 
      'skills', 'interestedJobRole', 'preferredCompanyType', 'expectedSalary', 
      'cgpa', 'resumeLink', 'portfolioLink', 'githubLink', 'preferredLocation', 
      'readyToRelocate', 'interestMode', 'interestedDomain', 'phoneNumber', 'linkedIn',
      'certifications', 'careerInterests'
    ];

    const alumniAllowedFields = [
      'department', 'passoutYear', 'company', 'currentCompany', 'companyAddress', 
      'experience', 'maritalStatus', 'role', 'jobRole', 'previousCompanies', 
      'skills', 'certifications', 'achievements', 'readyForReferral', 
      'readyForMentorship', 'resumeReview', 'availableTime', 'preferredContactMode', 
      'permanentAddress', 'temporaryAddress', 'childrenDetails', 'phoneNumber', 
      'linkedIn', 'portfolio', 'currentLocation'
    ];

    let cleanRoleData = {};
    let targetModel = null;
    let allowedFields = [];

    if (user.role === 'STUDENT' && user.student) {
      targetModel = prisma.student;
      allowedFields = studentAllowedFields;
    } else if (user.role === 'ALUMNI' && user.alumni) {
      targetModel = prisma.alumni;
      allowedFields = alumniAllowedFields;
    }

    if (targetModel) {
      // Filter incoming data to only include allowed fields
      Object.keys(roleData).forEach(key => {
        if (allowedFields.includes(key) && roleData[key] !== undefined) {
          // Type conversions
          if (key === 'totalStudents') {
            cleanRoleData[key] = parseInt(roleData[key]) || 0;
          } else {
            cleanRoleData[key] = roleData[key];
          }
        }
      });

      if (Object.keys(cleanRoleData).length > 0) {
        await targetModel.update({
          where: { userId: user.id },
          data: cleanRoleData
        });
      }
    }

    res.json({ message: 'Profile updated successfully' });

    // Gamification - try/catch to ensure profile update doesn't fail if points fail
    try {
      await addPoints(req.user.userId, 'PROFILE_COMPLETED');
    } catch (e) {
      console.error('Gamification error:', e);
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    // Delete old photo from Cloudinary if exists
    if (user.profilePhotoPublicId) {
      await deleteFromCloudinary(user.profilePhotoPublicId);
    } else if (user.profilePhoto && user.profilePhoto.startsWith('uploads/')) {
      // Cleanup legacy local files if any
      const oldPath = path.join(process.cwd(), user.profilePhoto);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { console.error('Failed to delete old local photo', e); }
      }
    }

    const photoUrl = req.file.path;
    const publicId = req.file.filename; // multer-storage-cloudinary uses filename for public_id

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { 
        profilePhoto: photoUrl,
        profilePhotoPublicId: publicId
      }
    });

    res.json({ message: 'Photo uploaded successfully', photo: photoUrl });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removePhoto = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    
    if (user.profilePhotoPublicId) {
      await deleteFromCloudinary(user.profilePhotoPublicId);
    } else if (user.profilePhoto && user.profilePhoto.startsWith('uploads/')) {
      const oldPath = path.join(process.cwd(), user.profilePhoto);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) { console.error('Failed to delete photo', e); }
      }
    }

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { 
        profilePhoto: null,
        profilePhotoPublicId: null
      }
    });

    res.json({ message: 'Photo removed successfully' });
  } catch (error) {
    console.error('Remove photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadResumeFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    // Delete old resume from Cloudinary if exists
    if (student.resumePublicId) {
      await deleteFromCloudinary(student.resumePublicId);
    }

    const resumeUrl = req.file.path;
    const publicId = req.file.filename;

    await prisma.student.update({
      where: { userId: req.user.userId },
      data: { 
        resumeLink: resumeUrl,
        resumePublicId: publicId
      }
    });

    res.json({ message: 'Resume uploaded successfully', resumeLink: resumeUrl });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const reVerify = async (req, res) => {
  try {
    const { idProofUrl, idProofPublicId } = req.body;
    if (!idProofUrl) return res.status(400).json({ error: 'ID proof URL is required' });

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1. Delete old proof from Cloudinary if exists
    if (user.idProofPublicId) {
      await deleteFromCloudinary(user.idProofPublicId);
    }

    // 2. Update status and proof fields
    await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        idProofUrl,
        idProofPublicId,
        verificationStatus: 'PENDING_APPROVAL',
        rejectionReason: null // Clear reason on resubmit
      }
    });

    res.json({ message: 'Identity proof resubmitted for verification' });
  } catch (error) {
    console.error('Re-verify error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
