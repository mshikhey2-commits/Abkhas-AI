/**
 * SMTP Email Service - Backend Implementation (Node.js/Express)
 * 
 * This is a server-side implementation for sending emails securely.
 * Place this file in your backend API server (not in the React frontend).
 * 
 * Installation:
 * npm install nodemailer dotenv express
 * 
 * Usage:
 * POST /api/send-email
 * Body: { to, subject, text, html }
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const router = express.Router();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Optional: rate limiting
  rateLimit: {
    max: 100, // max emails per minute
    windowMs: 60 * 1000, // time window
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('[SMTP] Connection failed:', error);
  } else {
    console.log('[SMTP] Server ready to send emails');
  }
});

/**
 * POST /api/send-email
 * Send email via SMTP
 */
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    // Validation
    if (!to || !subject || !text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, text',
      });
    }

    // Rate limiting check (optional)
    const clientIp = req.ip;
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too many email requests. Please try again later.',
      });
    }

    // Send email
    const result = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM}>`,
      to,
      subject,
      text,
      html,
      // Optional: tracking
      headers: {
        'X-Entity-Ref-ID': `email_${Date.now()}`,
      },
    });

    console.log(`[SMTP] Email sent to ${to}:`, result.messageId);

    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('[SMTP] Error sending email:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/send-otp
 * Send OTP email with template
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { to, code, language = 'en', expiryMinutes = 10 } = req.body;

    if (!to || !code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, code',
      });
    }

    // OTP email templates
    const templates = {
      ar: {
        subject: 'رمز التحقق من ABKHAS AI',
        text: `رمز التحقق الخاص بك هو: ${code}\n\nسينتهي صلاحية هذا الرمز في غضون ${expiryMinutes} دقائق.`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
              <h1 style="margin: 0; font-size: 28px;">ABKHAS AI</h1>
            </div>
            <div style="padding: 40px 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937;">مرحباً!</h2>
              <p style="color: #4b5563; font-size: 16px;">رمز التحقق الخاص بك هو:</p>
              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #FF6B35; font-size: 48px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</h1>
              </div>
              <p style="color: #4b5563; font-size: 14px;">
                سينتهي صلاحية هذا الرمز في غضون <strong>${expiryMinutes} دقائق</strong>.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px;">
              <p>© 2026 ABKHAS AI. جميع الحقوق محفوظة.</p>
            </div>
          </div>
        `,
      },
      en: {
        subject: 'ABKHAS AI Verification Code',
        text: `Your verification code is: ${code}\n\nThis code will expire in ${expiryMinutes} minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
              <h1 style="margin: 0; font-size: 28px;">ABKHAS AI</h1>
            </div>
            <div style="padding: 40px 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937;">Hi there!</h2>
              <p style="color: #4b5563; font-size: 16px;">Your verification code is:</p>
              <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #FF6B35; font-size: 48px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</h1>
              </div>
              <p style="color: #4b5563; font-size: 14px;">
                This code will expire in <strong>${expiryMinutes} minutes</strong>.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px;">
              <p>© 2026 ABKHAS AI. All rights reserved.</p>
            </div>
          </div>
        `,
      },
    };

    const template = templates[language] || templates['en'];

    const result = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log(`[SMTP] OTP sent to ${to}:`, result.messageId);

    res.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('[SMTP] Error sending OTP:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to send OTP',
    });
  }
});

/**
 * GET /api/smtp/status
 * Check SMTP configuration status
 */
router.get('/smtp/status', async (req, res) => {
  try {
    await transporter.verify();

    res.json({
      success: true,
      status: 'SMTP is configured and working',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      from: process.env.SMTP_FROM,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SMTP configuration error',
      message: error.message,
    });
  }
});

// Rate limiting helper (simple in-memory implementation)
const requestLimits = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const limit = requestLimits.get(clientIp);

  if (!limit || now > limit.resetTime) {
    requestLimits.set(clientIp, { count: 1, resetTime: now + 60 * 1000 });
    return false;
  }

  if (limit.count >= 10) {
    return true;
  }

  limit.count++;
  return false;
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestLimits) {
    if (now > data.resetTime) {
      requestLimits.delete(ip);
    }
  }
}, 10 * 60 * 1000);

export default router;

/**
 * Example usage in Express app:
 * 
 * import emailRouter from './routes/email.js';
 * 
 * app.use('/api', emailRouter);
 * 
 * Or with CORS and middleware:
 * 
 * app.use('/api', cors(), emailRouter);
 */
