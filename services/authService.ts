/**
 * Authentication Service
 * Handles user registration, login, and local storage of user data
 * Supports email & password and Saudi phone & password authentication
 */

export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  passwordHash: string;
  createdAt: number;
  lastLogin: number;
  loginAttempts: number;
  lockedUntil?: number;
  profileData?: {
    name?: string;
    avatar?: string;
    preferences?: Record<string, any>;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: string;
}

const STORAGE_KEY = 'abkhas_users';
const CURRENT_USER_KEY = 'abkhas_current_user';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Generate unique user ID
 */
const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password: string): Promise<string> => {
  // For browser environment, we'll use a simple SHA-256 approach
  // In production, use a proper auth backend
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'abkhas_salt_key_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verify password
 */
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const newHash = await hashPassword(password);
  return newHash === hash;
};

/**
 * Get all users from localStorage
 */
const getAllUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Save users to localStorage
 */
const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

/**
 * Validate Saudi phone number format
 * Accepts: 0501234567, 501234567, +966501234567
 */
export const validateSaudiPhone = (phone: string): boolean => {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-+]/g, '');
  
  // Check if it's 9 digits (starts with 5), 10 digits (0501234567), or with country code
  const patterns = [
    /^5\d{8}$/, // 5XXXXXXXX
    /^05\d{8}$/, // 05XXXXXXXX
    /^9665\d{8}$/, // 9665XXXXXXXX
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Normalize Saudi phone number to standard format (9665XXXXXXXX)
 */
export const normalizeSaudiPhone = (phone: string): string => {
  let cleaned = phone.replace(/[\s\-]/g, '').trim();
  
  // Remove + if exists
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 05, replace with 9665
  if (cleaned.startsWith('05')) {
    return '966' + cleaned.substring(1);
  }
  
  // If starts with 5 and is 9 digits total, add 966
  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return '966' + cleaned;
  }
  
  // Already in international format
  if (cleaned.startsWith('966') && cleaned.length === 12) {
    return cleaned;
  }
  
  return cleaned;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Register user with email and password
 */
export const registerWithEmail = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  try {
    // Trim inputs
    const trimmedEmail = email.trim();
    const trimmedName = name?.trim();

    // Validate email
    if (!validateEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL'
      };
    }

    // Validate password strength (min 8 chars)
    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters',
        error: 'WEAK_PASSWORD'
      };
    }

    // Additional password checks
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return {
        success: false,
        message: 'Password must contain uppercase, lowercase, and numbers',
        error: 'WEAK_PASSWORD'
      };
    }

    const users = getAllUsers();
    const lowerEmail = trimmedEmail.toLowerCase();

    // Check if email already exists
    if (users.some(u => u.email === lowerEmail)) {
      return {
        success: false,
        message: 'Email already registered',
        error: 'EMAIL_EXISTS'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: generateUserId(),
      email: lowerEmail,
      passwordHash,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      loginAttempts: 0,
      profileData: {
        name: trimmedName || trimmedEmail.split('@')[0]
      }
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return {
      success: true,
      message: 'Registration successful',
      user: newUser
    };
  } catch (error) {
    return {
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Register user with Saudi phone number and password
 */
export const registerWithPhone = async (phone: string, password: string, name?: string): Promise<AuthResponse> => {
  try {
    // Trim inputs
    const trimmedPhone = phone.trim();
    const trimmedName = name?.trim();

    // Validate phone
    if (!validateSaudiPhone(trimmedPhone)) {
      return {
        success: false,
        message: 'Invalid Saudi phone number',
        error: 'INVALID_PHONE'
      };
    }

    // Validate password strength
    if (password.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters',
        error: 'WEAK_PASSWORD'
      };
    }

    // Additional password checks
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return {
        success: false,
        message: 'Password must contain uppercase, lowercase, and numbers',
        error: 'WEAK_PASSWORD'
      };
    }

    const normalizedPhone = normalizeSaudiPhone(trimmedPhone);
    const users = getAllUsers();

    // Check if phone already exists
    if (users.some(u => u.phoneNumber === normalizedPhone)) {
      return {
        success: false,
        message: 'Phone number already registered',
        error: 'PHONE_EXISTS'
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: generateUserId(),
      phoneNumber: normalizedPhone,
      passwordHash,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      loginAttempts: 0,
      profileData: {
        name: trimmedName || `User ${normalizedPhone.slice(-4)}`
      }
    };

    // Save user
    users.push(newUser);
    saveUsers(users);

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

    return {
      success: true,
      message: 'Registration successful',
      user: newUser
    };
  } catch (error) {
    return {
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const trimmedEmail = email.trim();

    // Validate email
    if (!validateEmail(trimmedEmail)) {
      return {
        success: false,
        message: 'Invalid email format',
        error: 'INVALID_EMAIL'
      };
    }

    const users = getAllUsers();
    const user = users.find(u => u.email === trimmedEmail.toLowerCase());

    if (!user) {
      return {
        success: false,
        message: 'Email not found',
        error: 'USER_NOT_FOUND'
      };
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return {
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
        error: 'ACCOUNT_LOCKED'
      };
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after max attempts
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = Date.now() + LOCKOUT_TIME;
        saveUsers(users);
        return {
          success: false,
          message: 'Too many failed attempts. Account locked for 15 minutes',
          error: 'ACCOUNT_LOCKED'
        };
      }

      saveUsers(users);
      return {
        success: false,
        message: `Invalid password. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt${MAX_LOGIN_ATTEMPTS - user.loginAttempts > 1 ? 's' : ''} remaining`,
        error: 'INVALID_PASSWORD'
      };
    }

    // Successful login - reset attempts and unlock
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = Date.now();
    saveUsers(users);

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      message: 'Login successful',
      user
    };
  } catch (error) {
    return {
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Login with Saudi phone number and password
 */
export const loginWithPhone = async (phone: string, password: string): Promise<AuthResponse> => {
  try {
    const trimmedPhone = phone.trim();

    // Validate phone
    if (!validateSaudiPhone(trimmedPhone)) {
      return {
        success: false,
        message: 'Invalid Saudi phone number',
        error: 'INVALID_PHONE'
      };
    }

    const normalizedPhone = normalizeSaudiPhone(trimmedPhone);
    const users = getAllUsers();
    const user = users.find(u => u.phoneNumber === normalizedPhone);

    if (!user) {
      return {
        success: false,
        message: 'Phone number not found',
        error: 'USER_NOT_FOUND'
      };
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return {
        success: false,
        message: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
        error: 'ACCOUNT_LOCKED'
      };
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      // Lock account after max attempts
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = Date.now() + LOCKOUT_TIME;
        saveUsers(users);
        return {
          success: false,
          message: 'Too many failed attempts. Account locked for 15 minutes',
          error: 'ACCOUNT_LOCKED'
        };
      }

      saveUsers(users);
      return {
        success: false,
        message: `Invalid password. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt${MAX_LOGIN_ATTEMPTS - user.loginAttempts > 1 ? 's' : ''} remaining`,
        error: 'INVALID_PASSWORD'
      };
    }

    // Successful login - reset attempts and unlock
    user.loginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLogin = Date.now();
    saveUsers(users);

    // Set as current user
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return {
      success: true,
      message: 'Login successful',
      user
    };
  } catch (error) {
    return {
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Get current logged-in user
 */
export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Logout current user and clear sensitive data
 */
export const logout = (): void => {
  // Clear current user
  localStorage.removeItem(CURRENT_USER_KEY);
  
  // Clear sensitive data from memory
  sessionStorage.clear();
};

/**
 * Check if user is logged in
 */
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

/**
 * Update user profile data
 */
export const updateUserProfile = (updates: Partial<User['profileData']>): AuthResponse => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'No user logged in',
        error: 'NO_USER'
      };
    }

    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return {
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      };
    }

    users[userIndex].profileData = {
      ...users[userIndex].profileData,
      ...updates
    };

    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));

    return {
      success: true,
      message: 'Profile updated',
      user: users[userIndex]
    };
  } catch (error) {
    return {
      success: false,
      message: 'Update failed',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Delete user account
 */
export const deleteAccount = (password: string): Promise<AuthResponse> => {
  return new Promise(async (resolve) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        resolve({
          success: false,
          message: 'No user logged in',
          error: 'NO_USER'
        });
        return;
      }

      // Verify password
      const passwordValid = await verifyPassword(password, currentUser.passwordHash);
      if (!passwordValid) {
        resolve({
          success: false,
          message: 'Invalid password',
          error: 'INVALID_PASSWORD'
        });
        return;
      }

      const users = getAllUsers();
      const filteredUsers = users.filter(u => u.id !== currentUser.id);
      saveUsers(filteredUsers);
      logout();

      resolve({
        success: true,
        message: 'Account deleted'
      });
    } catch (error) {
      resolve({
        success: false,
        message: 'Delete failed',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      });
    }
  });
};
