# SMTP Provider Quick Setup Guide

## Gmail (Free, Easiest)

### 1. Enable 2-Step Verification
```
1. Visit: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the steps
```

### 2. Create App Password
```
1. Visit: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google generates 16-character password
4. Copy without spaces: xxxxxxxxxxxx
```

### 3. Configure .env.local
```env
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@gmail.com
VITE_SMTP_PASSWORD=your-app-password
VITE_SMTP_FROM=your-email@gmail.com
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### 4. Test
```bash
# Start dev server
npm run dev

# In browser console:
import { smtpConfig } from './services/smtpConfig.ts';
smtpConfig.isReady(); // Should be true
```

✅ **Done!** Gmail SMTP is now configured.

---

## Mailgun (Recommended for Production)

### 1. Create Account
```
1. Visit: https://www.mailgun.com
2. Sign up with email
3. Create account
```

### 2. Add Domain
```
1. Go to Domains section
2. Add your domain (e.g., mail.yourcompany.com)
3. Verify domain (DNS records)
```

### 3. Get SMTP Credentials
```
1. Go to Domain Settings
2. Click "SMTP Credentials"
3. Copy Host, Port, User
4. Create new password or use existing
```

### 4. Configure .env.local
```env
VITE_SMTP_HOST=smtp.mailgun.org
VITE_SMTP_PORT=587
VITE_SMTP_USER=postmaster@your-domain.mailgun.org
VITE_SMTP_PASSWORD=your-mailgun-password
VITE_SMTP_FROM=noreply@your-domain.mailgun.org
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### 5. Add Verified Recipient (Sandbox Mode)
```
If using sandbox domain:
1. Go to Recipient Addresses
2. Verify your test email addresses
3. Only verified emails will receive emails
```

### 6. Test
```bash
npm run dev
# Send test email
```

✅ **Done!** Mailgun SMTP is now configured.

---

## SendGrid (Enterprise Grade)

### 1. Create Account
```
1. Visit: https://sendgrid.com
2. Sign up
3. Verify email
```

### 2. Create API Key
```
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it: "ABKHAS AI SMTP"
4. Copy the key (SG.xxx)
```

### 3. Configure .env.local
```env
VITE_SMTP_HOST=smtp.sendgrid.net
VITE_SMTP_PORT=587
VITE_SMTP_USER=apikey
VITE_SMTP_PASSWORD=SG.your-api-key-here
VITE_SMTP_FROM=noreply@abkhas.ai
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### 4. Verify Sender Email
```
1. Go to Settings → Sender Authentication
2. Verify your sender email domain
3. Follow verification steps
```

### 5. Test
```bash
npm run dev
# Send test email
```

✅ **Done!** SendGrid SMTP is now configured.

---

## AWS SES (Scalable)

### 1. Create AWS Account
```
1. Visit: https://console.aws.amazon.com
2. Create account
3. Add payment method
```

### 2. Access SES Console
```
1. Search for "SES" (Simple Email Service)
2. Select your region (e.g., us-east-1)
3. Go to Account Dashboard
```

### 3. Verify Domain
```
1. Click "Verified Identities"
2. Create new identity
3. Select "Domain"
4. Enter your domain
5. Add DNS records
```

### 4. Create SMTP Credentials
```
1. Go to Account Dashboard
2. Click "Create SMTP credentials"
3. Select region
4. Generate credentials
5. Copy User and Password
```

### 5. Configure .env.local
```env
VITE_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-ses-smtp-user
VITE_SMTP_PASSWORD=your-ses-smtp-password
VITE_SMTP_FROM=noreply@your-domain.com
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### 6. Request Production Access
```
1. Go to Account Dashboard
2. Click "Edit your account details"
3. Request production access
4. Wait for approval (usually 1 hour)
```

### 7. Test
```bash
npm run dev
# Send test email
```

✅ **Done!** AWS SES SMTP is now configured.

---

## Brevo (formerly Sendinblue) - Budget Friendly

### 1. Create Account
```
1. Visit: https://www.brevo.com
2. Sign up
3. Verify email
```

### 2. Get SMTP Credentials
```
1. Go to Settings → SMTP
2. Copy Host and Port
3. Create new SMTP user
4. Generate password
```

### 3. Configure .env.local
```env
VITE_SMTP_HOST=smtp-relay.brevo.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your-email@example.com
VITE_SMTP_PASSWORD=your-brevo-password
VITE_SMTP_FROM=noreply@abkhas.ai
VITE_SMTP_FROM_NAME=ABKHAS AI
```

### 4. Verify Sender
```
1. Add sender email
2. Verify via confirmation link
3. Wait for approval
```

### 5. Test
```bash
npm run dev
```

✅ **Done!** Brevo SMTP is now configured.

---

## Comparision Table

| Provider | Cost | Setup Time | Best For | Rate Limit |
|----------|------|------------|----------|-----------|
| **Gmail** | Free | 5 min | Testing, small projects | 300/day |
| **Mailgun** | $0.50-1/1K | 15 min | Production, good value | Unlimited |
| **SendGrid** | Free-$29.95/mo | 15 min | Enterprise, reliability | 100/day (free) |
| **AWS SES** | $0.10 per 1K | 20 min | High volume, scalable | Unlimited |
| **Brevo** | Free-49€/mo | 10 min | Budget, good balance | Unlimited |

---

## Troubleshooting by Provider

### Gmail Issues

**Issue:** "Less secure app access"
- Enable 2-Step Verification first
- Use app-specific password instead

**Issue:** Email bouncing
- Verify you're using app-specific password
- Not account password

### Mailgun Issues

**Issue:** "Unauthorized 401"
- Check username includes full domain
- Format: postmaster@yourdomain.mailgun.org

**Issue:** "Sandbox domain restricts delivery"
- Add verified recipient addresses
- Or upgrade to real domain

### SendGrid Issues

**Issue:** "Invalid API key"
- Use "apikey" as username
- Password should start with "SG."

**Issue:** "Sender not verified"
- Verify sender email in Settings
- Complete verification steps

### AWS SES Issues

**Issue:** "Email rate exceeded"
- Check sending quota
- Request production access to increase limit

**Issue:** "Domain not verified"
- Add DNS records
- Wait for verification

---

## Production Deployment

### Vercel
```
1. Go to Project Settings
2. Environment Variables
3. Add VITE_SMTP_* variables
4. Redeploy
```

### Netlify
```
1. Go to Build & Deploy
2. Environment
3. Add VITE_SMTP_* variables
4. Trigger deploy
```

### Docker
```
# Add to Dockerfile
ENV VITE_SMTP_HOST=smtp.example.com
ENV VITE_SMTP_PORT=587
# ... etc
```

### Traditional Server
```
# Create .env file
VITE_SMTP_HOST=smtp.example.com
VITE_SMTP_PORT=587
# ... etc
```

---

## Best Practices

### Security
- ✅ Never commit `.env.local` to git
- ✅ Use strong passwords (12+ characters)
- ✅ Rotate passwords every 90 days
- ✅ Use app-specific passwords when available
- ✅ Store credentials in secure vault

### Performance
- ✅ Add rate limiting (5-10 attempts)
- ✅ Use email queues for high volume
- ✅ Implement retry logic
- ✅ Monitor bounce rates
- ✅ Track unsubscribes

### Reliability
- ✅ Have backup email provider
- ✅ Monitor delivery rates
- ✅ Set up alerts for failures
- ✅ Keep logs for 30 days
- ✅ Test failover regularly

---

## Monitoring

### Setup Error Tracking
```
1. Get Sentry account: https://sentry.io
2. Add to environment variables
3. Monitor email failures
```

### Check Delivery Status
```
Provider → Account → Email Logs
- Track sent emails
- Monitor bounces
- Review complaints
- Check delivery rates
```

### Set Alerts
```
Alert when:
- Email sending fails
- Bounce rate > 5%
- Complaint rate > 0.1%
- Daily quota exceeded
```

---

## Testing Emails

### Test Accounts by Provider

**Gmail:**
- Use your Gmail account
- Or create test account

**Mailgun:**
- testuser@your-domain.mailgun.org
- (if using sandbox)

**SendGrid:**
- Any verified email address

**AWS SES:**
- Any verified email address

**Brevo:**
- Any verified email address

### Tools

**Mailtrap** (for testing)
```
1. Visit: https://mailtrap.io
2. Create account
3. Get SMTP credentials
4. Configure in .env.local
5. Emails appear in inbox (not really sent)
```

**Mailhog** (local testing)
```
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

---

## FAQ

**Q: Can I use personal Gmail for production?**
A: No. Use business account or dedicated service.

**Q: What if email sending fails?**
A: Check logs, verify credentials, contact provider.

**Q: How to increase sending limit?**
A: Contact provider support, upgrade plan, or switch providers.

**Q: Can I send attachments?**
A: Yes, but not needed for OTP emails. See provider docs.

**Q: Is it secure to send from frontend?**
A: No. Use backend API for production (see backend-example.email.ts).

---

## Next Steps

1. ✅ Choose a provider
2. ✅ Get SMTP credentials
3. ✅ Configure `.env.local`
4. ✅ Test email sending
5. ✅ Verify production setup
6. ✅ Enable 2FA in login flow
7. ✅ Monitor delivery rates

---

**Last Updated:** January 2, 2026
**Version:** 1.0.0

Need help? Check SMTP_CONFIGURATION.md for detailed guide.
