import prisma from '../prisma/db.js';
import bcrypt from 'bcryptjs';
import { deleteFromCloudinary } from '../utils/cloudinary.js';
import { generateInviteCodeString } from '../utils/inviteCode.js';

export const getColleges = async (req, res) => {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    res.json(colleges);
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
};

export const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await prisma.college.findUnique({
      where: { id: parseInt(id) },
      include: {
        users: {
          where: { role: 'COLLEGE_ADMIN' },
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    if (!college) return res.status(404).json({ error: 'College not found' });

    // Mock placement stats for now as requested in UI
    const stats = {
      placementsCount: 0,
      studentsCount: await prisma.student.count({ where: { user: { collegeId: college.id } } }),
      alumniCount: await prisma.alumni.count({ where: { user: { collegeId: college.id } } }),
    };

    res.json({ ...college, stats });
  } catch (error) {
    console.error('Get college by id error:', error);
    res.status(500).json({ error: 'Failed to fetch college details' });
  }
};

export const createCollege = async (req, res) => {
  try {
    const {
      name, collegeCode, institutionType, universityName, isAutonomous, establishmentYear,
      country, state, city, address, pincode,
      officialEmail, officialPhone, websiteUrl,
      departments, totalDepartments, studentCapacity, placementCellAvailable,
      logo, logoPublicId, banner, bannerPublicId,
      status, studentLimit, alumniLimit,
      adminName, adminEmail, adminMobile, adminPassword,
      departmentsData, // New field: array of {name, code}
      inviteCode, inviteCodeStatus
    } = req.body;

    // Check if college code already exists
    const existing = await prisma.college.findUnique({ where: { collegeCode } });
    if (existing) return res.status(400).json({ error: 'College code already exists' });

    // 1. Create College
    const college = await prisma.college.create({
      data: {
        name, collegeCode, institutionType, universityName, 
        isAutonomous: isAutonomous === 'true' || isAutonomous === true, 
        establishmentYear,
        country, state, city, address, pincode,
        officialEmail, officialPhone, websiteUrl,
        departments: departments || (departmentsData ? departmentsData.map(d => d.name).join(', ') : ''), 
        totalDepartments: parseInt(totalDepartments) || (departmentsData ? departmentsData.length : 0),
        studentCapacity: parseInt(studentCapacity) || 0,
        placementCellAvailable: placementCellAvailable === 'true' || placementCellAvailable === true,
        logo, logoPublicId, banner, bannerPublicId,
        status: status || 'active',
        studentLimit: parseInt(studentLimit) || 1000,
        alumniLimit: parseInt(alumniLimit) || 1000,
        inviteCode: inviteCode || `${name.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}`,
        inviteCodeStatus: inviteCodeStatus === 'true' || inviteCodeStatus === true
      }
    });

    // 2. Create Departments if provided
    if (departmentsData && Array.isArray(departmentsData)) {
      for (const d of departmentsData) {
        if (d.name && d.code) {
          await prisma.department.create({
            data: {
              name: d.name,
              code: d.code,
              collegeId: college.id,
              status: 'active'
            }
          });
        }
      }
    }

    // 3. Create College Admin
    const hashedPassword = await bcrypt.hash(adminPassword || '123456', 10);
    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'COLLEGE_ADMIN',
        collegeId: college.id,
        isVerified: true
      }
    });

    // 4. Generate Initial Signup Codes
    const currentYear = new Date().getFullYear().toString();
    
    // a. General Student Code
    await prisma.signupCode.create({
      data: {
        code: generateInviteCodeString(collegeCode, 'STUDENT', currentYear),
        collegeId: college.id,
        role: 'STUDENT',
        batch: currentYear,
        usageLimit: 1000,
        status: 'ACTIVE',
        createdBy: adminUser.id // Created by the new college admin or current super admin
      }
    });

    // b. Department Specific Student Codes
    if (departmentsData && Array.isArray(departmentsData)) {
      for (const d of departmentsData) {
        if (d.name && d.code) {
          await prisma.signupCode.create({
            data: {
              code: generateInviteCodeString(collegeCode, d.code, currentYear),
              collegeId: college.id,
              departmentId: null, // We'll map by name for now as per current schema usage
              departmentName: d.name,
              role: 'STUDENT',
              batch: currentYear,
              usageLimit: 500,
              status: 'ACTIVE',
              createdBy: adminUser.id
            }
          });
        }
      }
    }

    // c. General Alumni Code
    await prisma.signupCode.create({
      data: {
        code: generateInviteCodeString(collegeCode, 'ALUMNI', currentYear),
        collegeId: college.id,
        role: 'ALUMNI',
        usageLimit: 2000,
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    });

    res.json({ message: 'College, Departments, Admin and Secure Invite Codes created successfully', college });
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ error: error.message || 'Failed to create college' });
  }
};

export const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    const { departmentsData } = data;

    // Remove fields that shouldn't be updated directly via this method
    delete data.id;
    delete data.createdAt;
    delete data.departmentsData; // Don't pass this directly to Prisma college.update
    delete data.users; // Avoid updating users relation directly here

    // Convert types
    if (data.totalDepartments) data.totalDepartments = parseInt(data.totalDepartments);
    if (data.studentCapacity) data.studentCapacity = parseInt(data.studentCapacity);
    if (data.studentLimit) data.studentLimit = parseInt(data.studentLimit);
    if (data.alumniLimit) data.alumniLimit = parseInt(data.alumniLimit);
    if (data.isAutonomous !== undefined) data.isAutonomous = data.isAutonomous === 'true' || data.isAutonomous === true;
    if (data.placementCellAvailable !== undefined) data.placementCellAvailable = data.placementCellAvailable === 'true' || data.placementCellAvailable === true;
    if (data.inviteCodeStatus !== undefined) data.inviteCodeStatus = data.inviteCodeStatus === 'true' || data.inviteCodeStatus === true;

    // 0. Handle Cloudinary cleanup for branding
    const college = await prisma.college.findUnique({ where: { id: parseInt(id) } });
    if (data.logoPublicId && college.logoPublicId && data.logoPublicId !== college.logoPublicId) {
      await deleteFromCloudinary(college.logoPublicId);
    }
    if (data.bannerPublicId && college.bannerPublicId && data.bannerPublicId !== college.bannerPublicId) {
      await deleteFromCloudinary(college.bannerPublicId);
    }

    // Sync comma-separated string for signup validation and update total count
    if (departmentsData && Array.isArray(departmentsData)) {
      data.departments = departmentsData.filter(d => d.name).map(d => d.name).join(', ');
      data.totalDepartments = departmentsData.length;
    }

    const updated = await prisma.college.update({
      where: { id: parseInt(id) },
      data: data
    });

    // Sync individual Department records
    if (departmentsData && Array.isArray(departmentsData)) {
      for (const d of departmentsData) {
        if (d.name && d.code) {
          await prisma.department.upsert({
            where: {
              collegeId_code: {
                collegeId: parseInt(id),
                code: d.code
              }
            },
            update: {
              name: d.name,
              status: 'active'
            },
            create: {
              name: d.name,
              code: d.code,
              collegeId: parseInt(id),
              status: 'active'
            }
          });
        }
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({ error: 'Failed to update college' });
  }
};

export const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;
    // Note: This might fail if there are dependent records. 
    // In a real system, we usually disable rather than delete.
    await prisma.college.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ error: 'Failed to delete college. Ensure no users are linked to it.' });
  }
};

export const toggleCollegeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await prisma.college.findUnique({ where: { id: parseInt(id) } });
    
    if (!college) return res.status(404).json({ error: 'College not found' });

    const updated = await prisma.college.update({
      where: { id: college.id },
      data: { status: college.status === 'active' ? 'inactive' : 'active' }
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ error: 'Failed to toggle college status' });
  }
};
export const toggleInviteCode = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await prisma.college.findUnique({ where: { id: parseInt(id) } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const updated = await prisma.college.update({
      where: { id: college.id },
      data: { inviteCodeStatus: !college.inviteCodeStatus }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle invite code status' });
  }
};

export const regenerateInviteCode = async (req, res) => {
  try {
    const { id } = req.params;
    const college = await prisma.college.findUnique({ where: { id: parseInt(id) } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const newCode = generateInviteCodeString(college.collegeCode, 'GEN', new Date().getFullYear().toString());
    
    const updated = await prisma.college.update({
      where: { id: college.id },
      data: { inviteCode: newCode }
    });

    // Also create a record in SignupCode for this new "legacy" code to ensure it works with the new system
    await prisma.signupCode.upsert({
      where: { code: newCode },
      update: { status: 'ACTIVE' },
      create: {
        code: newCode,
        collegeId: college.id,
        role: 'STUDENT',
        usageLimit: 1000,
        status: 'ACTIVE'
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Regenerate invite code error:', error);
    res.status(500).json({ error: 'Failed to regenerate invite code' });
  }
};
