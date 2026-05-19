import logger from "../Utils/logger.js";

import { handleDBErrors } from "../Utils/handleDBErrors.js";

const sendErrorDev = (err, req, res) => {
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

const sendErrorProd = (err, res) => {
  // Operational errors: send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming errors: log, send generic message
  logger.error({ message: err.message, stack: err.stack });
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (error.name === "CastError") error = handleDBErrors(error);
  if (error.code === 11000) error = handleDBErrors(error);
  if (error.name === "ValidationError") error = handleDBErrors(error);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, res);
  }
};
