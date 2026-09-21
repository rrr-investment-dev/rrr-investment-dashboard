import logger from "../Utils/logger.js";
import { handleDBErrors } from "../Utils/handleDBErrors.js";
import AppErrorClass from "../Utils/AppErrorClass.js";

const setCorsHeaders = (req, res) => {
  const origin = req.headers?.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
};

const sendErrorDev = (err, req, res) => {
  setCorsHeaders(req, res);

  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
  });

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  setCorsHeaders(req, res);

  // Operational errors: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming or unhandled errors: log and send message
  logger.error({ message: err.message, stack: err.stack });
  res.status(500).json({
    status: "error",
    message: err.message || "Something went wrong on the server",
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // Handle Multer upload errors with friendly messages
  if (error.name === "MulterError") {
    let message = "File upload error";
    let statusCode = 400;

    if (error.code === "LIMIT_FILE_SIZE") {
      message =
        "File too large. Maximum allowed size is 2 MB. Please compress or upload a smaller file.";
      statusCode = 413;
    } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message =
        "Unexpected file field in the upload. Please check the form field name.";
      statusCode = 400;
    } else {
      message = error.message || "File upload error";
    }

    error = new AppErrorClass(message, statusCode);
  }

  if (error.name === "CastError") error = handleDBErrors(error);
  if (error.code === 11000) error = handleDBErrors(error);
  if (error.name === "ValidationError") error = handleDBErrors(error);

  if (error.name === "JsonWebTokenError") {
    error = new AppErrorClass("Invalid authentication token. Please log in again!", 401);
  }
  if (error.name === "TokenExpiredError") {
    error = new AppErrorClass("Your session has expired. Please log in again.", 401);
  }

  // Ensure we use the normalized `error` object (not the original `err`)
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};
