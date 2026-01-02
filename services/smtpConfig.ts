/**
 * SMTP Configuration Service
 * Handles email sending via SMTP for 2FA OTP codes
 * 
 * Environment Variables Required:
 * - VITE_SMTP_HOST: SMTP server host (e.g., smtp.gmail.com)
 * - VITE_SMTP_PORT: SMTP server port (e.g., 587)
 * - VITE_SMTP_USER: Email address for authentication
 * - VITE_SMTP_PASSWORD: Email password or app-specific password
 * - VITE_SMTP_FROM: Sender email address
 * - VITE_SMTP_FROM_NAME: Sender name (e.g., "ABKHAS AI")
 */

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    email: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMTPConfigService {
  private config: SMTPConfig | null = null;
  private isConfigured = false;

  constructor() {
    this.loadConfiguration();
  }

  /**
   * Load SMTP configuration from environment variables
   */
  private loadConfiguration(): void {
    try {
      const host = import.meta.env.VITE_SMTP_HOST;
      const port = parseInt(import.meta.env.VITE_SMTP_PORT || '587');
      const user = import.meta.env.VITE_SMTP_USER;
      const pass = import.meta.env.VITE_SMTP_PASSWORD;
      const fromEmail = import.meta.env.VITE_SMTP_FROM;
      const fromName = import.meta.env.VITE_SMTP_FROM_NAME || 'ABKHAS AI';

      if (!host || !user || !pass || !fromEmail) {
        console.warn('[SMTP] Configuration incomplete. Email sending disabled.');
        this.isConfigured = false;
        return;
      }

      this.config = {
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        from: {
          name: fromName,
          email: fromEmail,
        },
      };

      this.isConfigured = true;
      console.log('[SMTP] Configuration loaded successfully');
    } catch (error) {
      console.error('[SMTP] Failed to load configuration:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Check if SMTP is configured
   */
  isReady(): boolean {
    return this.isConfigured && this.config !== null;
  }

  /**
   * Get current configuration (without sensitive data)
   */
  getConfig(): Partial<SMTPConfig> | null {
    if (!this.config) return null;
    return {
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      from: this.config.from,
    };
  }

  /**
   * Send email via SMTP (client-side mock, backend integration needed)
   * In production, call your backend API to send emails securely
   */
  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    if (!this.isConfigured || !this.config) {
      return {
        success: false,
        error: 'SMTP not configured. Please set environment variables.',
      };
    }

    try {
      // In production environment, send via backend API
      const response = await this.sendViaBackend({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      return response;
    } catch (error) {
      console.error('[SMTP] Failed to send email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email via backend API
   * Backend should validate SMTP credentials and send email
   */
  private async sendViaBackend(emailData: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Failed to send email',
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send OTP email with template
   */
  async sendOTPEmail(email: string, code: string, language: 'ar' | 'en' = 'en'): Promise<EmailResponse> {
    if (!this.config) {
      return {
        success: false,
        error: 'SMTP not configured',
      };
    }

    const templates = {
      ar: {
        subject: 'رمز التحقق من ABKHAS AI',
        text: `رمز التحقق الخاص بك هو: ${code}\n\nسينتهي صلاحية هذا الرمز في غضون 10 دقائق.`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2>مرحباً بك في ABKHAS AI</h2>
            <p>رمز التحقق الخاص بك هو:</p>
            <h1 style="color: #FF6B35; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p style="color: #666;">سينتهي صلاحية هذا الرمز في غضون <strong>10 دقائق</strong>.</p>
            <p style="color: #999; font-size: 12px;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.</p>
          </div>
        `,
      },
      en: {
        subject: 'ABKHAS AI Verification Code',
        text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Welcome to ABKHAS AI</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #FF6B35; font-size: 32px; letter-spacing: 5px;">${code}</h1>
            <p style="color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      },
    };

    const template = templates[language];

    return this.sendEmail({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string, language: 'ar' | 'en' = 'en'): Promise<EmailResponse> {
    const templates = {
      ar: {
        subject: 'أهلاً وسهلاً في ABKHAS AI',
        text: `مرحباً ${name}، شكراً لانضمامك إلى ABKHAS AI!`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2>مرحباً ${name}</h2>
            <p>شكراً لانضمامك إلى <strong>ABKHAS AI</strong>!</p>
            <p>نحن متحمسون لخدمتك. يمكنك الآن الوصول إلى جميع الميزات.</p>
          </div>
        `,
      },
      en: {
        subject: 'Welcome to ABKHAS AI',
        text: `Hi ${name}, thank you for joining ABKHAS AI!`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Hi ${name}</h2>
            <p>Thank you for joining <strong>ABKHAS AI</strong>!</p>
            <p>We're excited to serve you. You can now access all features.</p>
          </div>
        `,
      },
    };

    const template = templates[language];

    return this.sendEmail({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    language: 'ar' | 'en' = 'en'
  ): Promise<EmailResponse> {
    const templates = {
      ar: {
        subject: 'إعادة تعيين كلمة المرور - ABKHAS AI',
        text: `انقر على الرابط التالي لإعادة تعيين كلمة المرور: ${resetLink}`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
            <h2>إعادة تعيين كلمة المرور</h2>
            <p>لقد طلبت إعادة تعيين كلمة المرور. انقر على الزر أدناه:</p>
            <a href="${resetLink}" style="background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">إعادة تعيين كلمة المرور</a>
            <p style="color: #999; font-size: 12px;">لم تطلب ذلك؟ تجاهل هذا البريد الإلكتروني.</p>
          </div>
        `,
      },
      en: {
        subject: 'Password Reset - ABKHAS AI',
        text: `Click the link below to reset your password: ${resetLink}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Password Reset</h2>
            <p>You requested to reset your password. Click the button below:</p>
            <a href="${resetLink}" style="background-color: #FF6B35; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p style="color: #999; font-size: 12px;">Didn't request this? Ignore this email.</p>
          </div>
        `,
      },
    };

    const template = templates[language];

    return this.sendEmail({
      to: email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
}

// Export singleton instance
export const smtpConfig = new SMTPConfigService();
export type { SMTPConfig, EmailOptions, EmailResponse };
