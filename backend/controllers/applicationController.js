import prisma from '../prisma/db.js';

export const applyForJob = async (req, res) => {
  const { jobId } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(403).json({ error: 'Only students can apply' });

    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobId: parseInt(jobId),
        status: 'applied'
      }
    });

    // Notify alumni
    const job = await prisma.job.findUnique({ 
      where: { id: parseInt(jobId) },
      include: { alumni: { include: { user: true } } }
    });
    
    await prisma.notification.create({
      data: {
        userId: job.alumni.user.id,
        type: 'APPLICATION',
        message: `New application for your job: ${job.title}`
      }
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Application failed' });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const appId = parseInt(req.params.id);
  try {
    const application = await prisma.application.update({
      where: { id: appId },
      data: { status },
      include: { student: { include: { user: true } }, job: true }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: application.student.user.id,
        type: 'STATUS',
        message: `Your application for ${application.job.title} is now: ${status}`
      }
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const getStudentApplications = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    const apps = await prisma.application.findMany({
      where: { studentId: student.id },
      include: { job: true }
    });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};
