import express from "express";
import * as careersController from "../careers.controller.js";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

// Job Applications Admin
router.route("/applications")
  .get(authMiddleware.protect, requirePermission("website.careers.application.read"), careersController.getApplications);

router.route("/applications/:id")
  .get(authMiddleware.protect, requirePermission("website.careers.application.read"), careersController.getApplicationById)
  .delete(authMiddleware.protect, requirePermission("website.careers.application.delete"), careersController.deleteApplication);

router.route("/applications/:id/status")
  .patch(authMiddleware.protect, requirePermission("website.careers.application.update"), careersController.updateApplicationStatus);

// Career Job Openings CRUD
router.route("/")
  .post(authMiddleware.protect, requirePermission("website.careers.job.create"), careersController.addCareer)
  .get(authMiddleware.protect, requirePermission("website.careers.job.read"), careersController.getCareers);

router.route("/:id/toggle-status")
  .patch(authMiddleware.protect, requirePermission("website.careers.job.update"), careersController.toggleCareerStatus);

router.route("/:id")
  .get(authMiddleware.protect, requirePermission("website.careers.job.read"), careersController.getCareerById)
  .patch(authMiddleware.protect, requirePermission("website.careers.job.update"), careersController.updateCareer)
  .delete(authMiddleware.protect, requirePermission("website.careers.job.delete"), careersController.deleteCareer);

router.route("/:id/applications")
  .get(authMiddleware.protect, requirePermission("website.careers.application.read"), careersController.getApplicationsForJob);

export default router;
