import express from "express";
import * as userController from "./user.controller.js";
import * as authMiddleware from "../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

// User CRUD routes
router
  .route("/")
  .get(
    authMiddleware.protect,
    requirePermission("admin.userManagement.users.read"),
    userController.getAllUsers,
  )
  .post(
    authMiddleware.protect,
    requirePermission("admin.userManagement.users.create"),
    userController.createUser,
  );

// Toggle status route - MUST be before /:id route
router.patch(
  "/:id/status",
  authMiddleware.protect,
  requirePermission("admin.userManagement.users.delete"),
  userController.toggleUserStatus,
);

// User CRUD by ID routes - MUST be after specific routes
router
  .route("/:id")
  .get(
    authMiddleware.protect,
    requirePermission("admin.userManagement.users.read"),
    userController.getUserById,
  )
  .patch(
    authMiddleware.protect,
    requirePermission("admin.userManagement.users.update"),
    userController.updateUser,
  );

export default router;
