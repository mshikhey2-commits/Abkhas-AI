# SMTP Configuration Guide - دليل تكوين SMTP

## English Guide

### Overview
ABKHAS AI uses SMTP to send One-Time Passwords (OTP) for Two-Factor Authentication. This guide explains how to configure email sending.

### Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your SMTP credentials** (see provider-specific guides below)

3. **Restart development server:**
   ```bash
   npm run dev
   ```

4. **Test OTP sending** by attempting 2FA login

---

## Gmail SMTP Setup

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Verify your phone number

### Step 2: Create App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character password

### Step 3: Configure .env.local
```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASSWORD=xxxx xxxx xxxx xxxx
VITE_SMTP_FROM=your-email@gmail.com
VITE_SMTP_FROM_NAME=ABKHAS AI
```

**Security Note:** Never commit `.env.local` to version control!

---

## Mailgun Setup

### Step 1: Create Account
1. Sign up at [Mailgun.com](https://www.mailgun.com)
2. Verify your domain

### Step 2: Get SMTP Credentials
1. Go to Sending → SMTP
2. Copy SMTP hostname and port

### Step 3: Configure .env.local
```env
VITE_SMTP_HOST=smtp.mailgun.org
VITE_SMTP_PORT=587
VITE_SMTP_USER=postmaster@your-domain.mailgun.org
VITE_SMTP_PASSWORD=your-mailgun-password
VITE_SMTP_FROM=noreply@your-domain.mailgun.org
VITE_SMTP_FROM_NAME=ABKHAS AI
```

---

## SendGrid Setup

### Step 1: Create Account
1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Verify sender email

### Step 2: Generate API Key
1. Go to Settings → API Keys
2. Create a new API key

### Step 3: Configure .env.local
```env
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
VITE_SMTP_USER=apikey
VITE_SMTP_PASSWORD=SG.your-api-key
VITE_SMTP_FROM=noreply@abkhas.ai
VITE_SMTP_FROM_NAME=ABKHAS AI
```

---

## AWS SES Setup

### Step 1: Create AWS Account
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to SES (Simple Email Service)
3. Verify your domain

### Step 2: Generate SMTP Credentials
1. Go to Account Dashboard
2. Create SMTP user credentials

### Step 3: Configure .env.local
```env
VITE_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-ses-smtp-user
VITE_SMTP_PASSWORD=your-ses-smtp-password
VITE_SMTP_FROM=noreply@your-domain.com
VITE_SMTP_FROM_NAME=ABKHAS AI
```

---

## Backend Implementation (Recommended for Production)

For production, it's safer to send emails via backend API instead of client-side. Create a backend endpoint:

```typescript
// Backend (Node.js/Express example)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;
  
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
    
    res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then configure the backend endpoint in frontend:

```typescript
// Frontend
VITE_API_ENDPOINT=https://api.yourdomain.com
```

---

## Testing SMTP Configuration

### Method 1: Browser Console
```javascript
// Open browser console and run:
import { smtpConfig } from './services/smtpConfig.ts';

// Check if SMTP is configured
smtpConfig.isReady(); // Should return true

// Check configuration (without password)
smtpConfig.getConfig();
```

### Method 2: 2FA Test
1. Go to login page
2. Enter test email
3. Check console for OTP (if localStorage fallback is active)
4. Check email inbox for real SMTP

### Method 3: Manual Email Test
```typescript
import { smtpConfig } from './services/smtpConfig.ts';

smtpConfig.sendOTPEmail('test@example.com', '123456', 'en');
```

---

## Troubleshooting

### Issue: "SMTP not configured" message

**Solution:** 
- Check that `.env.local` exists and is readable
- Verify all environment variables are set
- Environment variables must start with `VITE_`
- Restart development server after changing `.env.local`

```bash
npm run dev
```

### Issue: Email not received

**Solution:**
- Check spam folder
- Verify sender email is verified with provider
- Check SMTP credentials are correct
- Look for error messages in browser console

### Issue: "Authentication failed"

**Solution:**
- Verify SMTP_USER and SMTP_PASSWORD are correct
- For Gmail: Use app-specific password, not account password
- Verify SMTP_PORT matches provider (587 for TLS, 465 for SSL)
- Check if 2-factor authentication is enabled

### Issue: "Connection refused"

**Solution:**
- Verify SMTP_HOST is correct
- Check internet connection
- Verify firewall doesn't block SMTP port
- Try port 587 (TLS) if port 465 fails

---

## Security Best Practices

1. **Never commit `.env.local`:**
   ```bash
   # .gitignore should contain:
   .env.local
   .env.*.local
   ```

2. **Use environment-specific credentials:**
   - Development: Use test email account
   - Production: Use dedicated service account

3. **Rotate passwords regularly:**
   - Change SMTP passwords every 90 days
   - Use app-specific passwords when available

4. **Limit sending rate:**
   - Set reasonable rate limits
   - Monitor quota usage

5. **Use TLS encryption:**
   - Always use port 587 (TLS) or 465 (SSL)
   - Never send credentials over plain text

6. **Audit email logs:**
   - Keep records of sent emails
   - Monitor for suspicious patterns

---

## Production Checklist

Before deploying to production:

- [ ] SMTP credentials are set in production environment
- [ ] Sender email is verified with provider
- [ ] Rate limits are configured
- [ ] Error tracking is enabled (Sentry)
- [ ] Email templates are reviewed
- [ ] Backup email provider is configured
- [ ] Email delivery monitoring is set up
- [ ] Bounce/complaint handling is implemented

---

## Migration from Test to Production

1. **Keep test credentials:**
   ```env
   # .env.local (development)
   VITE_SMTP_HOST=smtp.gmail.com
   ```

2. **Add production credentials:**
   - Set in hosting platform (Vercel, Netlify, etc.)
   - Or use different `.env.production.local` file

3. **Test in staging:**
   - Verify emails work before production
   - Check email formatting

4. **Monitor in production:**
   - Track delivery rates
   - Monitor error logs
   - Alert on failures

---

## دليل التكوين العربي

### نظرة عامة
يستخدم ABKHAS AI بروتوكول SMTP لإرسال رموز المصادقة الثنائية (OTP). هذا الدليل يشرح كيفية تكوين إرسال البريد الإلكتروني.

### خطوات سريعة

1. **انسخ ملف المتغيرات:**
   ```bash
   cp .env.example .env.local
   ```

2. **أضف بيانات اعتماد SMTP الخاصة بك** (راجع الأدلة أدناه)

3. **أعد تشغيل خادم التطوير:**
   ```bash
   npm run dev
   ```

4. **اختبر إرسال OTP** من خلال محاولة تسجيل الدخول بـ 2FA

---

### تكوين Gmail

1. **فعّل التحقق من خطوتين** في حسابك على Google
2. **أنشئ كلمة مرور خاصة بالتطبيق**
3. **أضف المتغيرات:**

```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=بريدك@gmail.com
VITE_SMTP_PASSWORD=كلمة المرور
```

---

### أفضل الممارسات الأمنية

1. **لا تنشر `.env.local`:**
   - أضفه إلى `.gitignore`

2. **استخدم بيانات اعتماد منفصلة:**
   - تطوير: حساب اختبار
   - إنتاج: حساب خاص

3. **استخدم التشفير:**
   - استخدم المنفذ 587 (TLS) أو 465 (SSL)

4. **تابع الأخطاء:**
   - راقب سجلات الإرسال
   - تنبيهات على الفشل

---

## Support

For issues or questions:
- Check browser console for error messages
- Review email provider logs
- Verify environment variables are set
- Test with a simple email provider like Gmail first

---

**Last Updated:** January 2, 2026
**Version:** 1.0.0
