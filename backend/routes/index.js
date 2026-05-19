import express from "express";
import adminRoutes from "../modules/admin/admin.routes.js";
import websiteRoutes from "../modules/website/routes/website.routes.js";
import websiteAdminRoutes from "../modules/website/routes/website.admin.routes.js";

const router = express.Router();

/**
 * Master Router Index
 * All routes here are prefixed with /api (as defined in app.js)
 */

// 1. Admin Module (Users, Roles, Permissions, Auth)
// Mounting at root for now to maintain compatibility with current frontend URLs (/api/users, etc.)
router.use("/", adminRoutes);

// 2. Website Module
// Public routes (e.g., /api/website/posts)
router.use("/website", websiteRoutes);

// Private/Admin routes (e.g., /api/admin/website/posts)
router.use("/admin/website", websiteAdminRoutes);

// 3. Accounts Module (Future)
// router.use("/accounts", accountsRoutes);

export default router;
