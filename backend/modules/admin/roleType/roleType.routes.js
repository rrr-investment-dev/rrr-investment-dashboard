import express from "express";
import * as roleTypeController from "./roleType.controller.js";
import * as authMiddleware from "../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware.protect,
    requirePermission("admin.userManagement.userType.read"),
    roleTypeController.getAllRoleTypes,
  )
  .post(
    authMiddleware.protect,
    requirePermission("admin.userManagement.userType.create"),
    roleTypeController.createRoleType,
  );

// Toggle status route - MUST be before /:id route
router.patch(
  "/:id/status",
  authMiddleware.protect,
  requirePermission("admin.userManagement.userType.delete"),
  roleTypeController.toggleRoleTypeStatus,
);

// CRUD by ID route - MUST be after specific routes
router
  .route("/:id")
  // .get(
  //   authMiddleware.protect,
  //   requirePermission("admin.userManagement.userType.read"),
  //   roleTypeController.getRoleTypeById,
  // )
  .get(
    authMiddleware.protect,
    requirePermission("admin.userManagement.userType.read"),
    roleTypeController.getRoleWithPermissions,
  )
  .patch(
    authMiddleware.protect,
    requirePermission("admin.userManagement.userType.update"),
    roleTypeController.updateRoleType,
  );

export default router;
