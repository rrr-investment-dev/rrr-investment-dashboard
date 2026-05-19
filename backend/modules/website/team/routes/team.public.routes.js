import express from "express";
import * as teamController from "../team.controller.js";

const router = express.Router();

router.route("/").get(teamController.getTeamMembersPublic);

export default router;