import prisma from '../prisma/db.js';

export const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const toggle = await prisma.featureToggle.findUnique({
        where: { featureName }
      });

      if (toggle && !toggle.enabled) {
        return res.status(403).json({ 
          error: `The feature '${featureName}' is currently disabled by the administrator.` 
        });
      }
      next();
    } catch (error) {
      next(); // Fail open if DB check fails
    }
  };
};
