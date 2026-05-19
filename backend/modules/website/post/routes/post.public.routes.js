import express from "express";
import { getPublishedPostById, getPublishedPosts } from "../post.controller.js";

const router = express.Router();

router.get("/", getPublishedPosts);

router.get("/:id", getPublishedPostById);

export default router;