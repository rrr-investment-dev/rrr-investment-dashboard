import express from "express";
import * as contactController from "../contact.controller.js";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

// Middleware to protect all admin contact routes
router.use(authMiddleware.protect);

// FORM CONFIGURATION ROUTES

router.route("/config")
    .get(requirePermission('website.contact.config.read'), contactController.getFormConfigs)
    .post(requirePermission('website.contact.config.create'), contactController.createFormConfig);

router.patch("/config/reorder", requirePermission('website.contact.config.update'), contactController.reorderFormConfigs);

router.route("/config/:id")
    .get(requirePermission('website.contact.config.read'), contactController.getFormConfigById)
    .patch(requirePermission('website.contact.config.update'), contactController.updateFormConfig)
    .delete(requirePermission('website.contact.config.delete'), contactController.deleteFormConfig);

router.patch("/config/:id/status", requirePermission('website.contact.config.update'), contactController.toggleFormConfigStatus);


// INQUIRY ROUTES

router.route("/inquiries")
    .get(requirePermission('website.contact.inquiry.read'), contactController.getInquiries);

router.route("/inquiries/:id")
    .get(requirePermission('website.contact.inquiry.read'), contactController.getInquiryById)
    .delete(requirePermission('website.contact.inquiry.delete'), contactController.deleteInquiry);

router.patch("/inquiries/:id/status", requirePermission('website.contact.inquiry.update'), contactController.updateInquiryStatus);

export default router;
