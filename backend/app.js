import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import apiRoutes from "./routes/index.js";
import AppErrorClass from "./common/Utils/AppErrorClass.js";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler.js";

const app = express();

// Trust proxy for secure cookies on Vercel / CloudFront
app.enable("trust proxy");

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.WEBSITE_URL,
  "https://admin.rrrinvestments.in",
  "https://rrrinvestments.in",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3001",
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "admin.rrrinvestments.in" ||
      hostname === "rrrinvestments.in" ||
      hostname.endsWith(".rrrinvestments.in") ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cookie",
  ],
};

// 1. CORS middleware (handles regular and preflight OPTIONS requests)
app.use(cors(corsOptions));

// 2. Database connection middleware (connects to MongoDB Atlas on serverless invocations)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// 3. Cookie parser & JSON body parser
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// 4. Health check / root info routes
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "RRR Investments API Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "RRR Investments API Root",
    version: "1.0.0",
  });
});

// 5. Use master API router mounted at both /api and /
app.use("/api", apiRoutes);
app.use("/", apiRoutes);

// 6. Handle undefined routes (standard middleware for Express 5 compatibility)
app.use((req, res, next) => {
  next(new AppErrorClass(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 7. Global error handling middleware
app.use(globalErrorHandler);

export default app;
