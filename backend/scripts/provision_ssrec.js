/**
 * SSREC College Provisioning Script
 * 
 * Usage: node backend/scripts/provision_ssrec.js
 * 
 * This script uses the reusable collegeProvisioningService to safely
 * add Sri Sai Ranganathan Engineering College into the production database.
 * 
 * Safety:
 * - Checks for duplicates before inserting
 * - Uses a single Prisma transaction (auto-rollback on failure)
 * - Does NOT modify existing data
 * - Disconnects Prisma client on completion
 */

import dotenv from 'dotenv';
dotenv.config();

import { provisionCollege } from '../services/collegeProvisioningService.js';
import prisma from '../prisma/db.js';

async function main() {
  console.log('======================================');
  console.log('  SSREC College Provisioning');
  console.log('======================================');
  console.log(`  Database: ${process.env.DATABASE_URL ? '(connected)' : 'NOT SET'}`);
  console.log('');

  try {
    const result = await provisionCollege({
      college: {
        name: 'Sri Sai Ranganathan Engineering College',
        collegeCode: '7131',
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
        studentCapacity: 480,
        placementCellAvailable: true,
        status: 'active',
        studentLimit: 1000,
        alumniLimit: 1000,
        inviteCode: 'SSREC-2026',
        inviteCodeStatus: true
      },

      admin: {
        name: 'SSREC Admin',
        email: 'thevishwaofficial@gmail.com',
        password: 'Vishwa@8105'
      },

      departments: [
        { name: 'Computer Science and Engineering', code: 'CSE01' },
        { name: 'Electronics and Communication Engineering', code: 'ECE01' },
        { name: 'Computer Science', code: 'CS01' },
        { name: 'Artificial Intelligence and Machine Learning', code: 'AIML01' },
        { name: 'Electrical and Electronics Engineering', code: 'EEE01' },
        { name: 'Civil Engineering', code: 'CIVIL01' },
        { name: 'Artificial Intelligence and Data Science', code: 'AIDS01' },
        { name: 'Information Technology', code: 'IT01' }
      ],

      signupCodeLimits: {
        student: 1000,
        deptStudent: 500,
        alumni: 2000
      }
    });

    console.log('✓ College provisioned successfully!');
    console.log(`  College: ${result.college.name} (ID: ${result.college.id})`);
    console.log(`  Admin:   ${result.admin.email} (ID: ${result.admin.id})`);
    console.log(`  Departments: ${result.departmentCount}`);
    console.log(`  Signup Codes: ${result.signupCodeCount}`);
    console.log('');
    console.log('======================================');
    console.log('  PROVISIONING COMPLETE');
    console.log('======================================');

  } catch (error) {
    console.error('');
    console.error('✗ Provisioning failed:', error.message);
    console.error('');
    console.error('  No data was written (transaction rolled back).');
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
