import express from "express";
import * as authMiddleware from "../../../../common/middlewares/authMiddleware.js";
import { createUploader } from "../../../../common/middlewares/upload.middleware.js";
import { requirePermission } from "../../../../common/middlewares/requirePermissionMiddleware.js";

const router = express.Router();

import { getAllPosts, createPost, getPostById, updatePost, deletePost, togglePostStatus } from "../post.controller.js";

const uploadPostImage = createUploader({ folder: "posts", prefix: "post", type: "image" });

router.route("/")
    .get(authMiddleware.protect, requirePermission('website.posts.read'), getAllPosts)
    .post(authMiddleware.protect, requirePermission('website.posts.create'), uploadPostImage.single("image"), createPost);

router.route("/:id")
    .get(authMiddleware.protect, requirePermission('website.posts.read'), getPostById)
    .patch(authMiddleware.protect, requirePermission('website.posts.update'), uploadPostImage.single("image"), updatePost)
    .delete(authMiddleware.protect, requirePermission('website.posts.delete'), deletePost);


router.route("/:id/status")
    .patch(authMiddleware.protect, requirePermission('website.posts.update'), togglePostStatus);

export default router;