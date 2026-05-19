import winston from "winston";

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { service: "rrr-dashboard" },
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

export default logger;
