import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = (port, secure) => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,   // 10 seconds
    socketTimeout: 10000      // 10 seconds
  });
};

const sendMailWithFallback = async (mailOptions) => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const configuredPort = parseInt(process.env.SMTP_PORT);
  const isSecure = process.env.SMTP_SECURE === 'true';

  if (configuredPort) {
    try {
      const transporter = createTransporter(configuredPort, isSecure);
      return await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error(`Configured SMTP port ${configuredPort} failed, trying fallbacks...`, err.message);
    }
  }

  // Try Port 587 (TLS)
  try {
    const transporter = createTransporter(587, false);
    return await transporter.sendMail(mailOptions);
  } catch (err587) {
    console.warn('SMTP Port 587 (TLS) failed, trying Port 465 (SSL)... Error:', err587.message);
    // Try Port 465 (SSL)
    try {
      const transporter = createTransporter(465, true);
      return await transporter.sendMail(mailOptions);
    } catch (err465) {
      console.warn('SMTP Port 465 (SSL) failed, trying Port 2525... Error:', err465.message);
      // Try Port 2525
      try {
        const transporter = createTransporter(2525, false);
        return await transporter.sendMail(mailOptions);
      } catch (err2525) {
        console.error('All SMTP transport fallbacks failed.');
        throw err2525;
      }
    }
  }
};

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://campusbridge.zinoingroup.in';

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${FRONTEND_URL}/verify?token=${token}`;

  const mailOptions = {
    from: `"CampusBridge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email - CampusBridge',
    html: `
      <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 24px;">Verify your email</h1>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 32px;">
            Thank you for joining CampusBridge. Please click the button below to verify your email address and activate your account. This link expires in 10 minutes.
          </p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px;">
            Verify Email Address
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 40px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  await sendMailWithFallback(mailOptions);
};

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"CampusBridge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your CampusBridge Account',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background-color: #f4f7fa;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 48px; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e1e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800;">C</div>
          </div>
          <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 12px; text-align: center; letter-spacing: -0.01em;">Verify your account</h1>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 32px; text-align: center; font-size: 15px;">
            Thank you for joining CampusBridge. Use the verification code below to complete your registration.
          </p>
          <div style="background-color: #f8fafc; padding: 32px; border-radius: 24px; text-align: center; border: 2px solid #e2e8f0; margin-bottom: 32px;">
            <div style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Your verification code</div>
            <span style="font-size: 40px; font-weight: 900; color: #4f46e5; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 0;">
            This OTP expires in <b>10 minutes</b>.
          </p>
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px;">
              Didn't request this? You can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await sendMailWithFallback(mailOptions);
};

export const sendNotificationEmail = async (email, { title, message, link }) => {
  const actionUrl = link ? `${FRONTEND_URL}${link}` : `${FRONTEND_URL}/dashboard`;

  const mailOptions = {
    from: `"CampusBridge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: title || 'New Notification - CampusBridge',
    html: `
      <div style="font-family: sans-serif; padding: 40px; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
          <h1 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 16px;">${title}</h1>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 32px;">
            ${message}
          </p>
          <a href="${actionUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px;">
            View Details
          </a>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            You are receiving this because your email notifications are turned ON. You can manage this in your settings.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sendMailWithFallback(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendPasswordResetEmail = async (email, otp) => {
  const mailOptions = {
    from: `"CampusBridge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your CampusBridge Password',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background-color: #f4f7fa;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 48px; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e1e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #ef4444, #f43f5e); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800;">C</div>
          </div>
          <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 12px; text-align: center; letter-spacing: -0.01em;">Reset your password</h1>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 32px; text-align: center; font-size: 15px;">
            We received a request to reset your CampusBridge password. Use the verification code below to proceed.
          </p>
          <div style="background-color: #fef2f2; padding: 32px; border-radius: 24px; text-align: center; border: 2px solid #fee2e2; margin-bottom: 32px;">
            <div style="font-size: 11px; font-weight: 800; color: #ef4444; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Your reset code</div>
            <span style="font-size: 40px; font-weight: 900; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 0;">
            This code expires in <b>10 minutes</b>.
          </p>
          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await sendMailWithFallback(mailOptions);
};

export const sendWelcomeEmail = async (email, { name, role, collegeName }) => {
  const loginUrl = `${FRONTEND_URL}/login`;
  const roleDisplay = role.replace('_', ' ');

  const mailOptions = {
    from: `"CampusBridge" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to CampusBridge! 🎉',
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; background-color: #f4f7fa;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 48px; border-radius: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.05); border: 1px solid #e1e8f0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800;">C</div>
          </div>
          <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 12px; text-align: center; letter-spacing: -0.01em;">Welcome to CampusBridge!</h1>
          <p style="color: #64748b; line-height: 1.6; margin-bottom: 32px; text-align: center; font-size: 16px;">
            Hi ${name}, your account has been created successfully.
          </p>
          
          <div style="background-color: #f8fafc; padding: 24px; border-radius: 24px; border: 1px solid #e2e8f0; margin-bottom: 32px;">
            <h3 style="color: #0f172a; margin-top: 0; font-size: 16px; font-weight: 700;">Account Details</h3>
            <ul style="list-style: none; padding: 0; margin: 0; color: #475569; font-size: 14px; line-height: 1.8;">
              <li><strong>Role:</strong> ${roleDisplay}</li>
              <li><strong>Institution:</strong> ${collegeName}</li>
            </ul>
          </div>

          <div style="background-color: #fffbeb; padding: 24px; border-radius: 24px; border: 1px solid #fef3c7; margin-bottom: 32px;">
            <h3 style="color: #b45309; margin-top: 0; font-size: 15px; font-weight: 700;">What's next?</h3>
            <p style="color: #d97706; margin: 0; font-size: 14px; line-height: 1.6;">
              Your account is currently under verification by your college administrator. Once approved, you will have full access to explore networking, referrals, mentorships, and career tools. We will notify you via email as soon as you are verified!
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${loginUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 16px 32px; border-radius: 16px; font-weight: 700; text-decoration: none; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
              Go to Login
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 32px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
              You are receiving this email because you signed up for CampusBridge. If you need any assistance, please contact your institution's support team.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await sendMailWithFallback(mailOptions);
  } catch (error) {
    console.error('Welcome email sending failed:', error);
  }
};

export default { sendVerificationEmail, sendNotificationEmail, sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail };
