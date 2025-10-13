/**
 * Error logging utility for the AI Chat App
 * This can be extended to integrate with error tracking services like Sentry, LogRocket, etc.
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  componentStack?: string;
  digest?: string;
  userAction?: string;
}

export interface LoggedError {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: "low" | "medium" | "high" | "critical";
}

/**
 * Log an error with context information
 */
export const logError = (
  error: Error,
  context: Partial<ErrorContext> = {},
  severity: LoggedError["severity"] = "medium"
): void => {
  const loggedError: LoggedError = {
    message: error.message,
    stack: error.stack,
    context: {
      userId: context.userId,
      sessionId: context.sessionId || generateSessionId(),
      userAgent: context.userAgent || navigator.userAgent,
      url: context.url || window.location.href,
      timestamp: context.timestamp || new Date().toISOString(),
      componentStack: context.componentStack,
    },
    severity,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error Logged (${severity.toUpperCase()})`);
    console.error("Error:", error);
    console.log("Context:", loggedError.context);
    console.groupEnd();
  }

  // In production, you would send this to your error tracking service
  if (process.env.NODE_ENV === "production") {
    // Example: Send to error tracking service
    // sendToErrorTrackingService(loggedError);

    // For now, we'll just log to console
    console.error("Production Error:", loggedError);
  }
};

/**
 * Log a user-facing error (API errors, network errors, etc.)
 */
export const logUserError = (
  error: Error,
  userAction?: string,
  additionalContext?: Partial<ErrorContext>
): void => {
  logError(
    error,
    {
      ...additionalContext,
      userAction,
    },
    "medium"
  );
};

/**
 * Log a critical system error
 */
export const logCriticalError = (
  error: Error,
  additionalContext?: Partial<ErrorContext>
): void => {
  logError(error, additionalContext, "critical");
};

/**
 * Generate a simple session ID for error tracking
 */
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Error boundary helper to extract component stack
 */
export const extractComponentStack = (
  errorInfo: { componentStack?: string | null } | null | undefined
): string => {
  return errorInfo?.componentStack || "Component stack not available";
};

/**
 * Check if an error is a network error
 */
export const isNetworkError = (error: Error): boolean => {
  return (
    error.name === "TypeError" &&
    (error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch"))
  );
};

/**
 * Check if an error is a timeout error
 */
export const isTimeoutError = (error: Error): boolean => {
  return (
    error.name === "AbortError" ||
    error.message.includes("timeout") ||
    error.message.includes("Request timeout")
  );
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: Error): string => {
  if (isNetworkError(error)) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (isTimeoutError(error)) {
    return "Request timed out. Please try again.";
  }

  if (error.message.includes("API")) {
    return "Service temporarily unavailable. Please try again later.";
  }

  // Default message
  return "Something went wrong. Please try again.";
};
