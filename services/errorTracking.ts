/**
 * Sentry Error Tracking Service
 * Initialize once in your app entry point
 */

// Note: In production, you'd install @sentry/react
// npm install @sentry/react @sentry/tracing

interface ErrorReport {
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  context?: Record<string, any>;
  timestamp?: number;
  userInfo?: {
    id?: string;
    email?: string;
    username?: string;
  };
  tags?: Record<string, string>;
}

interface ErrorLog {
  id: string;
  error: ErrorReport;
  stack?: string;
  source?: string;
}

class ErrorTracker {
  private errors: ErrorLog[] = [];
  private maxErrors = 50;
  private isProduction = process.env.NODE_ENV === 'production';
  private endpoint = 'https://your-sentry-endpoint.ingest.sentry.io';

  constructor() {
    this.setupGlobalErrorHandlers();
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        level: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        stack: event.error?.stack,
        source: 'uncaughtError'
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        level: 'error',
        context: {
          reason: event.reason,
        },
        source: 'unhandledRejection'
      });
    });

    // Handle console errors
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] instanceof Error) {
        this.captureError({
          message: args[0].message,
          level: 'error',
          context: {
            args: args.slice(1),
          },
          stack: args[0].stack,
          source: 'consoleError'
        });
      }
      originalError.apply(console, args);
    };
  }

  /**
   * Capture and log an error
   */
  captureError(error: ErrorReport) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      error,
      stack: error.stack,
      source: error.context?.source || 'unknown'
    };

    // Store locally
    this.errors.push(errorLog);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Store in localStorage for persistence
    this.persistError(errorLog);

    // Send to Sentry (production only)
    if (this.isProduction) {
      this.sendToSentry(errorLog);
    }

    console.warn('[ErrorTracker]', errorLog);
  }

  /**
   * Capture a warning
   */
  captureWarning(message: string, context?: Record<string, any>) {
    this.captureError({
      message,
      level: 'warning',
      context,
    });
  }

  /**
   * Capture info
   */
  captureInfo(message: string, context?: Record<string, any>) {
    this.captureError({
      message,
      level: 'info',
      context,
    });
  }

  /**
   * Set user context
   */
  setUser(userInfo: { id?: string; email?: string; username?: string }) {
    // Store in session for error reports
    sessionStorage.setItem('errorTrackerUser', JSON.stringify(userInfo));
  }

  /**
   * Clear user context
   */
  clearUser() {
    sessionStorage.removeItem('errorTrackerUser');
  }

  /**
   * Get all errors
   */
  getErrors(): ErrorLog[] {
    return this.errors;
  }

  /**
   * Get errors by level
   */
  getErrorsByLevel(level: string): ErrorLog[] {
    return this.errors.filter(e => e.error.level === level);
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errors.slice(-limit);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Persist error to localStorage
   */
  private persistError(errorLog: ErrorLog) {
    try {
      const key = 'errorTracker_' + errorLog.id;
      localStorage.setItem(key, JSON.stringify(errorLog));
    } catch (e) {
      // localStorage full or unavailable
    }
  }

  /**
   * Send error to Sentry
   */
  private async sendToSentry(errorLog: ErrorLog) {
    try {
      const userInfo = sessionStorage.getItem('errorTrackerUser');
      const user = userInfo ? JSON.parse(userInfo) : null;

      const payload = {
        ...errorLog,
        userInfo: user,
        timestamp: Date.now(),
      };

      // Send to your error tracking endpoint
      await fetch(`${this.endpoint}/api/events/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Silently fail - don't want error tracking to break the app
      });
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      errors: this.errors.map(e => ({
        id: e.id,
        message: e.error.message,
        level: e.error.level,
        time: new Date(e.error.timestamp || 0).toISOString(),
      })),
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Clear all errors
   */
  clearAll() {
    this.errors = [];
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('errorTracker_'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      // localStorage unavailable
    }
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(this.getRecentErrors(50), null, 2);
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// Export for use in components
export const useErrorTracking = () => {
  return {
    captureError: (msg: string, ctx?: any) => errorTracker.captureError({ message: msg, level: 'error', context: ctx }),
    captureWarning: (msg: string, ctx?: any) => errorTracker.captureWarning(msg, ctx),
    captureInfo: (msg: string, ctx?: any) => errorTracker.captureInfo(msg, ctx),
    setUser: (user: any) => errorTracker.setUser(user),
    clearUser: () => errorTracker.clearUser(),
    getRecentErrors: (limit?: number) => errorTracker.getRecentErrors(limit),
  };
};
