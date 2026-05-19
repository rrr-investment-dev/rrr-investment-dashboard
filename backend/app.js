import express from "express";
const app = express();
import apiRoutes from "./routes/index.js";
import AppErrorClass from "./common/Utils/AppErrorClass.js";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Middleware to parse cookies
app.use(cookieParser());

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: "http://localhost:5173", // frontend
    credentials: true, // allow cookies
  }),
);

// Use the master API router
app.use("/api", apiRoutes);

// Handle undefined routes

app.all("/{*splat}", (req, res, next) => {
  next(new AppErrorClass(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware

app.use(globalErrorHandler);

export default app;
