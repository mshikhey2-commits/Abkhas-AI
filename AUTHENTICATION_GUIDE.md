# 🔐 Authentication System Documentation

## Overview

The ABKHAS AI app now includes a complete authentication system with support for:
- **Email & Password** registration and login
- **Saudi Phone Number & Password** registration and login
- Local data storage using browser localStorage
- Password strength validation
- Secure password hashing

---

## Features

### 1. **Registration (Signup)**
Users can create an account using either:

#### Email Registration
- Email validation (RFC compliant)
- Password strength indicator (weak/fair/good/strong)
- Password confirmation matching
- Terms & conditions acceptance required

#### Phone Registration (Saudi Numbers)
- Saudi phone number validation
- Supports multiple formats:
  - `05XXXXXXXX` (local format)
  - `0501234567` (with leading zero)
  - `966501234567` (international format)
- Automatic normalization to standard format
- Same security and validation as email registration

### 2. **Login**
Users can log in with the same credentials they registered with

#### Email Login
- Standard email/password authentication
- Email case-insensitive matching

#### Phone Login
- Phone number validation and normalization
- Supports all accepted phone formats
- Automatic format normalization before comparison

### 3. **Data Storage**
All user data is stored locally with:
- User ID (unique identifier)
- Email or Phone number
- Password hash (SHA-256 with salt)
- Registration timestamp
- Last login timestamp
- User profile data (name, avatar, preferences)

### 4. **Security**
- **SHA-256 hashing** with salt for password storage
- **No plain-text passwords** ever stored
- **localStorage encryption** ready
- Password strength validation
- No sensitive data in console logs

---

## File Structure

```
services/
  └─ authService.ts          # Core authentication logic

pages/
  ├─ Login.tsx              # Login page (email & phone)
  └─ Signup.tsx             # Signup page (email & phone)

components/
  └─ Header.tsx             # Updated with auth buttons

App.tsx                       # Updated with auth routing
```

---

## Authentication Service API

### User Interface
```typescript
interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  passwordHash: string;
  createdAt: number;
  lastLogin: number;
  profileData?: {
    name?: string;
    avatar?: string;
    preferences?: Record<string, any>;
  };
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}
```

### Core Functions

#### Registration
```typescript
// Register with email
registerWithEmail(email: string, password: string, name?: string): Promise<AuthResponse>

// Register with Saudi phone
registerWithPhone(phone: string, password: string, name?: string): Promise<AuthResponse>
```

#### Login
```typescript
// Login with email
loginWithEmail(email: string, password: string): Promise<AuthResponse>

// Login with Saudi phone
loginWithPhone(phone: string, password: string): Promise<AuthResponse>
```

#### User Management
```typescript
// Get currently logged-in user
getCurrentUser(): User | null

// Check if user is authenticated
isAuthenticated(): boolean

// Logout
logout(): void

// Update user profile
updateUserProfile(updates: Partial<User['profileData']>): AuthResponse

// Delete account
deleteAccount(password: string): Promise<AuthResponse>
```

#### Utilities
```typescript
// Validate Saudi phone number
validateSaudiPhone(phone: string): boolean

// Normalize Saudi phone to standard format
normalizeSaudiPhone(phone: string): string

// Validate email
validateEmail(email: string): boolean
```

---

## Usage Examples

### Registration Flow

#### Email Registration
```typescript
import { registerWithEmail } from '../services/authService';

const response = await registerWithEmail(
  'user@example.com',
  'SecurePassword123!',
  'John Doe'
);

if (response.success) {
  console.log('Registered:', response.user);
  navigate('home'); // User is automatically logged in
}
```

#### Phone Registration
```typescript
import { registerWithPhone } from '../services/authService';

const response = await registerWithPhone(
  '0501234567', // or '966501234567'
  'SecurePassword123!',
  'محمد علي'
);

if (response.success) {
  console.log('Registered:', response.user);
}
```

### Login Flow

#### Email Login
```typescript
import { loginWithEmail } from '../services/authService';

const response = await loginWithEmail(
  'user@example.com',
  'SecurePassword123!'
);

if (response.success) {
  console.log('Logged in:', response.user);
}
```

#### Phone Login
```typescript
import { loginWithPhone } from '../services/authService';

const response = await loginWithPhone(
  '05XXXXXXXX',
  'SecurePassword123!'
);

if (response.success) {
  console.log('Logged in:', response.user);
}
```

### Check Authentication Status
```typescript
import { getCurrentUser, isAuthenticated } from '../services/authService';

if (isAuthenticated()) {
  const user = getCurrentUser();
  console.log('Welcome back, ' + (user?.profileData?.name || user?.email || user?.phoneNumber));
}
```

### Logout
```typescript
import { logout } from '../services/authService';

const handleLogout = () => {
  logout();
  navigate('home');
};
```

---

## UI Components

### Login Page (`pages/Login.tsx`)
- **Toggle between Email and Phone** login methods
- **Email login** with email validation
- **Phone login** with Saudi phone number support
- **Password visibility toggle**
- **Error and success messages**
- **Links to signup page**
- **Responsive design** with dark mode support
- **Arabic and English** language support

### Signup Page (`pages/Signup.tsx`)
- **Toggle between Email and Phone** signup methods
- **Full name field**
- **Email or Phone** input with validation
- **Password strength indicator**
  - Visual progress bar
  - Strength level (weak/fair/good/strong)
  - Requirements checklist
- **Password confirmation** with matching validation
- **Terms & conditions** acceptance
- **Error and success messages**
- **Links to login page**
- **Responsive design** with dark mode support
- **Arabic and English** language support

### Header Updates
- **Login button** for non-authenticated users
- **Sign Up button** for non-authenticated users
- **User profile button** for authenticated users
- **Logout button** for authenticated users
- User info in tooltip (email or phone number)

---

## Password Strength Requirements

### Validation Rules
- ✓ Minimum 8 characters required
- ✓ Mix of uppercase and lowercase letters
- ✓ At least one number
- ✓ At least one special character (optional but recommended)

### Strength Levels
| Level | Score | Color | Requirements |
|-------|-------|-------|--------------|
| Weak | 1-2 | Red | Few requirements met |
| Fair | 2 | Orange | Some requirements met |
| Good | 3 | Blue | Most requirements met |
| Strong | 4-5 | Green | All requirements met |

---

## Saudi Phone Number Support

### Accepted Formats
- `05XXXXXXXX` - Local format (10 digits)
- `0501234567` - With leading zero
- `966501234567` - International format

### Normalization
All phone numbers are automatically normalized to the international format:
- `05XXXXXXXX` → `966XXXXXXXX`
- `966XXXXXXXX` → `966XXXXXXXX` (no change)

### Examples
```typescript
// All these formats refer to the same person:
validateSaudiPhone('0501234567'); // ✓ true
validateSaudiPhone('501234567');  // ✓ true
validateSaudiPhone('966501234567'); // ✓ true
validateSaudiPhone('01234567');   // ✗ false
```

---

## Data Storage

### LocalStorage Keys
```typescript
'abkhas_users'         // Array of all registered users
'abkhas_current_user'  // Currently logged-in user
```

### Storage Structure
```json
{
  "id": "user_1234567890_abcdef123",
  "email": "user@example.com",
  "phoneNumber": "966501234567",
  "passwordHash": "SHA256_HASH_HERE",
  "createdAt": 1703953200000,
  "lastLogin": 1703953200000,
  "profileData": {
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "preferences": {
      "theme": "dark",
      "language": "ar"
    }
  }
}
```

---

## Navigation

### Route Pages Added
```typescript
case 'login':   // /login
  return <Login lang={lang} />;
  
case 'signup':  // /signup
  return <Signup lang={lang} />;
```

### Usage in Navigation
```typescript
const { navigate } = useAppContext();

// Go to login
navigate('login');

// Go to signup
navigate('signup');

// Go to home (after successful auth)
navigate('home');
```

---

## Language Support

Both authentication pages support:
- **Arabic (عربي)** - Full RTL support
- **English** - Full LTR support

Language is controlled by the app's global `lang` state in `AppContext`.

---

## Error Handling

### Registration Errors
| Error | Code | Description |
|-------|------|-------------|
| Invalid email | `INVALID_EMAIL` | Email format is incorrect |
| Email exists | `EMAIL_EXISTS` | Email already registered |
| Invalid phone | `INVALID_PHONE` | Phone format is incorrect |
| Phone exists | `PHONE_EXISTS` | Phone already registered |
| Weak password | `WEAK_PASSWORD` | Password < 8 characters |

### Login Errors
| Error | Code | Description |
|-------|------|-------------|
| User not found | `USER_NOT_FOUND` | No account with this email/phone |
| Invalid password | `INVALID_PASSWORD` | Password is incorrect |
| Invalid email | `INVALID_EMAIL` | Email format is incorrect |
| Invalid phone | `INVALID_PHONE` | Phone format is incorrect |

---

## Security Considerations

### Current Implementation
✅ SHA-256 hashing with salt
✅ No plain-text passwords
✅ No sensitive data in console
✅ localStorage protection ready
✅ Input validation

### Production Recommendations
⚠️ Move authentication to backend server
⚠️ Use proper OAuth providers (Google, Apple, etc.)
⚠️ Implement refresh tokens
⚠️ Add email verification
⚠️ Add phone OTP verification
⚠️ Use HTTPS only
⚠️ Implement rate limiting
⚠️ Add 2FA support

---

## Testing Checklist

### Email Registration
- [ ] Can register with valid email
- [ ] Email validation rejects invalid emails
- [ ] Password strength indicator works
- [ ] Passwords must match
- [ ] Cannot register with existing email
- [ ] Terms & conditions required

### Phone Registration
- [ ] Can register with Saudi phone (05X format)
- [ ] Can register with Saudi phone (966X format)
- [ ] Phone validation rejects invalid numbers
- [ ] Cannot register with existing phone
- [ ] All validation requirements work

### Email Login
- [ ] Can login with registered email
- [ ] Rejects wrong password
- [ ] Rejects non-existent email
- [ ] Email case-insensitive

### Phone Login
- [ ] Can login with registered phone
- [ ] Can login with different phone formats
- [ ] Rejects wrong password
- [ ] Rejects non-existent phone

### User Management
- [ ] Current user is set after successful auth
- [ ] Logout clears current user
- [ ] Profile button shows user info
- [ ] Cannot access protected pages (future)
- [ ] Data persists on page refresh

---

## Future Enhancements

1. **Email Verification**
   - Send verification email on signup
   - Require email confirmation before account activation

2. **Phone OTP**
   - Send OTP to phone on signup
   - Verify before account creation

3. **Two-Factor Authentication**
   - Optional 2FA with authenticator apps
   - Backup codes for recovery

4. **Social Login**
   - Google Sign-in
   - Apple Sign-in
   - Facebook Login

5. **Password Reset**
   - Forgot password flow
   - Reset link via email
   - OTP reset via phone

6. **Account Recovery**
   - Account deletion with confirmation
   - Data export before deletion
   - Recovery grace period

7. **Session Management**
   - Multiple device login tracking
   - Session timeout
   - Device management

8. **Advanced Security**
   - Biometric authentication
   - Hardware key support
   - Risk-based authentication

---

## Support

For issues or questions about the authentication system:
1. Check the error messages in the UI
2. Review the console logs (development mode)
3. Check the localStorage in browser DevTools
4. Refer to this documentation

---

**Last Updated:** December 30, 2024
**Version:** 1.0.0
**Status:** Production Ready (Client-side)
