import prisma from '../prisma/db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Generates a unique, random invite code string for a college.
 * Uses crypto.randomBytes for secure random generation.
 * @param {string} collegeCode - The college identifier code
 * @param {string} subIdentifier - Sub-category (e.g., 'STUDENT', 'ALUMNI', dept code)
 * @param {string} year - The academic year
 * @returns {string} A formatted invite code
 */
const generateInviteCode = (collegeCode, subIdentifier, year) => {
  const randomPart = crypto.randomBytes(4).toString('hex').substring(0, 5).toUpperCase();
  const collegePart = (collegeCode || 'CB').toUpperCase();
  const subPart = (subIdentifier || 'GEN').toUpperCase();
  const yearPart = year || new Date().getFullYear().toString();
  return `${collegePart}-${subPart}-${yearPart}-${randomPart}`;
};

/**
 * Provisions a new college with departments, admin user, and signup codes.
 * All operations are wrapped in a single Prisma transaction — if any step fails,
 * everything is rolled back automatically.
 *
 * @param {object} config - College provisioning configuration
 * @param {object} config.college - College record fields
 * @param {object} config.admin - Admin user details (name, email, password)
 * @param {Array<{name: string, code: string}>} config.departments - Departments to create
 * @param {object} [config.signupCodeLimits] - Optional limits for signup codes
 * @returns {Promise<{college: object, admin: object, departmentCount: number, signupCodeCount: number}>}
 */
export async function provisionCollege(config) {
  const { college, admin, departments, signupCodeLimits = {} } = config;

  // --- Pre-flight validation (outside transaction for fast feedback) ---

  if (!college || !college.collegeCode) {
    throw new Error('College configuration with collegeCode is required.');
  }
  if (!admin || !admin.email || !admin.password) {
    throw new Error('Admin email and password are required.');
  }
  if (!departments || departments.length === 0) {
    throw new Error('At least one department is required.');
  }

  // Check for existing college
  const existingCollege = await prisma.college.findUnique({
    where: { collegeCode: college.collegeCode }
  });
  if (existingCollege) {
    throw new Error(`College with code "${college.collegeCode}" already exists (ID: ${existingCollege.id}).`);
  }

  // Check for existing admin email
  const existingUser = await prisma.user.findUnique({
    where: { email: admin.email }
  });
  if (existingUser) {
    throw new Error(`User with email "${admin.email}" already exists (ID: ${existingUser.id}).`);
  }

  // Check invite code uniqueness if provided
  if (college.inviteCode) {
    const existingInvite = await prisma.college.findUnique({
      where: { inviteCode: college.inviteCode }
    });
    if (existingInvite) {
      throw new Error(`Invite code "${college.inviteCode}" is already in use.`);
    }
  }

  // --- Execute inside a Prisma transaction (30s timeout) ---
  const result = await prisma.$transaction(async (tx) => {

    // 1. Create the college record
    const departmentNamesStr = departments.map(d => d.name).join(', ');
    const newCollege = await tx.college.create({
      data: {
        ...college,
        departments: departmentNamesStr,
        totalDepartments: departments.length,
      }
    });

    // 2. Create departments linked to the college
    for (const dept of departments) {
      await tx.department.create({
        data: {
          name: dept.name,
          code: dept.code,
          collegeId: newCollege.id,
          status: 'active'
        }
      });
    }

    // 3. Create the college admin user (password hashed with bcrypt)
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const adminUser = await tx.user.create({
      data: {
        name: admin.name || `${college.name} Admin`,
        email: admin.email,
        password: hashedPassword,
        role: 'COLLEGE_ADMIN',
        collegeId: newCollege.id,
        isVerified: true,
        verificationStatus: 'APPROVED'
      }
    });

    // 4. Generate signup codes
    const currentYear = new Date().getFullYear().toString();
    const studentLimit = signupCodeLimits.student || 1000;
    const deptStudentLimit = signupCodeLimits.deptStudent || 500;
    const alumniLimit = signupCodeLimits.alumni || 2000;
    let signupCodeCount = 0;

    // 4a. General student signup code
    await tx.signupCode.create({
      data: {
        code: generateInviteCode(college.collegeCode, 'STUDENT', currentYear),
        collegeId: newCollege.id,
        role: 'STUDENT',
        batch: currentYear,
        usageLimit: studentLimit,
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    });
    signupCodeCount++;

    // 4b. Department-specific student codes
    for (const dept of departments) {
      await tx.signupCode.create({
        data: {
          code: generateInviteCode(college.collegeCode, dept.code, currentYear),
          collegeId: newCollege.id,
          departmentName: dept.name,
          role: 'STUDENT',
          batch: currentYear,
          usageLimit: deptStudentLimit,
          status: 'ACTIVE',
          createdBy: adminUser.id
        }
      });
      signupCodeCount++;
    }

    // 4c. General alumni signup code
    await tx.signupCode.create({
      data: {
        code: generateInviteCode(college.collegeCode, 'ALUMNI', currentYear),
        collegeId: newCollege.id,
        role: 'ALUMNI',
        usageLimit: alumniLimit,
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    });
    signupCodeCount++;

    return {
      college: newCollege,
      admin: { id: adminUser.id, email: adminUser.email, name: adminUser.name },
      departmentCount: departments.length,
      signupCodeCount
    };

  }, { timeout: 30000 });

  return result;
}
