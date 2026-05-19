import express from "express";
import * as userPermissionOverrideController from "../controllers/userPermissionOverride.controller.js";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

// User Permission Override routes
router
  .route("/")
  .get(
    authMiddleware.protect,
    requirePermission("admin.userPermissionOverride.read"),
    userPermissionOverrideController.getAllUserPermissionOverrides,
  )
  .post(
    authMiddleware.protect,
    requirePermission("admin.userPermissionOverride.create"),
    userPermissionOverrideController.createUserPermissionOverride,
  );

router
  .route("/:id")
  .get(
    authMiddleware.protect,
    requirePermission("admin.userPermissionOverride.read"),
    userPermissionOverrideController.getUserPermissionOverrideById,
  )
  .patch(
    authMiddleware.protect,
    requirePermission("admin.userPermissionOverride.update"),
    userPermissionOverrideController.updateUserPermissionOverride,
  )
  .delete(
    authMiddleware.protect,
    requirePermission("admin.userPermissionOverride.delete"),
    userPermissionOverrideController.deleteUserPermissionOverride,
  );

export default router;
