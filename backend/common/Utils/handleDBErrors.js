import AppErrorClass from "./AppErrorClass.js";

export const handleDBErrors = (err) => {
  // Duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists. Please use another value.`;
    return new AppErrorClass(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppErrorClass(message, 400);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppErrorClass(message, 400);
  }

  return err;
};
