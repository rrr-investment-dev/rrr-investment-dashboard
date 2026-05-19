import express from "express";
import * as authController from "./auth.controller.js";
import * as authMiddleware from "../../../common/middlewares/authMiddleware.js";

const router = express.Router();

router.post("/request-otp", authController.requestOTP);
router.post("/verify-otp", authController.verifyOTP);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authMiddleware.protect, authController.logout);
router.get("/me", authMiddleware.protect, authController.me);

export default router;
