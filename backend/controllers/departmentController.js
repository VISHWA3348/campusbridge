import prisma from '../prisma/db.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        college: { select: { name: true } }
      }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { 
      name, code, collegeId, hodName, hodEmail, phoneNumber,
      studentCapacity, placementCoordinatorName, placementCoordinatorEmail,
      placementCoordinatorPhone, category, status 
    } = req.body;

    const existing = await prisma.department.findUnique({
      where: { collegeId_code: { collegeId: parseInt(collegeId), code } }
    });
    if (existing) return res.status(400).json({ error: 'Department code already exists in this college' });

    const department = await prisma.department.create({
      data: {
        name, code, 
        collegeId: parseInt(collegeId),
        hodName, hodEmail, phoneNumber,
        studentCapacity: parseInt(studentCapacity) || 60,
        placementCoordinatorName, placementCoordinatorEmail,
        placementCoordinatorPhone, category,
        status: status || 'active'
      }
    });
    res.json(department);
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Clean data
    delete data.id;
    if (data.collegeId) data.collegeId = parseInt(data.collegeId);
    if (data.studentCapacity) data.studentCapacity = parseInt(data.studentCapacity);

    const updated = await prisma.department.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department' });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id: parseInt(id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

export const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await prisma.department.findUnique({ where: { id: parseInt(id) } });
    if (!dept) return res.status(404).json({ error: 'Department not found' });

    const updated = await prisma.department.update({
      where: { id: parseInt(id) },
      data: { status: dept.status === 'active' ? 'inactive' : 'active' }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
};
