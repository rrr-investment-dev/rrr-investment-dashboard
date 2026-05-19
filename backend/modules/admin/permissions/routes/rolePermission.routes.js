import express from "express";
import * as rolePermissionController from "../controllers/rolePermission.controller.js";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware.protect,
    // requirePermission("admin.rolePermission.read"),
    rolePermissionController.getAllRolePermissions,
  )
  .post(
    authMiddleware.protect,
    requirePermission("admin.rolePermission.create"),
    rolePermissionController.createRolePermission,
  );

router
  .route("/:id")
  .get(
    authMiddleware.protect,
    requirePermission("admin.rolePermission.read"),
    rolePermissionController.getRolePermissionById,
  )
  .patch(
    authMiddleware.protect,
    requirePermission("admin.rolePermission.update"),
    rolePermissionController.updateRolePermission,
  )
  .delete(
    authMiddleware.protect,
    requirePermission("admin.rolePermission.delete"),
    rolePermissionController.deleteRolePermission,
  );

export default router;
