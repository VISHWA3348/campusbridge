import prisma from '../prisma/db.js';

const mapName = (name) => {
  const n = name.toLowerCase();
  if (n === 'chat' || n === 'chat system' || n === 'real-time chat') return 'Chat System';
  if (n === 'webinar' || n === 'webinar module' || n === 'webinar portal' || n === 'webinars') return 'Webinar Module';
  if (n === 'referrals' || n === 'referral system') return 'Referral System';
  if (n === 'jobs' || n === 'job portal' || n === 'job postings') return 'Job Portal';
  return name;
};

export const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const normalizedName = mapName(featureName);
      const toggle = await prisma.featureToggle.findUnique({
        where: { featureName: normalizedName }
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
