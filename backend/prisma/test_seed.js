import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123456', 10);

  // 1. Create College ABC
  const collegeABC = await prisma.college.upsert({
    where: { collegeCode: 'ABC-101' },
    update: {},
    create: {
      name: 'ABC College',
      collegeCode: 'ABC-101',
      status: 'active'
    }
  });

  // 2. Super Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@test.com' },
    update: { isVerified: true },
    create: {
      name: 'Global Super Admin',
      email: 'superadmin@test.com',
      password,
      role: 'SUPER_ADMIN',
      collegeId: collegeABC.id,
      isVerified: true
    }
  });

  // 3. College Admin
  await prisma.user.upsert({
    where: { email: 'admin@abc.com' },
    update: { isVerified: true },
    create: {
      name: 'ABC Admin',
      email: 'admin@abc.com',
      password,
      role: 'COLLEGE_ADMIN',
      collegeId: collegeABC.id,
      isVerified: true
    }
  });

  // 4. Create Departments
  const deptCSE = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: collegeABC.id, code: 'CSE' } },
    update: {},
    create: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
      collegeId: collegeABC.id,
      category: 'CSE',
      status: 'active'
    }
  });

  const deptECE = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: collegeABC.id, code: 'ECE' } },
    update: {},
    create: {
      name: 'Electronics and Communication Engineering',
      code: 'ECE',
      collegeId: collegeABC.id,
      category: 'ECE',
      status: 'active'
    }
  });

  async function createRoleUser(name, email, role, deptCode) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { isVerified: true },
      create: {
        name,
        email,
        password,
        role,
        collegeId: collegeABC.id,
        isVerified: true
      }
    });

    if (role === 'STUDENT') {
      await prisma.student.upsert({
        where: { userId: user.id },
        update: { department: deptCode },
        create: {
          userId: user.id,
          department: deptCode,
          departmentId: deptCode // Keeping it consistent with how it's used in some parts of the app
        }
      });
    } else if (role === 'ALUMNI') {
      await prisma.alumni.upsert({
        where: { userId: user.id },
        update: {
          company: 'Test Corp',
          role: 'Engineer',
          department: deptCode
        },
        create: {
          userId: user.id,
          company: 'Test Corp',
          role: 'Engineer',
          department: deptCode
        }
      });
    }
    return user;
  }

  await createRoleUser('CSE Student', 'student1@abc.com', 'STUDENT', 'CSE');
  await createRoleUser('ECE Student', 'student2@abc.com', 'STUDENT', 'ECE');
  await createRoleUser('CSE Alumni', 'alumni1@abc.com', 'ALUMNI', 'CSE');
  await createRoleUser('ECE Alumni', 'alumni2@abc.com', 'ALUMNI', 'ECE');

  console.log('Test seeding with departments completed!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
