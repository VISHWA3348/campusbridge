import prisma from '../prisma/db.js';
import { addPoints } from './gamificationController.js';
import { createNotification } from '../utils/notification.js';

export const createJob = async (req, res) => {
  try {
    const { 
      title, 
      company, 
      description, 
      skills, 
      salary, 
      location, 
      workType, 
      applicationLink, 
      lastDate 
    } = req.body;
    
    const userId = req.user.userId;
    const collegeId = req.user.collegeId;

    if (!title || !company) {
      return res.status(400).json({ error: 'Title and company are required' });
    }

    const alumni = await prisma.alumni.findUnique({ where: { userId } });
    if (!alumni) return res.status(403).json({ error: 'Only alumni can post jobs' });

    const job = await prisma.job.create({
      data: {
        title,
        company,
        description,
        skills,
        salary,
        location,
        workType,
        applicationLink,
        lastDate: lastDate ? new Date(lastDate) : null,
        alumniId: alumni.id,
        collegeId
      }
    });

    // Notify all students in the same college
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', collegeId }
    });

    await Promise.all(students.map(student => 
      createNotification(req, {
        userId: student.id,
        type: 'JOB',
        title: 'New Job Opportunity',
        message: `${title} at ${company} has been posted exclusively for your college!`,
        priority: 'IMPORTANT',
        link: '/dashboard/student/jobs'
      })
    ));

    // Award Points to Alumni
    await prisma.gamification.upsert({
      where: { userId },
      update: { points: { increment: 10 } },
      create: { userId, points: 10 }
    });

    res.status(201).json(job);

    // Gamification
    await addPoints(userId, 'JOB_POSTED');
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { q, workType } = req.query;

    const where = {
      collegeId: req.user.collegeId,
      AND: [
        q ? {
          OR: [
            { title: { contains: String(q) } },
            { company: { contains: String(q) } },
            { skills: { contains: String(q) } }
          ]
        } : {},
        workType && workType !== 'All' ? { workType } : {}
      ]
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          alumni: { 
            select: { 
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePhoto: true
                }
              }
            } 
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    
    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.alumniId !== alumni.id) return res.status(403).json({ error: 'Unauthorized' });

    const updatedJob = await prisma.job.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        lastDate: req.body.lastDate ? new Date(req.body.lastDate) : job.lastDate
      }
    });
    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAlumniJobs = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    if (!alumni) return res.json([]);

    const jobs = await prisma.job.findMany({
      where: { alumniId: alumni.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (error) {
    console.error('Get alumni jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    
    const job = await prisma.job.findUnique({ where: { id: parseInt(id) } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.alumniId !== alumni.id) return res.status(403).json({ error: 'Unauthorized' });

    await prisma.job.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
