# SMTP Setup Checklist - قائمة تحضير SMTP

## English - Setup Checklist

### ✅ Step 1: Choose Email Provider

- [ ] **Gmail** (Free, easy setup)
- [ ] **Mailgun** (Developer-friendly, good for production)
- [ ] **SendGrid** (Enterprise, excellent deliverability)
- [ ] **AWS SES** (Scalable, low cost)
- [ ] **Other:** ____________

### ✅ Step 2: Get SMTP Credentials

Provider chosen: _________________

Credentials obtained:
- [ ] SMTP Host: `____________________`
- [ ] SMTP Port: `____________________` (usually 587 or 465)
- [ ] SMTP User: `____________________`
- [ ] SMTP Password: `____________________`
- [ ] Sender Email: `____________________`
- [ ] Sender Name: `____________________`

### ✅ Step 3: Create Environment File

- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```
- [ ] Fill all SMTP variables in `.env.local`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Add to `.gitignore` if missing:
  ```
  .env.local
  .env.*.local
  ```

### ✅ Step 4: Test SMTP Configuration

**Option A: Browser Console Test**
```javascript
// Open DevTools (F12) → Console and run:
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.isReady(); // Should return true
smtpConfig.getConfig(); // Check configuration
```

**Option B: Test 2FA Login**
1. Go to login page
2. Enter test email address
3. Should receive OTP email (or see in console)

**Option C: Manual Test**
```javascript
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.sendOTPEmail('test@example.com', '123456', 'en');
```

Results:
- [ ] SMTP shows as configured
- [ ] Email received successfully
- [ ] Email formatting looks correct
- [ ] OTP code is visible

### ✅ Step 5: Verify Email Content

Check received email:
- [ ] Sender name is correct (SMTP_FROM_NAME)
- [ ] Sender email is correct (SMTP_FROM)
- [ ] Subject line is clear
- [ ] OTP code is visible and formatted well
- [ ] Language is correct (AR/EN)
- [ ] Links are working (if any)
- [ ] No HTML rendering issues
- [ ] Mobile view looks good

### ✅ Step 6: Test Rate Limiting

Simulate brute force attempt:
1. Try login 5+ times
2. Verify account is locked
3. Check error message is user-friendly
4. Verify lockout timer (15 minutes)

Results:
- [ ] 5th attempt blocked
- [ ] Account locked message displayed
- [ ] Timer countdown working
- [ ] After 15 min, can try again

### ✅ Step 7: Setup Production Environment

For hosting platforms (Vercel, Netlify, Heroku, etc.):

**Vercel:**
- [ ] Go to Project Settings → Environment Variables
- [ ] Add all SMTP variables
- [ ] Check for both Production and Development

**Netlify:**
- [ ] Go to Build & Deploy → Environment
- [ ] Add all SMTP variables
- [ ] Deploy new version

**Other Platform:**
- [ ] Add environment variables: VITE_SMTP_*
- [ ] Redeploy application

### ✅ Step 8: Test in Production

- [ ] Login and request OTP in production
- [ ] Check email delivery
- [ ] Monitor error logs (if using Sentry)
- [ ] Verify no sensitive data in logs

### ✅ Step 9: Security Review

**Before going live:**
- [ ] SMTP password is strong (12+ characters)
- [ ] Password not shared with team
- [ ] App-specific password used (if available)
- [ ] Rate limiting is enabled
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS is enabled on domain
- [ ] CORS is properly configured
- [ ] Backend validation is in place

### ✅ Step 10: Monitoring & Maintenance

**Setup monitoring:**
- [ ] Email delivery tracking enabled
- [ ] Error alerts configured
- [ ] Monthly quota review
- [ ] Bounce/complaint handling
- [ ] Regular logs review

**Scheduled tasks:**
- [ ] Change SMTP password every 90 days
- [ ] Review email sending patterns weekly
- [ ] Update email templates if needed
- [ ] Check provider rate limits

---

## دليل التحضير العربي

### ✅ الخطوة 1: اختيار مزود الخدمة

- [ ] **Gmail** (مجاني، سهل التكوين)
- [ ] **Mailgun** (موثوق، للإنتاج)
- [ ] **SendGrid** (قوي، جودة عالية)
- [ ] **AWS SES** (قابل للتوسع)

### ✅ الخطوة 2: الحصول على بيانات الاعتماد

الخادم المختار: _________________

- [ ] عنوان الخادم (Host)
- [ ] المنفذ (Port)
- [ ] اسم المستخدم (User)
- [ ] كلمة المرور (Password)
- [ ] البريد المرسل من (From)
- [ ] اسم المرسل (Name)

### ✅ الخطوة 3: إنشاء ملف المتغيرات

- [ ] انسخ `.env.example` إلى `.env.local`
- [ ] أضف جميع بيانات SMTP
- [ ] تأكد من وجود `.env.local` في `.gitignore`

### ✅ الخطوة 4: اختبار الاتصال

**اختبار عبر الكونسول:**
```javascript
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.isReady(); // يجب أن يرجع true
```

**اختبار عبر 2FA:**
1. اذهب لصفحة تسجيل الدخول
2. أدخل بريدك الاختباري
3. يجب أن تستقبل رمز OTP

### ✅ الخطوة 5: التحقق من البريد

- [ ] اسم المرسل صحيح
- [ ] البريد المرسل من صحيح
- [ ] الموضوع واضح
- [ ] الرمز مرئي
- [ ] اللغة صحيحة
- [ ] التنسيق جميل
- [ ] يظهر بشكل جيد على الهاتف

### ✅ الخطوة 6: اختبار الحماية

- [ ] محاولة 5 محاولات دخول
- [ ] التحقق من القفل
- [ ] التحقق من مقياس الانتظار (15 دقيقة)

### ✅ الخطوة 7: إعدادات الإنتاج

- [ ] أضف متغيرات SMTP للمنصة
- [ ] أعد نشر التطبيق
- [ ] اختبر في الإنتاج

### ✅ الخطوة 8: الأمان

- [ ] كلمة المرور قوية
- [ ] كلمة المرور آمنة
- [ ] لا توجد معلومات حساسة في السجلات
- [ ] HTTPS مفعل
- [ ] التحقق من الصيغة

---

## Common Issues & Solutions

### Issue: "Configuration Incomplete"

**Check:**
```bash
# Verify .env.local exists
ls -la .env.local

# Verify all variables are set
grep VITE_SMTP .env.local
```

**Solution:**
- Copy `.env.example` → `.env.local`
- Fill all SMTP variables
- Restart dev server: `npm run dev`

### Issue: "SMTP Connection Failed"

**Check:**
- Correct host and port
- Internet connection
- Firewall not blocking port

**Solution:**
```bash
# Test SMTP connection
# Using telnet (if available)
telnet smtp.gmail.com 587

# Or verify credentials are correct
```

### Issue: "Authentication Failed"

**Check:**
- Username and password are correct
- For Gmail: using app-specific password
- Not using account password

**Solution:**
- Regenerate app password
- Use correct credentials
- Test with simple account first

### Issue: "Email Not Received"

**Check:**
- Spam folder
- Email verified with provider
- Sender email is trusted
- Rate limits not exceeded

**Solution:**
- Add to address book
- Check provider logs
- Verify sender domain

---

## Command Reference

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Check SMTP in console
# Open DevTools and run:
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.isReady();
```

---

## File Reference

| File | Purpose |
|------|---------|
| `.env.local` | SMTP credentials (local) |
| `.env.example` | Template with all variables |
| `services/smtpConfig.ts` | SMTP configuration service |
| `services/twoFactorAuth.ts` | OTP generation/verification |
| `pages/TwoFactor.tsx` | 2FA UI component |
| `SMTP_CONFIGURATION.md` | Detailed setup guide |
| `backend-example.email.ts` | Backend email implementation |

---

## Support Resources

**Official Documentation:**
- Gmail: https://support.google.com/mail/answer/185833
- Mailgun: https://documentation.mailgun.com/en/latest/user_manual.html
- SendGrid: https://docs.sendgrid.com/for-developers/sending-email/smtp-service
- AWS SES: https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html

**Troubleshooting:**
- Check browser console for errors
- Review provider's email logs
- Monitor application error tracking (Sentry)
- Check rate limiting status

---

## Final Verification

Before marking as complete, verify:

- [ ] SMTP credentials configured
- [ ] `.env.local` created and secured
- [ ] Test email received successfully
- [ ] 2FA flow works end-to-end
- [ ] Rate limiting prevents brute force
- [ ] Production environment configured
- [ ] Error tracking is active
- [ ] Security measures in place
- [ ] Documentation reviewed
- [ ] Team is trained on setup

---

**Setup Date:** _______________
**Verified By:** _______________
**Notes:** _______________

---

**Status: Ready for 2FA Testing** ✅

Next step: Implement Two-Factor Authentication in login flow
