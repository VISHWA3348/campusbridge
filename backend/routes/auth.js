const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { sendVerificationEmail } = require('../services/emailService');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// --- Signup with Email Verification ---
router.post('/signup', async (req, res) => {
  const { name, email, password, role, collegeName, collegeCode, department } = req.body;

  try {
    // 1. Role Restriction: Only Student and Alumni can signup
    if (!['STUDENT', 'ALUMNI'].includes(role)) {
      return res.status(403).json({ error: 'Only Students and Alumni can register themselves.' });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // 3. Validate College and Department
    const college = await prisma.college.findFirst({
      where: {
        name: collegeName,
        collegeCode: collegeCode
      }
    });

    if (!college) {
      return res.status(400).json({ error: 'Invalid College Name or College ID. Please check your details.' });
    }

    // Check if department is valid for this college
    const validDepartments = college.departments ? college.departments.split(',').map(d => d.trim()) : [];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ error: `Invalid Department. This college only allows: ${validDepartments.join(', ')}` });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User (isVerified = false)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        collegeId: college.id,
        isVerified: false
      }
    });

    // 6. Generate Verification Token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: { email, token, expiresAt }
    });

    // 7. Send Email
    try {
      await sendVerificationEmail(email, token);
    } catch (emailError) {
      console.error('Email failed to send:', emailError);
    }

    // Create role-specific profiles with department
    if (role === 'STUDENT') {
      await prisma.student.create({ 
        data: { 
          userId: user.id,
          department: department
        } 
      });
    }
    if (role === 'ALUMNI') {
      await prisma.alumni.create({ 
        data: { 
          userId: user.id, 
          department: department,
          company: '', 
          role: '' 
        } 
      });
    }

    res.status(201).json({ 
      message: 'Signup successful! Verification email sent. Please check your inbox.', 
      user: { email: user.email } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// --- Verify Email API ---
router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    // 1. Find Token
    const vToken = await prisma.verificationToken.findUnique({ where: { token } });

    if (!vToken) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    // 2. Check Expiry
    if (new Date() > vToken.expiresAt) {
      await prisma.verificationToken.delete({ where: { token } });
      return res.status(400).json({ error: 'Token has expired.' });
    }

    // 3. Verify User
    await prisma.user.update({
      where: { email: vToken.email },
      data: { isVerified: true }
    });

    // 4. Delete Token
    await prisma.verificationToken.delete({ where: { token } });

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// --- Login with Verification Check ---
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    // Check Verification
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, collegeId: user.collegeId }, 
      JWT_SECRET
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, collegeId: user.collegeId } });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
