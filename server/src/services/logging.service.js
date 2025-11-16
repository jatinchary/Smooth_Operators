import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory path
const logsDir = path.join(__dirname, "../../logs");

// Create the logger with daily rotation
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Daily rotating file transport
    new DailyRotateFile({
      filename: "frontend-api-call-%DATE%.log",
      dirname: path.join(logsDir, "%DATE%"), // Each day in its own folder
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d", // Keep logs for 14 days
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
          });
        })
      ),
    }),
  ],
});

// Console transport disabled - logs are written to files only
// Uncomment below to enable console logging in development
/*
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `${timestamp} ${level}: ${message}${metaStr}`;
        })
      ),
    })
  );
}
*/

// Request logging middleware
export const requestLoggingMiddleware = (req, res, next) => {
  // Generate unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;

  // Log incoming request
  logger.info("REQUEST_START", {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    headers: {
      "content-type": req.get("content-type"),
      "content-length": req.get("content-length"),
      origin: req.get("origin"),
      referer: req.get("referer"),
    },
    query: req.query,
    // Don't log body for security reasons, but log body size if present
    bodySize: req.body ? JSON.stringify(req.body).length : 0,
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    // Log outgoing response
    logger.info("REQUEST_END", {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: Date.now() - req.startTime,
      headers: {
        "content-type": res.get("content-type"),
        "content-length": res.get("content-length"),
      },
      // Don't log response body for security reasons
      responseSize: chunk ? chunk.length : 0,
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  // Set start time for response time calculation
  req.startTime = Date.now();

  next();
};

// Utility function to log additional events with request ID
export const logWithRequestId = (level, message, requestId, meta = {}) => {
  logger.log(level, message, { requestId, ...meta });
};

// Category-based logger creator
export function createCategoryLogger(category) {
  const categoryDir = path.join(logsDir, "%DATE%", category);

  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new DailyRotateFile({
        filename: "lending-calls-%DATE%.log", // Specific filename for Lending
        dirname: categoryDir,
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        format: winston.format.combine(
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return JSON.stringify({
              timestamp,
              level,
              message,
              ...meta,
            });
          })
        ),
      }),
    ],
  });
}

// Higher-order function to log outgoing API requests
export async function logOutgoingRequest(
  fetchFn,
  category,
  requestId,
  requestMeta = {}
) {
  const categoryLogger = createCategoryLogger(category);

  // Log request start
  categoryLogger.info("OUTGOING_REQUEST_START", {
    requestId,
    ...requestMeta,
    timestamp: new Date().toISOString(),
  });

  try {
    const response = await fetchFn();

    // Log response
    const responseClone = response.clone(); // Clone to read body twice if needed
    const responseText = await responseClone.text();
    const responseBody =
      responseText.length > 10000 ? "[TRUNCATED]" : responseText; // Truncate large bodies

    categoryLogger.info("OUTGOING_REQUEST_END", {
      requestId,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      responseTime: Date.now() - (requestMeta.startTime || Date.now()), // Approximate if startTime not provided
      timestamp: new Date().toISOString(),
    });

    return response;
  } catch (error) {
    categoryLogger.error("OUTGOING_REQUEST_ERROR", {
      requestId,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}

// Export logger for direct use if needed
export { logger };
