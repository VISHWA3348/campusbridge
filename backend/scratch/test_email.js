import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'NOT SET');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function testEmail() {
  try {
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"CampusBridge Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to self
      subject: 'SMTP Test - Alumni Reference System',
      text: 'If you received this, the SMTP configuration is working correctly.',
      html: '<b>✅ SMTP configuration is working correctly!</b>',
    });

    console.log('✅ Test email sent:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
}

testEmail();
