import express from "express";
import userRoutes from "./user/user.routes.js";
import roleTypeRoutes from "./roleType/roleType.routes.js";
import rolePermissionRoutes from "./permissions/routes/rolePermission.routes.js";
import permissionRoutes from "./permissions/routes/permission.routes.js";
import userPermissionOverrideRoutes from "./permissions/routes/userPermissionOverride.routes.js";
import authRoutes from "./auth/auth.routes.js";
import dashboardRoutes from "./dashboard/dashboard.routes.js";

const router = express.Router();

// Admin Module Routes
// Auth routes (no prefix - handles /request-otp, /verify-otp, etc.)
router.use("/auth", authRoutes);

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

// User management routes
router.use("/users", userRoutes);

// Role management routes (formerly role-types)
router.use("/roles", roleTypeRoutes);

// Role-permission mapping routes (formerly roles)
router.use("/role-permissions", rolePermissionRoutes);

// Permission management routes
router.use("/permissions", permissionRoutes);

// User permission override routes
router.use("/user-permission-overrides", userPermissionOverrideRoutes);

export default router;
