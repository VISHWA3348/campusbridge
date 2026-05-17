import prisma from '../prisma/db.js';

export const getRecommendedAlumni = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.userId },
      include: { user: true }
    });

    if (!student) return res.status(403).json({ error: 'Not a student' });

    // Recommendation logic: 
    // 1. Same department
    // 2. Same interested domain
    // 3. Alumni at companies student is interested in
    const alumni = await prisma.alumni.findMany({
      where: {
        user: { collegeId: req.user.collegeId },
        OR: [
          { department: student.department },
          { skills: { contains: student.interestedDomain || '' } },
          { currentCompany: { contains: student.preferredCompanyType || '' } }
        ]
      },
      include: { user: { select: { name: true, email: true } } },
      take: 5
    });

    res.json(alumni);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
};
