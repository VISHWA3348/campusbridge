import jwt from 'jsonwebtoken';
import prisma from '../prisma/db.js';
import getJWTSecret from '../utils/jwtConfig.js';

// Use the same JWT_SECRET resolution logic as authController
// Priority: process.env.JWT_SECRET (set at runtime after dotenv.config()) > fallback
const getSecret = () => getJWTSecret();

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized - Empty token' });

  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret);
    
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
    console.error('JWT Verification Failed:', err.message, '| Secret length:', getSecret().length);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired - please login again', code: 'TOKEN_EXPIRED' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token', details: err.message, code: 'INVALID_TOKEN' });
    }
    res.status(401).json({ error: 'Authentication failed', details: err.message });
  }
};

export const authorizeRole = (allowedRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.user.role !== allowedRole) {
      return res.status(403).json({ error: 'Forbidden: Access denied' });
    }
    next();
  };
};

export const authenticateUser = authenticate;
