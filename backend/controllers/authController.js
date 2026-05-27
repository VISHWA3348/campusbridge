import prisma from '../prisma/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import getJWTSecret from '../utils/jwtConfig.js';
import { createNotification } from '../utils/notification.js';
import { sendVerificationEmail, sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'placeholder');

export const signup = async (req, res) => {
  try {
    const { 
      role, name, email, password, collegeName, collegeCode, inviteCode,
      // Student specific
      departmentName, departmentId, rollNumber, collegeIdNumber, currentYear, totalStudents,
      skills, interestedJobRole, preferredCompanyType, expectedSalary, cgpa,
      resumeLink, portfolioLink, githubLink, preferredLocation, readyToRelocate,
      interestMode, interestedDomain, phoneNumber, linkedIn, idProofUrl,
      // Alumni specific
      passoutYear, currentCompany, jobRole, experience, previousCompanies,
      certifications, achievements, readyForReferral, readyForMentorship,
      resumeReview, availableTime, preferredContactMode, permanentAddress,
      temporaryAddress, childrenDetails, portfolio, alumniProofUrl
    } = req.body;

    if (!['STUDENT', 'ALUMNI'].includes(role)) {
      return res.status(403).json({ error: 'Only Students and Alumni can register themselves.' });
    }

    const college = await prisma.college.findFirst({
      where: { name: collegeName, collegeCode: collegeCode },
      include: { departmentsList: true }
    });

    if (!college) {
      return res.status(400).json({ error: 'Invalid College Name or College ID. Please check your details.' });
    }

    // --- New Signup Code Verification ---
    if (!inviteCode) {
      return res.status(400).json({ error: 'A valid Invite Code is required to register.' });
    }

    const sc = await prisma.signupCode.findUnique({
      where: { code: inviteCode },
      include: { college: true }
    });

    if (!sc || sc.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Invalid or Unauthorized Signup Code.' });
    }

    if (sc.expiryDate && new Date() > sc.expiryDate) {
      return res.status(400).json({ error: 'This signup code has expired.' });
    }

    if (sc.usageLimit && sc.usedCount >= sc.usageLimit) {
      return res.status(400).json({ error: 'This signup code has reached its usage limit.' });
    }

    if (sc.role !== role) {
      return res.status(400).json({ error: `This code is only for ${sc.role.toLowerCase()} registration.` });
    }

    // Force data from SignupCode to prevent spoofing
    const verifiedCollegeId = sc.collegeId;
    const verifiedDepartmentName = sc.departmentName || (role === 'STUDENT' ? departmentName : null);
    const verifiedBatch = sc.batch || (role === 'STUDENT' ? currentYear : passoutYear);

    // Ensure the college matches the one in the code
    if (verifiedCollegeId !== college.id) {
      return res.status(400).json({ error: 'Invite code does not match the selected college.' });
    }

    // If the code has a specific department name, ensure it matches or override it
    if (sc.departmentName && role === 'STUDENT' && departmentName && sc.departmentName !== departmentName) {
        return res.status(400).json({ error: `This code is only valid for the ${sc.departmentName} department.` });
    }

    // Check for duplicate Roll Number or College ID Number within the same college
    if (role === 'STUDENT') {
      const duplicateStudent = await prisma.user.findFirst({
        where: {
          collegeId: college.id,
          OR: [
            { collegeIdNumber: collegeIdNumber },
            { student: { rollNumber: rollNumber } }
          ]
        }
      });
      if (duplicateStudent) {
        return res.status(400).json({ error: 'Roll Number or College ID Number already registered in this college.' });
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store signup data in PendingUser - Override with verified data
    const finalSignupData = {
      ...req.body,
      collegeId: verifiedCollegeId,
      departmentName: verifiedDepartmentName,
      [role === 'STUDENT' ? 'currentYear' : 'passoutYear']: verifiedBatch
    };

    await prisma.pendingUser.upsert({
      where: { email },
      update: { otp, signupData: JSON.stringify(finalSignupData), expiresAt },
      create: { email, otp, signupData: JSON.stringify(finalSignupData), expiresAt }
    });

    try {
      await sendOTPEmail(email, otp);
    } catch (e) {
      console.error(`[OTP EMAIL FAILED] To: ${email} | Error:`, e);
      return res.status(500).json({ error: 'Failed to send verification code. Please try again later.' });
    }

    res.status(201).json({ 
      message: 'OTP sent to your email! Please verify to complete signup.', 
      email: email 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { email }, 
      include: { 
        college: true,
        student: true,
        alumni: true
      } 
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email first' });

    if (user.verificationStatus === 'PENDING_APPROVAL') {
      return res.status(403).json({ 
        error: 'Your account is pending admin approval. Please wait for the verification process to complete.',
        status: 'PENDING_APPROVAL' 
      });
    }

    if (user.verificationStatus === 'REJECTED') {
      return res.status(403).json({ 
        error: `Your verification was rejected. Reason: ${user.rejectionReason || 'No reason provided'}. Please re-upload your documents.`,
        status: 'REJECTED',
        rejectionReason: user.rejectionReason
      });
    }

    if (!user.password || !user.password.startsWith('$2')) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, role: user.role, collegeId: user.collegeId },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    const { 
      password: _, 
      otp, 
      otpExpiresAt, 
      verificationToken, 
      resetOtp, 
      resetOtpExpiresAt, 
      resetOtpVerified, 
      lastResetRequest, 
      resetAttempts,
      ...safeUser 
    } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, verificationToken: null }
    });

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });

    // Rate Limiting: Max 3 requests per 10 minutes
    const now = new Date();
    if (user.lastResetRequest && (now - user.lastResetRequest) < 10 * 60 * 1000) {
      if (user.resetAttempts >= 3) {
        return res.status(429).json({ error: 'Too many requests. Please try again in 10 minutes.' });
      }
    } else {
      // Reset attempts if 10 mins have passed
      await prisma.user.update({
        where: { email },
        data: { resetAttempts: 0 }
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { 
        resetOtp: otp, 
        resetOtpExpiresAt: expires,
        lastResetRequest: now,
        resetAttempts: { increment: 1 },
        resetOtpVerified: false
      }
    });

    try {
      await sendPasswordResetEmail(email, otp);
      res.json({ message: 'A verification code has been sent to your email.' });
    } catch (e) {
      console.error(`[RESET OTP FAILED] To: ${email} | Error:`, e);
      res.status(500).json({ error: 'Failed to send verification code. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp, type } = req.body; // type can be 'signup' or 'reset'
  try {
    if (type === 'signup' || !type) {
      // 1. Check PendingUser (Signup Flow)
      const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });
      if (pendingUser && pendingUser.otp === otp && new Date() <= pendingUser.expiresAt) {
        const data = JSON.parse(pendingUser.signupData);
        
        const college = await prisma.college.findFirst({
          where: { name: data.collegeName, collegeCode: data.collegeCode }
        });

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        // Fetch the signup code again to link it and increment usage
        const sc = await prisma.signupCode.findUnique({
          where: { code: data.inviteCode }
        });

        const user = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            collegeId: college.id,
            isVerified: true,
            verificationStatus: 'PENDING_APPROVAL', // New users need approval
            idProofUrl: data.idProofUrl || null,
            idProofPublicId: data.idProofPublicId || null,
            collegeIdNumber: data.collegeIdNumber || null,
            inviteCodeUsedId: sc ? sc.id : null
          }
        });

        if (sc) {
          await prisma.signupCode.update({
            where: { id: sc.id },
            data: { usedCount: { increment: 1 } }
          });
        }

        if (data.role === 'STUDENT') {
          await prisma.student.create({
            data: {
              userId: user.id,
              department: data.departmentName,
              departmentId: data.departmentId || '',
              rollNumber: data.rollNumber || '',
              currentYear: data.currentYear || '',
              totalStudents: data.totalStudents ? parseInt(data.totalStudents) : 0,
              skills: data.skills || '',
              interestedJobRole: data.interestedJobRole || '',
              preferredCompanyType: data.preferredCompanyType || '',
              expectedSalary: data.expectedSalary || '',
              cgpa: data.cgpa || '',
              resumeLink: data.resumeLink || '',
              portfolioLink: data.portfolioLink || '',
              githubLink: data.githubLink || '',
              preferredLocation: data.preferredLocation || '',
              readyToRelocate: data.readyToRelocate || 'Yes',
              interestMode: data.interestMode || 'Seminar',
              interestedDomain: data.interestedDomain || '',
              phoneNumber: data.phoneNumber || '',
              linkedIn: data.linkedIn || ''
            }
          });
        } else {
          await prisma.alumni.create({
            data: {
              userId: user.id,
              department: data.departmentName,
              passoutYear: data.passoutYear || '',
              currentCompany: data.currentCompany || '',
              jobRole: data.jobRole || '',
              experience: data.experience || '',
              previousCompanies: data.previousCompanies || '',
              certifications: data.certifications || '',
              achievements: data.achievements || '',
              readyForReferral: data.readyForReferral || 'No',
              readyForMentorship: data.readyForMentorship || 'No',
              resumeReview: data.resumeReview || 'No',
              availableTime: data.availableTime || '',
              preferredContactMode: data.preferredContactMode || 'LinkedIn',
              permanentAddress: data.permanentAddress || '',
              temporaryAddress: data.temporaryAddress || '',
              childrenDetails: data.childrenDetails || '',
              childrenCount: data.childrenCount ? parseInt(data.childrenCount, 10) : 0,
              phoneNumber: data.phoneNumber || '',
              linkedIn: data.linkedIn || '',
              portfolio: data.portfolio || '',
              alumniProofUrl: data.alumniProofUrl || null,
              alumniProofPublicId: data.alumniProofPublicId || null
            }
          });
        }

        // Notify College Admin
        const admin = await prisma.user.findFirst({
          where: { role: 'COLLEGE_ADMIN', collegeId: college.id }
        });
        if (admin) {
          await createNotification(req, {
            userId: admin.id,
            type: 'REGISTRATION',
            title: `New ${data.role} Joined`,
            message: `${data.name} has registered as a ${data.role.toLowerCase()}.`,
            priority: 'NORMAL',
            link: data.role === 'STUDENT' ? '/dashboard/college-admin/students' : '/dashboard/college-admin/alumni'
          });
        }

        // Send Welcome Email
        try {
          await sendWelcomeEmail(data.email, {
            name: data.name,
            role: data.role,
            collegeName: college.name
          });
        } catch (emailError) {
          console.error("Welcome Email Error:", emailError);
        }

        await prisma.pendingUser.delete({ where: { email } });
        return res.json({ message: 'Email verified and account created successfully!' });
      }
    }

    if (type === 'reset') {
      // 2. Check User (Password Reset Flow)
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && user.resetOtp === otp && new Date() <= user.resetOtpExpiresAt) {
        await prisma.user.update({
          where: { email },
          data: { resetOtpVerified: true }
        });
        return res.json({ message: 'Verification code verified! You can now reset your password.' });
      }
    }

    return res.status(400).json({ error: 'Invalid or expired verification code.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetOtpVerified) {
      return res.status(400).json({ error: 'Unauthorized. Please verify your identity first.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword, 
        resetOtp: null, 
        resetOtpExpiresAt: null,
        resetOtpVerified: false,
        resetAttempts: 0
      }
    });

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const getColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      where: { status: 'active' },
      select: { 
        id: true, 
        name: true, 
        collegeCode: true, 
        departments: true, // Legacy support
        departmentsList: {
          where: { status: 'active' },
          select: { name: true, code: true }
        }
      }
    });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });
    if (!pendingUser) return res.status(404).json({ error: 'No pending registration found for this email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.pendingUser.update({
      where: { email },
      data: { otp, expiresAt }
    });

    try {
      await sendOTPEmail(email, otp);
      res.json({ message: 'A new OTP has been sent to your email.' });
    } catch (e) {
      console.error(`[RESEND OTP FAILED] To: ${email} | Error:`, e);
      res.status(500).json({ error: 'Failed to send verification code. Please try again later.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'No Google credential provided' });

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID || 'placeholder'
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, sub: googleId, name, picture } = payload;

    // Find User
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        college: true,
        student: true,
        alumni: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found. Please signup first.' });
    }

    // Check account status
    if (user.verificationStatus === 'PENDING_APPROVAL') {
      return res.status(403).json({ 
        error: 'Your account is pending admin approval. Please wait for the verification process to complete.',
        status: 'PENDING_APPROVAL' 
      });
    }

    if (user.verificationStatus === 'REJECTED') {
      return res.status(403).json({ 
        error: 'Your account access has been restricted. Please contact your college admin.',
        status: 'REJECTED',
        rejectionReason: user.rejectionReason
      });
    }

    // Update user with google details
    const updateData = { lastSocialLogin: new Date() };
    if (!user.googleId) {
      updateData.googleId = googleId;
      updateData.authProvider = 'GOOGLE';
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    // Generate standard JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role, collegeId: user.collegeId },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    const { 
      password: _, 
      otp, 
      otpExpiresAt, 
      verificationToken, 
      resetOtp, 
      resetOtpExpiresAt, 
      resetOtpVerified, 
      lastResetRequest, 
      resetAttempts,
      ...safeUser 
    } = user;

    res.json({
      message: 'Google login successful',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google sign-in failed. Please try again.' });
  }
};
