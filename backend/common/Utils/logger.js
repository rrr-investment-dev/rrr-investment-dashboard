import winston from "winston";

const { combine, timestamp, json, errors, colorize, simple } = winston.format;

const transports = [
  new winston.transports.Console({
    format:
      process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL)
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), simple()),
  }),
];

// Only write to disk logs in local development
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  transports.push(
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  );
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "rrr-dashboard" },
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports,
});

export default logger;
