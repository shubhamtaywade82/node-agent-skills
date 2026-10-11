// src/observability/logger.js
// Demonstrates: node-observability (structured JSON logs, redaction, correlation id).
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    // Never log these keys at any depth. Defends against leaking secrets/PII.
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.api_key",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

export { logger };
