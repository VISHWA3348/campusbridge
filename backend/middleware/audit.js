import prisma from '../prisma/db.js';

export const logActivity = (action) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            action: `${req.method} ${req.originalUrl}: ${action}`,
            userId: req.user.userId
          }
        });
      }
      next();
    } catch (error) {
      next();
    }
  };
};
