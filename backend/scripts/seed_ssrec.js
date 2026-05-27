import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const generateInviteCodeString = (collegeCode, subIdentifier, year) => {
  const randomPart = uuidv4().split('-')[0].substring(0, 5).toUpperCase();
  const collegePart = (collegeCode || 'CB').toUpperCase();
  const subPart = (subIdentifier || 'GEN').toUpperCase();
  const yearPart = year || new Date().getFullYear();

  return `${collegePart}-${subPart}-${yearPart}-${randomPart}`;
};

async function main() {
  console.log('=== SEEDING SSREC COLLEGE ===');
  
  const collegeCode = '7131';
  const adminEmail = 'thevishwaoffical@gmail.com';
  const adminPassword = 'Vshwa@8105';
  
  try {
    // 1. Check if college already exists
    const existingCollege = await prisma.college.findUnique({
      where: { collegeCode }
    });
    
    if (existingCollege) {
      console.warn(`[WARNING] College with code ${collegeCode} already exists in the database. Seeding skipped.`);
      return;
    }
    
    // 2. Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingUser) {
      console.error(`[ERROR] User with email ${adminEmail} already exists. Cannot proceed with seeding college.`);
      return;
    }
    
    // Define the departments list
    const departmentsData = [
      { name: 'Computer Science and Engineering', code: 'CSE01' },
      { name: 'Electronics and Communication Engineering', code: 'ECE01' },
      { name: 'Computer Science', code: 'CS01' },
      { name: 'Artificial Intelligence and Machine Learning', code: 'AIML01' },
      { name: 'Electrical and Electronics Engineering', code: 'EEE01' },
      { name: 'Civil Engineering', code: 'CIVIL01' },
      { name: 'Artificial Intelligence and Data Science', code: 'AIDS01' },
      { name: 'Information Technology', code: 'IT01' }
    ];
    
    const departmentNamesStr = departmentsData.map(d => d.name).join(', ');
    
    // Execute inside a Prisma transaction with a 30s timeout
    const result = await prisma.$transaction(async (tx) => {
      // Create College
      const college = await tx.college.create({
        data: {
          name: 'Sri Sai Ranganathan Engineering College',
          collegeCode,
          institutionType: 'Engineering',
          universityName: 'Anna University',
          isAutonomous: false,
          establishmentYear: '2015',
          country: 'India',
          state: 'Tamil Nadu',
          city: 'Coimbatore',
          address: 'Sri Sai Ranganathan Engineering College, Coimbatore, Tamil Nadu',
          pincode: '641001',
          officialEmail: 'contact@ssrec.edu.in',
          officialPhone: '04222345678',
          websiteUrl: 'https://www.ssrec.edu.in',
          departments: departmentNamesStr,
          totalDepartments: departmentsData.length,
          studentCapacity: 480,
          placementCellAvailable: true,
          status: 'active',
          studentLimit: 1000,
          alumniLimit: 1000,
          inviteCode: 'SSREC-2026',
          inviteCodeStatus: true
        }
      });
      
      console.log(`✓ College created: ${college.name} (ID: ${college.id})`);
      
      // Create Departments
      for (const d of departmentsData) {
        await tx.department.create({
          data: {
            name: d.name,
            code: d.code,
            collegeId: college.id,
            status: 'active'
          }
        });
      }
      console.log(`✓ Created ${departmentsData.length} departments.`);
      
      // Create College Admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = await tx.user.create({
        data: {
          name: 'SSREC Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'COLLEGE_ADMIN',
          collegeId: college.id,
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      console.log(`✓ Admin user created: ${adminUser.email}`);
      
      // Generate invite codes
      const currentYear = new Date().getFullYear().toString();
      
      // 1. General Student Code
      const studentCode = await tx.signupCode.create({
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
      console.log(`✓ General student signup code generated: ${studentCode.code}`);
      
      // 2. Department Specific Student Codes
      for (const d of departmentsData) {
        await tx.signupCode.create({
          data: {
            code: generateInviteCodeString(collegeCode, d.code, currentYear),
            collegeId: college.id,
            departmentName: d.name,
            role: 'STUDENT',
            batch: currentYear,
            usageLimit: 500,
            status: 'ACTIVE',
            createdBy: adminUser.id
          }
        });
      }
      console.log(`✓ Department specific student signup codes generated.`);
      
      // 3. General Alumni Code
      const alumniCode = await tx.signupCode.create({
        data: {
          code: generateInviteCodeString(collegeCode, 'ALUMNI', currentYear),
          collegeId: college.id,
          role: 'ALUMNI',
          usageLimit: 2000,
          status: 'ACTIVE',
          createdBy: adminUser.id
        }
      });
      console.log(`✓ General alumni signup code generated: ${alumniCode.code}`);
      
      return college;
    }, {
      timeout: 30000
    });
    
    console.log('=== SEEDING COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('◆ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
