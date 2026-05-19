import express from "express";
import * as permissionController from "../controllers/permission.controller.js";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(
    authMiddleware.protect,
    // requirePermission("admin.permission.read"),
    permissionController.getAllPermissions,
  )
  .post(
    authMiddleware.protect,
    // requirePermission("admin.permission.create"),
    permissionController.createPermission,
  );

router
  .route("/:id")
  .get(
    authMiddleware.protect,
    // requirePermission("admin.permission.read"),
    permissionController.getPermissionById,
  )
  .patch(
    authMiddleware.protect,
    // requirePermission("admin.permission.update"),
    permissionController.updatePermission,
  )
  .delete(
    authMiddleware.protect,
    // requirePermission("admin.permission.delete"),
    permissionController.deletePermission,
  );

export default router;
