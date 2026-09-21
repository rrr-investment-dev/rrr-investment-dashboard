import express from "express";
import * as careersController from "../careers.controller.js";
import { createUploader } from "../../../../common/middlewares/upload.middleware.js";

const router = express.Router();

const uploadResume = createUploader({ folder: "resumes", prefix: "resume", type: "document" });

// Public Job Board Endpoints
router.route("/").get(careersController.getCareersPublic);
router.route("/:id").get(careersController.getCareerByIdPublic);
router.route("/:id/apply").post(uploadResume.single("resume"), careersController.submitApplication);

export default router;
