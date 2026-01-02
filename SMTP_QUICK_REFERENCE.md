# SMTP Quick Reference Card - بطاقة مرجعية SMTP

## 🚀 Quick Start (5 Minutes) - البدء السريع

### 1. Copy Environment File
```bash
cp .env.example .env.local
```

### 2. Choose a Provider
- **Gmail** (Free) → https://gmail.com
- **Mailgun** ($0.50/1K) → https://mailgun.com
- **SendGrid** ($29.95/mo) → https://sendgrid.com
- **AWS SES** ($0.10/1K) → https://aws.amazon.com/ses

### 3. Get SMTP Credentials
Follow steps in [SMTP_PROVIDERS_GUIDE.md](SMTP_PROVIDERS_GUIDE.md)

### 4. Edit `.env.local`
```env
VITE_SMTP_HOST=smtp.gmail.com          # From provider
VITE_SMTP_PORT=587                     # 587 or 465
VITE_SMTP_USER=your-email@gmail.com    # From provider
VITE_SMTP_PASSWORD=your-app-password   # From provider
VITE_SMTP_FROM=noreply@abkhas.ai       # Your domain
VITE_SMTP_FROM_NAME=ABKHAS AI          # Your app name
```

### 5. Test
```bash
npm run dev
# Then try 2FA login, should receive email
```

---

## 📝 Common Configurations - التكوينات الشائعة

### Gmail (Recommended for Testing)
```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASSWORD=xxxx xxxx xxxx xxxx
VITE_SMTP_FROM=your-email@gmail.com
VITE_SMTP_FROM_NAME=ABKHAS AI
```
**Note:** Must use app-specific password, not account password

### Mailgun
```env
VITE_SMTP_HOST=smtp.mailgun.org
VITE_SMTP_PORT=587
VITE_SMTP_USER=postmaster@your-domain.mailgun.org
VITE_SMTP_PASSWORD=your-mailgun-password
VITE_SMTP_FROM=noreply@your-domain.mailgun.org
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### SendGrid
```env
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
VITE_SMTP_USER=apikey
VITE_SMTP_PASSWORD=SG.your-api-key
VITE_SMTP_FROM=noreply@abkhas.ai
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### AWS SES
```env
VITE_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-ses-smtp-user
VITE_SMTP_PASSWORD=your-ses-smtp-password
VITE_SMTP_FROM=noreply@your-domain.com
VITE_SMTP_FROM_NAME=ABKHAS AI
```

---

## 🧪 Testing - الاختبار

### Browser Console
```javascript
// Check if SMTP is configured
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.isReady(); // Should return true

// Get configuration (without password)
smtpConfig.getConfig();

// Test sending OTP
smtpConfig.sendOTPEmail('test@example.com', '123456', 'en');
```

### UI Testing
1. Go to login page
2. Enter test email address
3. Request OTP
4. Should receive email in inbox
5. Check email formatting

### Provider Testing
- Gmail: Check sent mail folder
- Mailgun: Dashboard → Logs
- SendGrid: Activity → Email
- AWS SES: Sending Statistics

---

## 🐛 Troubleshooting - حل المشاكل

| Issue | Solution |
|-------|----------|
| "SMTP not configured" | Check `.env.local` exists, restart dev server |
| "Email not received" | Check spam folder, verify sender email |
| "Authentication failed" | Verify username/password, check provider docs |
| "Connection refused" | Verify host and port are correct |
| "Rate limit exceeded" | Increase rate limit or use different provider |

### Check Configuration
```bash
# Verify .env.local exists
ls -la .env.local

# Check SMTP variables are set
grep VITE_SMTP .env.local

# Restart dev server
npm run dev
```

---

## 📧 Email Sending - إرسال البريد

### Send OTP Email
```typescript
import { smtpConfig } from './services/smtpConfig';

const result = await smtpConfig.sendOTPEmail(
  'user@example.com',
  '123456',
  'en' // or 'ar' for Arabic
);

if (result.success) {
  console.log('OTP sent:', result.messageId);
} else {
  console.error('Failed:', result.error);
}
```

### Send Custom Email
```typescript
const result = await smtpConfig.sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to ABKHAS AI',
  text: 'Plain text version',
  html: '<h1>HTML version</h1>'
});
```

### Send Welcome Email
```typescript
const result = await smtpConfig.sendWelcomeEmail(
  'user@example.com',
  'User Name',
  'en' // Language
);
```

### Send Password Reset Email
```typescript
const result = await smtpConfig.sendPasswordResetEmail(
  'user@example.com',
  'https://yoursite.com/reset?token=xxx',
  'en' // Language
);
```

---

## 🔐 Security Checklist - قائمة الأمان

Before Deployment:
- [ ] Never commit `.env.local` to git
- [ ] Add `.env.local` to `.gitignore`
- [ ] Use app-specific password (Gmail)
- [ ] Verify credentials are correct
- [ ] Test error handling
- [ ] Enable rate limiting
- [ ] Setup error tracking (Sentry)

During Production:
- [ ] Monitor email delivery rates
- [ ] Check bounce/spam rates
- [ ] Review error logs weekly
- [ ] Test failover scenarios
- [ ] Keep backup provider

---

## 🚀 Production Deployment - النشر في الإنتاج

### Vercel
```bash
# Go to Project Settings → Environment Variables
# Add VITE_SMTP_* variables
# Redeploy
```

### Netlify
```bash
# Go to Build & Deploy → Environment
# Add VITE_SMTP_* variables
# Trigger deploy
```

### Custom Server
```bash
# Create .env file with production credentials
# Don't add to version control
# Deploy application
```

### Using Backend API (Recommended)
```bash
# Update .env
VITE_API_ENDPOINT=https://api.yourdomain.com

# Implement backend endpoint
# Use backend-example.email.ts as reference
```

---

## 📊 Status Checking - فحص الحالة

### SMTP Service Status
```typescript
import { smtpConfig } from './services/smtpConfig';

if (smtpConfig.isReady()) {
  console.log('✅ SMTP is ready');
  console.log('Configuration:', smtpConfig.getConfig());
} else {
  console.warn('⚠️  SMTP not configured');
}
```

### Check 2FA Status
```typescript
import { twoFactorAuth } from './services/twoFactorAuth';

// Check if OTP exists for email
const status = twoFactorAuth.getOTPStatus('user@example.com');
console.log('OTP Status:', status);
// {
//   exists: true,
//   expiresIn: 540,        // seconds
//   attemptsRemaining: 2   // out of 3
// }
```

---

## 📚 Documentation Files - ملفات التوثيق

| File | Purpose |
|------|---------|
| [SMTP_CONFIGURATION.md](SMTP_CONFIGURATION.md) | Complete setup guide |
| [SMTP_SETUP_CHECKLIST.md](SMTP_SETUP_CHECKLIST.md) | Step-by-step checklist |
| [SMTP_PROVIDERS_GUIDE.md](SMTP_PROVIDERS_GUIDE.md) | Provider-specific guides |
| [SMTP_SETUP_SUMMARY.md](SMTP_SETUP_SUMMARY.md) | Complete summary |
| [.env.example](.env.example) | Environment template |
| [backend-example.email.ts](backend-example.email.ts) | Backend implementation |

---

## 🔗 Integration Points - نقاط التكامل

### 2FA Login Flow
```
Login Page
  ↓
Enter Email
  ↓
twoFactorAuth.generateAndSendOTP()
  ↓
smtpConfig.sendOTPEmail()  ← Sends via SMTP
  ↓
TwoFactor.tsx (UI)
  ↓
Enter OTP Code
  ↓
twoFactorAuth.verifyOTP()
  ↓
Success / Error
```

---

## 💡 Pro Tips - نصائح احترافية

1. **Testing First**
   - Start with Gmail (free, easy)
   - Test full flow before production
   - Use test email accounts

2. **Security**
   - Rotate passwords every 90 days
   - Use app-specific passwords
   - Never commit credentials
   - Monitor delivery rates

3. **Performance**
   - Cache OTP verification
   - Implement retry logic
   - Monitor quota usage
   - Set up alerts

4. **Reliability**
   - Have backup provider
   - Implement fallback logic
   - Track bounce rates
   - Monitor uptime

---

## 🎯 Next Steps - الخطوات التالية

**Today:**
```bash
cp .env.example .env.local
# Add SMTP credentials
npm run dev
# Test 2FA
```

**This Week:**
- [ ] Test with different email providers
- [ ] Review email templates
- [ ] Setup error tracking (Sentry)
- [ ] Document setup for team

**Before Production:**
- [ ] Implement backend email API
- [ ] Setup monitoring
- [ ] Test failover
- [ ] Load test email sending

---

## 📞 Quick Links - روابط سريعة

**Email Providers:**
- [Gmail Setup](https://support.google.com/mail/answer/185833)
- [Mailgun Docs](https://documentation.mailgun.com)
- [SendGrid Docs](https://docs.sendgrid.com)
- [AWS SES Docs](https://docs.aws.amazon.com/ses)

**This Project:**
- [SMTP Service Code](services/smtpConfig.ts)
- [2FA Service Code](services/twoFactorAuth.ts)
- [Full Documentation](SMTP_CONFIGURATION.md)

---

## 📋 Command Reference - مرجع الأوامر

```bash
# Copy environment template
cp .env.example .env.local

# Start dev server
npm run dev

# Build for production
npm run build

# Check build size
du -sh dist/

# Clear cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

---

## 🆘 When Something Goes Wrong - في حالة المشاكل

**Step 1: Check Configuration**
```bash
ls -la .env.local
grep VITE_SMTP .env.local
```

**Step 2: Check Logs**
```javascript
// Browser console
console.log(localStorage);
// Check for error messages
```

**Step 3: Test SMTP**
```javascript
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.isReady();
```

**Step 4: Check Provider**
- Gmail: Check "Less secure apps"
- Mailgun: Check verified domains
- SendGrid: Check API key
- AWS SES: Check domain verification

**Step 5: Restart**
```bash
npm run dev
```

---

**Last Updated:** January 2, 2026
**Version:** 1.0.0
**Status:** ✅ Ready for Use

---

## شكراً لاستخدام ABKHAS AI! 🚀

نظام البريد الإلكتروني جاهز الآن. استمتع بـ 2FA الآمن!
