import express from "express";
import postAdminRoutes from "../post/routes/post.admin.routes.js";
import teamAdminRoutes from "../team/routes/team.admin.routes.js";
import contactAdminRoutes from "../contact/routes/contact.admin.routes.js";

const router = express.Router();

// Private Admin Website Routes (Auth required)
// These routes are used to manage website content from the admin side.
// Example: router.post("/posts", websiteController.createPost);

router.use("/posts", postAdminRoutes)

router.use("/teams", teamAdminRoutes)

router.use("/contacts", contactAdminRoutes)

export default router;
