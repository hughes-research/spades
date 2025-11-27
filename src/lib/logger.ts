/**
 * Logging utility for server-side operations.
 * Provides structured logging with timestamps and log levels.
 * Supports both text and JSON output formats for production log aggregation.
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogFormat = "text" | "json";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level (configurable via environment)
const MIN_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === "production" ? "info" : "debug");

// Log format (text for development, json for production)
const LOG_FORMAT: LogFormat =
  (process.env.LOG_FORMAT as LogFormat) || (process.env.NODE_ENV === "production" ? "json" : "text");

/**
 * Sanitizes sensitive data from log context.
 * Masks passwords, tokens, and other sensitive fields.
 */
function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ["password", "token", "secret", "apiKey", "authorization", "cookie"];
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    
    // Check if this is a sensitive field
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Formats a log entry for text output.
 */
function formatTextEntry(entry: LogEntry): string {
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
}

/**
 * Formats a log entry for JSON output.
 * Suitable for log aggregation services like Datadog, Splunk, etc.
 */
function formatJsonEntry(entry: LogEntry): string {
  return JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    ...entry.context,
  });
}

/**
 * Writes a log entry to the appropriate output.
 */
function writeLog(entry: LogEntry): void {
  if (LOG_LEVELS[entry.level] < LOG_LEVELS[MIN_LOG_LEVEL]) {
    return;
  }

  const formatted = LOG_FORMAT === "json" 
    ? formatJsonEntry(entry) 
    : formatTextEntry(entry);

  switch (entry.level) {
    case "error":
      // Using console.error for error level is appropriate in Node.js
      // as it writes to stderr which is the correct stream for errors
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

/**
 * Creates a log entry and writes it.
 */
function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  // Sanitize context to mask sensitive data
  const sanitizedContext = context ? sanitizeContext(context) : undefined;
  
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: sanitizedContext,
  };
  writeLog(entry);
}

/**
 * Logger interface with methods for each log level.
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => log("error", message, context),
  
  /**
   * Creates a child logger with preset context.
   * Useful for adding consistent context across related log entries.
   */
  child: (baseContext: Record<string, unknown>) => ({
    debug: (message: string, context?: Record<string, unknown>) => 
      log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: Record<string, unknown>) => 
      log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: Record<string, unknown>) => 
      log("warn", message, { ...baseContext, ...context }),
    error: (message: string, context?: Record<string, unknown>) => 
      log("error", message, { ...baseContext, ...context }),
  }),
};

export default logger;
