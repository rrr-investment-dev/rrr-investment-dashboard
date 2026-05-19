import express from "express";
import * as contactController from "../contact.controller.js";

const router = express.Router();

router.get("/config", contactController.getActiveFormConfigsPublic);
router.post("/inquiries/submit", contactController.submitInquiryPublic);

export default router;
