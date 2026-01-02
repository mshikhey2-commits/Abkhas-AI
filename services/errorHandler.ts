// Global Error Handler
// Centralized error tracking and user-friendly error messages

import { captureException } from "./sentryConfig";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorType {
  NETWORK = "NETWORK_ERROR",
  VALIDATION = "VALIDATION_ERROR",
  AUTH = "AUTH_ERROR",
  PERMISSION = "PERMISSION_ERROR",
  NOT_FOUND = "NOT_FOUND_ERROR",
  SERVER = "SERVER_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface AppError {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp: Date;
  userMessage?: string;
}

export class ApplicationError extends Error {
  public type: ErrorType;
  public severity: ErrorSeverity;
  public code?: string;
  public statusCode?: number;
  public details?: Record<string, any>;
  public userMessage: string;

  constructor(
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    userMessage?: string
  ) {
    super(message);
    this.name = "ApplicationError";
    this.type = type;
    this.severity = severity;
    this.userMessage = userMessage || message;

    // Capture in error tracking
    captureException(this, {
      type,
      severity,
      code: this.code,
    });
  }
}

// Error handlers for different scenarios
export const handleNetworkError = (error: any): AppError => {
  console.error("Network Error:", error);

  return {
    type: ErrorType.NETWORK,
    message: error?.message || "Network request failed",
    severity: ErrorSeverity.HIGH,
    statusCode: error?.status,
    userMessage: "Unable to load data. Please check your internet connection.",
    timestamp: new Date(),
  };
};

export const handleValidationError = (message: string, details?: any): AppError => {
  console.error("Validation Error:", message, details);

  return {
    type: ErrorType.VALIDATION,
    message,
    severity: ErrorSeverity.LOW,
    details,
    userMessage: `Invalid input: ${message}`,
    timestamp: new Date(),
  };
};

export const handleAuthError = (message: string = "Authentication failed"): AppError => {
  console.error("Auth Error:", message);

  return {
    type: ErrorType.AUTH,
    message,
    severity: ErrorSeverity.CRITICAL,
    code: "AUTH_FAILED",
    userMessage: "Please log in again",
    timestamp: new Date(),
  };
};

export const handleServerError = (statusCode?: number, message?: string): AppError => {
  console.error("Server Error:", statusCode, message);

  const userMessages: Record<number, string> = {
    500: "Server error. Please try again later.",
    502: "Service temporarily unavailable.",
    503: "Service under maintenance. Please try again later.",
    504: "Request timeout. Please try again.",
  };

  return {
    type: ErrorType.SERVER,
    message: message || `Server error (${statusCode})`,
    severity: ErrorSeverity.CRITICAL,
    statusCode,
    userMessage: userMessages[statusCode || 500] || "An error occurred. Please try again.",
    timestamp: new Date(),
  };
};

export const handleNotFoundError = (resource: string): AppError => {
  return {
    type: ErrorType.NOT_FOUND,
    message: `${resource} not found`,
    severity: ErrorSeverity.MEDIUM,
    userMessage: `The requested ${resource} could not be found.`,
    timestamp: new Date(),
  };
};

// Global error handler
export const globalErrorHandler = (error: any): AppError => {
  console.error("Global Error Handler:", error);

  if (error instanceof ApplicationError) {
    return {
      type: error.type,
      message: error.message,
      severity: error.severity,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      userMessage: error.userMessage,
      timestamp: new Date(),
    };
  }

  if (error instanceof TypeError) {
    return handleValidationError(error.message);
  }

  if (error instanceof SyntaxError) {
    return handleValidationError("Invalid data format");
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || "An unexpected error occurred",
    severity: ErrorSeverity.MEDIUM,
    userMessage: "Something went wrong. Please try again later.",
    timestamp: new Date(),
  };
};

// Error logger
export class ErrorLogger {
  private static errors: AppError[] = [];
  private static readonly MAX_ERRORS = 100;

  static log(error: AppError): void {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }

    // Log based on severity
    const consoleMethod = {
      [ErrorSeverity.LOW]: "log",
      [ErrorSeverity.MEDIUM]: "warn",
      [ErrorSeverity.HIGH]: "error",
      [ErrorSeverity.CRITICAL]: "error",
    }[error.severity];

    console[consoleMethod as any](`[${error.type}] ${error.message}`);
  }

  static getErrors(): AppError[] {
    return [...this.errors];
  }

  static getErrorsBySeverity(severity: ErrorSeverity): AppError[] {
    return this.errors.filter((e) => e.severity === severity);
  }

  static clear(): void {
    this.errors = [];
  }

  static getStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const error of this.errors) {
      stats[error.type] = (stats[error.type] ?? 0) + 1;
    }

    return stats;
  }
}

// Retry mechanism for failed operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed. Retrying in ${delayMs}ms...`);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
};

// Timeout wrapper
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new ApplicationError(
            ErrorType.NETWORK,
            `Operation timed out after ${timeoutMs}ms`,
            ErrorSeverity.HIGH,
            "Request took too long. Please try again."
          )
        ),
      timeoutMs
    )
  );

  return Promise.race([promise, timeoutPromise]);
};

export default {
  ApplicationError,
  ErrorLogger,
  globalErrorHandler,
  handleNetworkError,
  handleValidationError,
  handleAuthError,
  handleServerError,
  handleNotFoundError,
  retryOperation,
  withTimeout,
};
