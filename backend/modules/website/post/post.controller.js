import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../common/Utils/catchAsync.js";
import {
  createPost as createPostService,
  getAllPosts as getAllPostsService,
  getPostById as getPostByIdService,
  updatePost as updatePostService,
  togglePostStatus as togglePostStatusService,
  deletePost as deletePostService,
  getPublishedPosts as getPublishedPostsService,
  getPublishedPostById as getPublishedPostByIdService,
} from "./post.service.js";
import { logActivity } from "../../../common/Utils/activityLogger.js";

// Admin
export const createPost = catchAsync(async (req, res, next) => {
  const { title, subTitle, description, link, platform } = req.body;
  const creatorId = req?.user?._id;
  const imagePath = req?.file
    ? `/${req?.file?.path.replace(/\\/g, "/")}`
    : undefined;

  if (!title || !creatorId) {
    return next(
      new AppErrorClass("Title and creator ID are required", 400),
    );
  }

  const { post, error } = await createPostService({
    title,
    subTitle,
    description,
    link,
    image: imagePath,
    platform,
    user: creatorId,
  });

  if (error) {
    return next(error);
  }

  // Log administrative activity
  await logActivity({
    action: "Post published",
    detail: `"${post.title}" is now live`,
    module: "website",
    userId: req.user?.id || req.user?._id || creatorId || null,
  });

  res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: { post },
  });
});

export const getAllPosts = catchAsync(async (req, res) => {
  const { page, limit, platform, search, status } = req.query;

  const result = await getAllPostsService({
    page,
    limit,
    platform,
    search,
    status,
  });

  res.status(200).json({
    status: "success",
    message: "Posts fetched successfully",
    data: result,
  });
});

export const getPostById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { post, error } = await getPostByIdService(id);

  if (error) {
    return next(error);
  }

  res.status(200).json({
    status: "success",
    message: "Post fetched successfully",
    data: { post },
  });
});

export const togglePostStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["published", "unpublished"].includes(status)) {
    return next(new AppErrorClass("Invalid status", 400));
  }

  const { post, error } = await togglePostStatusService(id, status);

  if (error) {
    return next(error);
  }

  // Log administrative activity
  await logActivity({
    action: "Post updated",
    detail: `"${post.title}" is now ${post.status}`,
    module: "website",
    userId: req.user?.id || req.user?._id || null,
  });

  res.status(200).json({
    status: "success",
    message: `${post.title} ${post.status.toUpperCase()} successfully`,
    data: { post },
  });
});

export const updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppErrorClass("Post ID is required", 400));
  }

  const dataToUpdate = {
    ...req.body,
  };

  const imagePath = req?.file
    ? `/${req?.file?.path.replace(/\\/g, "/")}`
    : undefined;

  if (imagePath) {
    dataToUpdate.image = imagePath;
  }

  const { updatedPost, error } = await updatePostService(id, dataToUpdate);

  if (error) {
    return next(error);
  }

  // Log administrative activity
  await logActivity({
    action: "Post updated",
    detail: `"${updatedPost.title}" was revised`,
    module: "website",
    userId: req.user?.id || req.user?._id || null,
  });

  res.status(200).json({
    status: "success",
    message: "Post updated successfully",
    data: { updatedPost },
  });
});

export const deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppErrorClass("Post ID is required", 400));
  }

  const { post, error } = await deletePostService(id);

  if (error) {
    return next(error);
  }

  // Log administrative activity
  await logActivity({
    action: "Post deleted",
    detail: `"${post.title}" was removed`,
    module: "website",
    userId: req.user?.id || req.user?._id || null,
  });

  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
    data: post,
  });
});

// Public

export const getPublishedPosts = catchAsync(async (req, res) => {
  const { page, limit } = req.query;

  const result = await getPublishedPostsService({
    page,
    limit,
  });

  res.status(200).json({
    status: "success",
    message: "Posts fetched successfully",
    data: result,
  });
});

export const getPublishedPostById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppErrorClass("Post ID is required", 400));
  }

  const { post, error } = await getPublishedPostByIdService(id);

  if (error) {
    return next(error);
  }

  res.status(200).json({
    status: "success",
    message: "Post fetched successfully",
    data: { post },
  });
});
