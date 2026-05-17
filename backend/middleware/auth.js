import jwt from 'jsonwebtoken';

import prisma from '../prisma/db.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Fetch user from DB to verify current status (Strict Verification)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    if (user.role !== 'SUPER_ADMIN' && user.role !== 'COLLEGE_ADMIN' && user.verificationStatus !== 'APPROVED') {
      return res.status(403).json({ 
        error: 'Your account is not verified or has been suspended.',
        verificationStatus: user.verificationStatus 
      });
    }

    req.user = { ...decoded, collegeId: user.collegeId, role: user.role };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateUser = authenticate;
