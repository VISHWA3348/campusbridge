import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'Not set');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

async function main() {
  try {
    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('Transporter verified successfully!');
    
    console.log('Sending test mail...');
    await transporter.sendMail({
      from: `"CampusBridge Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test SMTP CampusBridge',
      text: 'SMTP connection is working!'
    });
    console.log('Test mail sent successfully!');
  } catch (error) {
    console.error('SMTP test failed:', error);
  }
}

main();
