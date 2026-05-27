import prisma from './prisma/db.js';
import bcrypt from 'bcryptjs';
import { generateInviteCodeString } from './utils/inviteCode.js';

async function testCreateCollege() {
  console.log("Starting college creation test...");
  try {
    const name = "Test University";
    const collegeCode = "TESTUNI";
    const institutionType = "Engineering";
    const universityName = "Test Uni Board";
    const isAutonomous = true;
    const establishmentYear = "2020";
    const country = "India";
    const state = "Tamil Nadu";
    const city = "Chennai";
    const address = "123 Test St";
    const pincode = "600001";
    const officialEmail = "test@uni.edu";
    const officialPhone = "1234567890";
    const websiteUrl = "https://testuni.edu";
    const departments = "Computer Science, IT";
    const totalDepartments = 2;
    const studentCapacity = 120;
    const placementCellAvailable = true;
    const logo = "";
    const logoPublicId = "";
    const banner = "";
    const bannerPublicId = "";
    const status = "active";
    const studentLimit = 1000;
    const alumniLimit = 1000;
    const adminName = "Test Admin";
    const adminEmail = "testadmin@uni.edu";
    const adminPassword = "password123";
    const departmentsData = [{ name: "Computer Science", code: "CSE" }, { name: "Information Technology", code: "IT" }];
    const inviteCode = "TEST-INV";
    const inviteCodeStatus = true;

    // Check if college code already exists
    const existing = await prisma.college.findUnique({ where: { collegeCode } });
    if (existing) {
      console.log("College code already exists, deleting first...");
      await prisma.signupCode.deleteMany({ where: { collegeId: existing.id } });
      await prisma.user.deleteMany({ where: { collegeId: existing.id } });
      await prisma.department.deleteMany({ where: { collegeId: existing.id } });
      await prisma.college.delete({ where: { id: existing.id } });
    }

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
    console.log("College created successfully:", college.id);

    // 2. Create Departments
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
    console.log("Departments created.");

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
    console.log("Admin user created:", adminUser.id);

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
        createdBy: adminUser.id
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
              departmentId: null,
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

    console.log("Signup codes created successfully.");
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    process.exit(0);
  }
}

testCreateCollege();
