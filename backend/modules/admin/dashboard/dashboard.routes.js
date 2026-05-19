import express from "express";
import { getDashboardOverview, getAdminOverview } from "./dashboard.controller.js";

const router = express.Router();

router.get("/overview", getDashboardOverview);
router.get("/admin-overview", getAdminOverview);

export default router;
