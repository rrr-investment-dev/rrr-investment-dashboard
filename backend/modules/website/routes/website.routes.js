import express from "express";
import postRoutes from "../post/routes/post.public.routes.js";
import teamRoutes from "../team/routes/team.public.routes.js";
import contactRoutes from "../contact/routes/contact.public.routes.js";

const router = express.Router();

// Public Website Routes (No Auth required)
// Example: router.get("/posts", websiteController.getPublicPosts);

router.use("/posts", postRoutes)
router.use("/teams", teamRoutes)
router.use("/contacts", contactRoutes)

export default router;
