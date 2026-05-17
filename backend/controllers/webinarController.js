import prisma from '../prisma/db.js';
import { addPoints } from './gamificationController.js';
import { createNotification } from '../utils/notification.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

export const createWebinar = async (req, res) => {
  const { 
    title, 
    description, 
    speakerName, 
    companyName, 
    date, 
    duration, 
    type, 
    location, 
    posterImage, 
    posterPublicId,
    domain 
  } = req.body;

  try {
    const userId = req.user.userId;
    const collegeId = req.user.collegeId;

    const alumni = await prisma.alumni.findUnique({ where: { userId } });
    if (!alumni) return res.status(403).json({ error: 'Only alumni can host webinars' });

    const webinar = await prisma.webinar.create({
      data: {
        title,
        description,
        speakerName,
        companyName,
        date: new Date(date),
        duration,
        type: type || 'ONLINE',
        location,
        posterImage,
        posterPublicId,
        domain,
        alumniId: alumni.id,
        collegeId
      }
    });

    // Notify same college students
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', collegeId }
    });
    
    await Promise.all(students.map(s => 
      createNotification(req, {
        userId: s.id,
        type: 'WEBINAR',
        title: 'New Webinar Scheduled',
        message: `${title} by ${speakerName} (${companyName}) has been scheduled.`,
        priority: 'IMPORTANT',
        link: '/dashboard/student/webinars'
      })
    ));

    res.status(201).json(webinar);

    // Gamification
    await addPoints(userId, 'WEBINAR_HOSTED');
  } catch (error) {
    console.error('Create webinar error:', error);
    res.status(500).json({ error: 'Failed to create webinar' });
  }
};

export const updateWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const alumni = await prisma.alumni.findUnique({ where: { userId } });
    
    const webinar = await prisma.webinar.findUnique({ where: { id: parseInt(id) } });
    if (!webinar) return res.status(404).json({ error: 'Webinar not found' });
    if (webinar.alumniId !== alumni.id) return res.status(403).json({ error: 'Unauthorized' });

    if (req.body.posterPublicId && webinar.posterPublicId && req.body.posterPublicId !== webinar.posterPublicId) {
      await deleteFromCloudinary(webinar.posterPublicId);
    }

    const updated = await prisma.webinar.update({
      where: { id: parseInt(id) },
      data: {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : webinar.date
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update webinar' });
  }
};

export const deleteWebinar = async (req, res) => {
  try {
    const { id } = req.params;
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    const webinar = await prisma.webinar.findUnique({ where: { id: parseInt(id) } });
    
    if (!webinar) return res.status(404).json({ error: 'Webinar not found' });
    if (webinar.alumniId !== alumni.id) return res.status(403).json({ error: 'Unauthorized' });

    if (webinar.posterPublicId) {
      await deleteFromCloudinary(webinar.posterPublicId);
    }

    await prisma.webinar.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete webinar' });
  }
};

export const registerForWebinar = async (req, res) => {
  const webinarId = parseInt(req.params.id);
  try {
    const student = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (!student) return res.status(403).json({ error: 'Only students can register' });

    // Check if already registered
    const existing = await prisma.registration.findFirst({
      where: { studentId: student.id, webinarId }
    });
    if (existing) return res.status(400).json({ error: 'Already registered' });

    const registration = await prisma.registration.create({
      data: {
        studentId: student.id,
        webinarId
      }
    });

    // Notify Alumni about registration
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId },
      include: { alumni: true }
    });
    
    if (webinar) {
      await createNotification(req, {
        userId: webinar.alumni.userId,
        type: 'WEBINAR',
        title: 'New Webinar Registration',
        message: `${req.user.name} registered for your webinar: ${webinar.title}`,
        priority: 'NORMAL',
        link: '/dashboard/alumni/webinars'
      });
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const getWebinars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { q, type } = req.query; // type: upcoming, past, or all

    const now = new Date();
    let dateFilter = {};
    if (type === 'upcoming') {
      dateFilter = { date: { gte: now } };
    } else if (type === 'past') {
      dateFilter = { date: { lt: now } };
    }

    const where = {
      collegeId: req.user.collegeId,
      ...dateFilter,
      AND: q ? [
        {
          OR: [
            { title: { contains: String(q) } },
            { speakerName: { contains: String(q) } },
            { domain: { contains: String(q) } }
          ]
        }
      ] : undefined
    };

    const [webinars, total] = await Promise.all([
      prisma.webinar.findMany({
        where,
        include: {
          alumni: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  profilePhoto: true
                }
              }
            }
          },
          _count: {
            select: { registrations: true }
          }
        },
        orderBy: { date: type === 'upcoming' ? 'asc' : 'desc' },
        skip,
        take: limit,
      }),
      prisma.webinar.count({ where })
    ]);

    res.json({
      webinars,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get webinars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAlumniWebinars = async (req, res) => {
  try {
    const alumni = await prisma.alumni.findUnique({ where: { userId: req.user.userId } });
    if (!alumni) return res.json([]);

    const webinars = await prisma.webinar.findMany({
      where: { alumniId: alumni.id },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } }
        }
      },
      orderBy: { date: 'desc' }
    });
    res.json(webinars);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch your webinars' });
  }
};

export const uploadWebinarPoster = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
      fileUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: 'Poster upload failed' });
  }
};
