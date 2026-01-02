// Sentry Error Tracking Configuration for ABKHAS AI
// Provides real-time error monitoring and performance tracking

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initializeSentry = () => {
  // Only initialize in production
  if (process.env.NODE_ENV === "production") {
    Sentry.init({
      // Your Sentry DSN - Get from https://sentry.io
      dsn: process.env.REACT_APP_SENTRY_DSN || "",
      
      // Environment
      environment: process.env.NODE_ENV,
      
      // Release version
      release: process.env.REACT_APP_VERSION || "0.0.0",
      
      // Performance Monitoring
      integrations: [
        new BrowserTracing({
          // Set sampling rate for performance monitoring
          tracingOrigins: ["localhost", /^\//],
        }),
      ],
      
      // Set sample rates
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session sample rate (for crash reporting)
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Attach stacktraces
      attachStacktrace: true,
      
      // Before sending
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;
          
          // Don't send network errors in development
          if (error?.message?.includes("NetworkError")) {
            return null;
          }
        }
        
        return event;
      },
      
      // Ignore certain errors
      denyUrls: [
        // Browser extensions
        /extensions\//i,
        /^chrome:\/\//i,
        // Local files
        /^file:\/\//i,
      ],
      
      // Allow specific URLs
      allowUrls: [
        // Your domain
        /https?:\/\/(www\.)?abkhas\.app/,
      ],
    });
  }
};

// Error tracking helper
export const captureException = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  } else {
    console.error("Development error:", error, context);
  }
};

// Performance monitoring helper
export const captureMessage = (message: string, level: "fatal" | "error" | "warning" | "info" = "info") => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}]`, message);
  }
};

// User feedback
export const captureUserFeedback = (email: string, message: string) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureUserFeedback({
      email,
      comments: message,
      name: "User",
    });
  }
};

// Set user context
export const setUserContext = (userId: string, email?: string, username?: string) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }
};

// Clear user context
export const clearUserContext = () => {
  if (process.env.NODE_ENV === "production") {
    Sentry.setUser(null);
  }
};

// Performance transaction
export const withPerformanceTracking = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  const transaction = Sentry.startTransaction({
    name,
    op: "http.request",
  });

  try {
    const result = await operation();
    transaction.finish();
    return result;
  } catch (error) {
    transaction.setStatus("error");
    transaction.finish();
    throw error;
  }
};

export default initializeSentry;
