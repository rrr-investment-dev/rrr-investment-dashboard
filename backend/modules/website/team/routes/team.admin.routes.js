import express from "express";
import * as teamController from "../team.controller.js";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { createUploader } from "../../../../common/middlewares/upload.middleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

const uploadTeamImage = createUploader({ folder: "teams", prefix: "team", type: "image" });

router.route("/")
    .post(authMiddleware.protect, requirePermission('website.team.create'), uploadTeamImage.single("image"), teamController.addTeamMember)
    .get(authMiddleware.protect, requirePermission('website.team.read'), teamController.getTeamMembers);

router.route("/:id/toggle-status")
    .patch(authMiddleware.protect, requirePermission('website.team.update'), teamController.toggleTeamMemberStatus);

router.route("/:id")
    .get(authMiddleware.protect, requirePermission('website.team.read'), teamController.getTeamMemberById)
    .patch(authMiddleware.protect, requirePermission('website.team.update'), uploadTeamImage.single("image"), teamController.updateTeamMember)
    .delete(authMiddleware.protect, requirePermission('website.team.delete'), teamController.deleteTeamMember);

export default router;
