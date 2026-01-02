/**
 * Enhanced Rate Limiting Service
 * Prevents brute force attacks and API abuse
 */

interface RateLimitRule {
  name: string;
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  lockoutMs: number; // Lockout duration after max attempts
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private rules: Map<string, RateLimitRule>;

  constructor() {
    this.rules = new Map([
      [
        'login',
        {
          name: 'Login Attempts',
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000, // 15 minutes
          lockoutMs: 15 * 60 * 1000, // 15 minutes
        }
      ],
      [
        'signup',
        {
          name: 'Signup Attempts',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000, // 1 hour
          lockoutMs: 60 * 60 * 1000, // 1 hour
        }
      ],
      [
        'passwordReset',
        {
          name: 'Password Reset',
          maxAttempts: 3,
          windowMs: 60 * 60 * 1000, // 1 hour
          lockoutMs: 30 * 60 * 1000, // 30 minutes
        }
      ],
      [
        'api',
        {
          name: 'API Requests',
          maxAttempts: 100,
          windowMs: 60 * 1000, // 1 minute
          lockoutMs: 5 * 60 * 1000, // 5 minutes
        }
      ],
    ]);
  }

  /**
   * Check if action is allowed
   */
  isAllowed(key: string, ruleType: string = 'login'): {
    allowed: boolean;
    remaining: number;
    retryAfter?: number;
    reason?: string;
  } {
    const rule = this.rules.get(ruleType);
    if (!rule) {
      return { allowed: true, remaining: rule?.maxAttempts || 0 };
    }

    const entry = this.limits.get(key);
    const now = Date.now();

    // Check if currently locked out
    if (entry?.lockedUntil && entry.lockedUntil > now) {
      const retryAfter = Math.ceil((entry.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        retryAfter,
        reason: `Too many attempts. Please try again in ${retryAfter} seconds.`
      };
    }

    // Check if in same time window
    if (entry && now - entry.firstAttempt < rule.windowMs) {
      const remaining = rule.maxAttempts - entry.attempts;

      if (remaining <= 0) {
        // Lock the account
        const lockedUntil = now + rule.lockoutMs;
        this.limits.set(key, {
          ...entry,
          lockedUntil,
        });

        return {
          allowed: false,
          remaining: 0,
          retryAfter: rule.lockoutMs / 1000,
          reason: `Account locked for ${rule.lockoutMs / 1000 / 60} minutes`
        };
      }

      return {
        allowed: true,
        remaining,
      };
    }

    // Reset if window expired
    return {
      allowed: true,
      remaining: rule.maxAttempts,
    };
  }

  /**
   * Record an attempt
   */
  recordAttempt(key: string, ruleType: string = 'login'): void {
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry) {
      this.limits.set(key, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      });
    } else {
      const rule = this.rules.get(ruleType);
      if (rule && now - entry.firstAttempt >= rule.windowMs) {
        // Reset if window expired
        this.limits.set(key, {
          attempts: 1,
          firstAttempt: now,
          lastAttempt: now,
        });
      } else {
        // Increment attempts
        this.limits.set(key, {
          ...entry,
          attempts: entry.attempts + 1,
          lastAttempt: now,
        });
      }
    }
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
  }

  /**
   * Get rate limit status
   */
  getStatus(key: string, ruleType: string = 'login'): {
    attempts: number;
    remaining: number;
    locked: boolean;
    lockTimeRemaining?: number;
  } {
    const rule = this.rules.get(ruleType);
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry) {
      return {
        attempts: 0,
        remaining: rule?.maxAttempts || 0,
        locked: false,
      };
    }

    const remaining = Math.max(0, (rule?.maxAttempts || 0) - entry.attempts);
    const locked = entry.lockedUntil ? entry.lockedUntil > now : false;

    return {
      attempts: entry.attempts,
      remaining,
      locked,
      lockTimeRemaining: locked && entry.lockedUntil ? entry.lockedUntil - now : undefined,
    };
  }

  /**
   * Add custom rule
   */
  addRule(type: string, rule: RateLimitRule): void {
    this.rules.set(type, rule);
  }

  /**
   * Get all tracked limits
   */
  getAllLimits(): Record<string, RateLimitEntry> {
    const result: Record<string, RateLimitEntry> = {};
    this.limits.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Cleanup old entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((entry, key) => {
      let ruleWindowMs = 15 * 60 * 1000; // default

      // Find the largest window
      this.rules.forEach((rule) => {
        ruleWindowMs = Math.max(ruleWindowMs, rule.windowMs);
      });

      // Delete if no activity for 2x the window
      if (now - entry.lastAttempt > ruleWindowMs * 2) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.limits.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`[RateLimiter] Cleaned up ${keysToDelete.length} entries`);
    }
  }
}

// Create singleton
export const rateLimiter = new RateLimiter();

// Schedule periodic cleanup
setInterval(() => rateLimiter.cleanup(), 60 * 60 * 1000); // Every hour

// Export hook for React
export const useRateLimit = () => {
  return {
    isAllowed: (key: string, ruleType?: string) => rateLimiter.isAllowed(key, ruleType),
    recordAttempt: (key: string, ruleType?: string) => rateLimiter.recordAttempt(key, ruleType),
    getStatus: (key: string, ruleType?: string) => rateLimiter.getStatus(key, ruleType),
    reset: (key: string) => rateLimiter.reset(key),
    resetAll: () => rateLimiter.resetAll(),
  };
};
