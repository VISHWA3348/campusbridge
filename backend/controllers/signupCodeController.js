import prisma from '../prisma/db.js';
import { v4 as uuidv4 } from 'uuid';

export const getSignupCodes = async (req, res) => {
  const { collegeId } = req.query;
  try {
    const where = collegeId ? { collegeId: parseInt(collegeId) } : {};
    const codes = await prisma.signupCode.findMany({
      where,
      include: {
        college: { select: { name: true } },
        _count: { select: { users: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(codes);
  } catch (error) {
    console.error('Error fetching signup codes:', error);
    res.status(500).json({ error: 'Failed to fetch signup codes' });
  }
};

export const createSignupCode = async (req, res) => {
  const { 
    collegeId, departmentId, departmentName, batch, role, 
    expiryDate, usageLimit, count = 1, prefix = "" 
  } = req.body;

  try {
    const college = await prisma.college.findUnique({ where: { id: parseInt(collegeId) } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const createdCodes = [];

    for (let i = 0; i < count; i++) {
      // Generate a unique, hard-to-guess code
      // Format: PREFIX-ROLE-RANDOM (e.g. ABC-STUDENT-X7A92)
      const randomPart = uuidv4().split('-')[0].toUpperCase();
      const generatedCode = `${prefix || college.collegeCode || 'CB'}-${role}-${randomPart}`;

      const newCode = await prisma.signupCode.create({
        data: {
          code: generatedCode,
          collegeId: parseInt(collegeId),
          departmentId: departmentId ? parseInt(departmentId) : null,
          departmentName: departmentName || null,
          batch: batch || null,
          role,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : 1,
          status: 'ACTIVE',
          createdBy: req.user.userId
        }
      });
      createdCodes.push(newCode);
    }

    res.status(201).json({
      message: `${createdCodes.length} code(s) generated successfully`,
      codes: createdCodes
    });
  } catch (error) {
    console.error('Error creating signup code:', error);
    res.status(500).json({ error: 'Failed to generate signup codes' });
  }
};

export const updateSignupCode = async (req, res) => {
  const { id } = req.params;
  const { status, expiryDate, usageLimit } = req.body;

  try {
    const updated = await prisma.signupCode.update({
      where: { id: parseInt(id) },
      data: {
        status,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating signup code:', error);
    res.status(500).json({ error: 'Failed to update signup code' });
  }
};

export const deleteSignupCode = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.signupCode.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Code deleted successfully' });
  } catch (error) {
    console.error('Error deleting signup code:', error);
    res.status(500).json({ error: 'Failed to delete signup code' });
  }
};

export const validateInviteCode = async (req, res) => {
  const { code, role } = req.query;

  if (!code) return res.status(400).json({ error: 'Invite code is required' });

  try {
    const signupCode = await prisma.signupCode.findUnique({
      where: { code },
      include: { college: true }
    });

    if (!signupCode) {
      return res.status(404).json({ error: 'Invalid or Unauthorized Signup Code' });
    }

    if (signupCode.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'This signup code is no longer active' });
    }

    if (signupCode.expiryDate && new Date() > signupCode.expiryDate) {
      return res.status(400).json({ error: 'This signup code has expired' });
    }

    if (signupCode.usageLimit && signupCode.usedCount >= signupCode.usageLimit) {
      return res.status(400).json({ error: 'This signup code has reached its usage limit' });
    }

    if (role && signupCode.role !== role) {
      return res.status(400).json({ error: `This code is only for ${signupCode.role.toLowerCase()} registration` });
    }

    res.json({
      valid: true,
      college: {
        id: signupCode.college.id,
        name: signupCode.college.name,
        collegeCode: signupCode.college.collegeCode
      },
      departmentName: signupCode.departmentName,
      departmentId: signupCode.departmentId,
      batch: signupCode.batch,
      role: signupCode.role
    });
  } catch (error) {
    console.error('Error validating invite code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
