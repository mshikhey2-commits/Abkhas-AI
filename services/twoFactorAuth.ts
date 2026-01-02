/**
 * Two-Factor Authentication Service
 * Supports OTP via email using SMTP
 */

import { smtpConfig } from './smtpConfig';

interface OTPConfig {
  length?: number;
  expiryMinutes?: number;
  codeType?: 'numeric' | 'alphanumeric';
  language?: 'ar' | 'en';
}

interface StoredOTP {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

class TwoFactorAuthService {
  private otpMap = new Map<string, StoredOTP>();
  private defaultConfig: OTPConfig = {
    length: 6,
    expiryMinutes: 10,
    codeType: 'numeric',
  };

  /**
   * Generate OTP code
   */
  private generateOTP(length: number = 6, type: 'numeric' | 'alphanumeric' = 'numeric'): string {
    if (type === 'numeric') {
      return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
    } else {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    }
  }

  /**
   * Send OTP via email using SMTP
   */
  private async sendOTPEmail(email: string, code: string, language: 'ar' | 'en' = 'en'): Promise<boolean> {
    try {
      // Try to send via SMTP if configured
      if (smtpConfig.isReady()) {
        const result = await smtpConfig.sendOTPEmail(email, code, language);
        if (result.success) {
          console.log(`[2FA] OTP sent to ${email} via SMTP`);
          return true;
        }
      }

      // Fallback: Store in localStorage for testing
      console.log(`[2FA] OTP sent to ${email}: ${code} (localStorage fallback)`);
      localStorage.setItem(`otp_test_${email}`, code);

      return true;
    } catch (error) {
      console.error('[2FA] Failed to send email:', error);
      return false;
    }
  }

  /**
   * Generate and send OTP
   */
  async generateAndSendOTP(
    email: string,
    config?: OTPConfig
  ): Promise<{ success: boolean; message: string; expiresIn?: number }> {
    const finalConfig = { ...this.defaultConfig, ...config };

    try {
      // Generate code
      const code = this.generateOTP(finalConfig.length, finalConfig.codeType);
      const now = Date.now();
      const expiresAt = now + (finalConfig.expiryMinutes! * 60 * 1000);

      // Store OTP
      const otp: StoredOTP = {
        code,
        email,
        createdAt: now,
        expiresAt,
        attempts: 0,
        verified: false,
      };

      this.otpMap.set(email, otp);

      // Send via email (SMTP or fallback)
      const sent = await this.sendOTPEmail(email, code, finalConfig.language);

      if (!sent) {
        this.otpMap.delete(email);
        return {
          success: false,
          message: 'Failed to send OTP. Please try again.',
        };
      }

      // Store in localStorage for persistence
      localStorage.setItem(`otp_${email}`, JSON.stringify(otp));

      return {
        success: true,
        message: `OTP sent to ${email}`,
        expiresIn: finalConfig.expiryMinutes,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error generating OTP',
      };
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(
    email: string,
    code: string
  ): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      let otp = this.otpMap.get(email);

      // If not in memory, try localStorage
      if (!otp) {
        const stored = localStorage.getItem(`otp_${email}`);
        if (stored) {
          otp = JSON.parse(stored);
          this.otpMap.set(email, otp);
        }
      }

      if (!otp) {
        return {
          success: false,
          message: 'OTP not found. Please request a new code.',
        };
      }

      // Check expiry
      if (Date.now() > otp.expiresAt) {
        this.otpMap.delete(email);
        localStorage.removeItem(`otp_${email}`);
        return {
          success: false,
          message: 'OTP has expired. Please request a new code.',
        };
      }

      // Check attempts
      if (otp.attempts >= 3) {
        this.otpMap.delete(email);
        localStorage.removeItem(`otp_${email}`);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new code.',
        };
      }

      // Verify code
      if (otp.code !== code) {
        otp.attempts += 1;
        this.otpMap.set(email, otp);
        localStorage.setItem(`otp_${email}`, JSON.stringify(otp));

        return {
          success: false,
          message: `Invalid OTP. ${3 - otp.attempts} attempts remaining.`,
        };
      }

      // Code verified
      otp.verified = true;
      const token = this.generateVerificationToken(email);

      // Clean up
      this.otpMap.delete(email);
      localStorage.removeItem(`otp_${email}`);

      // Store verification token
      sessionStorage.setItem(`2fa_token_${email}`, token);

      return {
        success: true,
        message: 'OTP verified successfully',
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error verifying OTP',
      };
    }
  }

  /**
   * Generate verification token
   */
  private generateVerificationToken(email: string): string {
    return btoa(`${email}:${Date.now()}:${Math.random()}`);
  }

  /**
   * Check if email is 2FA verified
   */
  is2FAVerified(email: string): boolean {
    const token = sessionStorage.getItem(`2fa_token_${email}`);
    return !!token;
  }

  /**
   * Clear 2FA verification
   */
  clear2FA(email: string): void {
    sessionStorage.removeItem(`2fa_token_${email}`);
    this.otpMap.delete(email);
    localStorage.removeItem(`otp_${email}`);
  }

  /**
   * Get OTP status
   */
  getOTPStatus(email: string): {
    exists: boolean;
    expiresIn?: number;
    attemptsRemaining?: number;
  } {
    const otp = this.otpMap.get(email);

    if (!otp) {
      return { exists: false };
    }

    const expiresIn = Math.ceil((otp.expiresAt - Date.now()) / 1000);

    return {
      exists: true,
      expiresIn: Math.max(0, expiresIn),
      attemptsRemaining: Math.max(0, 3 - otp.attempts),
    };
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string, email: string): Promise<{ success: boolean; backupCodes: string[] }> {
    try {
      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        this.generateOTP(8, 'alphanumeric')
      );

      // Store backup codes securely (should be hashed in production)
      localStorage.setItem(`2fa_backup_${userId}`, JSON.stringify(backupCodes));

      return {
        success: true,
        backupCodes,
      };
    } catch (error) {
      return {
        success: false,
        backupCodes: [],
      };
    }
  }

  /**
   * Disable 2FA for user
   */
  disable2FA(userId: string, email: string): void {
    localStorage.removeItem(`2fa_backup_${userId}`);
    sessionStorage.removeItem(`2fa_token_${email}`);
  }

  /**
   * Cleanup expired OTPs
   */
  cleanup(): void {
    const now = Date.now();
    const expiredEmails: string[] = [];

    this.otpMap.forEach((otp, email) => {
      if (now > otp.expiresAt) {
        expiredEmails.push(email);
      }
    });

    expiredEmails.forEach(email => {
      this.otpMap.delete(email);
      localStorage.removeItem(`otp_${email}`);
    });

    if (expiredEmails.length > 0) {
      console.log(`[2FA] Cleaned up ${expiredEmails.length} expired OTPs`);
    }
  }
}

// Create singleton
export const twoFactorAuth = new TwoFactorAuthService();

// Schedule cleanup every 5 minutes
setInterval(() => twoFactorAuth.cleanup(), 5 * 60 * 1000);

// Export hook
export const use2FA = () => ({
  generateAndSend: (email: string, config?: OTPConfig) =>
    twoFactorAuth.generateAndSendOTP(email, config),
  verify: (email: string, code: string) =>
    twoFactorAuth.verifyOTP(email, code),
  is2FAVerified: (email: string) =>
    twoFactorAuth.is2FAVerified(email),
  clear2FA: (email: string) =>
    twoFactorAuth.clear2FA(email),
  getStatus: (email: string) =>
    twoFactorAuth.getOTPStatus(email),
  enable: (userId: string, email: string) =>
    twoFactorAuth.enable2FA(userId, email),
  disable: (userId: string, email: string) =>
    twoFactorAuth.disable2FA(userId, email),
});
