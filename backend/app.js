import express from "express";
const app = express();
import adminModuleRoutes from "./dashboard/admin/modules/admin/adminModuleRoutes.js";
import AppErrorClass from "./common/Utils/AppErrorClass.js";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler.js";
import cookieParser from "cookie-parser";

// Middleware to parse cookies
app.use(cookieParser());

app.use(express.json());

// Use the admin module routes

app.use("/api/users", adminModuleRoutes);

// Handle undefined routes

app.all("/{*splat}", (req, res, next) => {
  next(new AppErrorClass(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware

app.use(globalErrorHandler);

export default app;
