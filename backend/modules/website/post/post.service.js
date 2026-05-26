import fs from "fs";
import path from "path";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import Post from "./post.model.js";
import { deleteFile } from "../../../common/Utils/upload.util.js";

// Admin

export const createPost = async (data) => {
  const post = await Post.create(data);

  if (!post) {
    return { post, error: new AppErrorClass("Post not created", 500) };
  }

  return { post, error: null };
};

export const getAllPosts = async ({
  page = 1,
  limit = 10,
  platform,
  search,
  status,
}) => {
  const skip = (page - 1) * limit;

  // filter
  const filter = {};

  if (status && ["published", "unpublished"].includes(status)) {
    filter.status = status;
  }

  if (platform) {
    filter.platform = platform;
  }

  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  // Query
  const posts = await Post.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Count
  const total = await Post.countDocuments(filter);

  return {
    posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPostById = async (postID) => {
  const post = await Post.findById(postID).populate("user", "name email");

  if (!post) {
    return { post, error: new AppErrorClass("Post not found", 404) };
  }

  return { post, error: null };
};

export const togglePostStatus = async (postID, status) => {
  const post = await Post.findOne({
    _id: postID,
  });

  if (!post) {
    return { post, error: new AppErrorClass("Post not found", 404) };
  }

  if (post.status === status) {
    return { post, error: new AppErrorClass(`Post is already ${status}`, 400) };
  }

  const updatedPost = await Post.findOneAndUpdate(
    {
      _id: postID,
    },
    {
      status,
    },
    {
      new: true,
      runValidators: true,
    },
  ).populate("user", "name email");

  return { post: updatedPost, error: null };
};

export const updatePost = async (postID, data) => {
  const existingPost = await Post.findOne({ _id: postID });

  if (!existingPost) {
    return {
      updatedPost: null,
      error: new AppErrorClass("Post not found", 404),
    };
  }

  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  if (data.image && existingPost.image && data.image !== existingPost.image) {
    await deleteFile(existingPost.image);
  }

  const updatedPost = await Post.findOneAndUpdate({ _id: postID }, data, {
    new: true,
    runValidators: true,
  }).populate("user", "name email");

  return { updatedPost, error: null };
};

export const deletePost = async (postID) => {
  const post = await Post.findOne({ _id: postID });

  if (!post) {
    return { post, error: new AppErrorClass("Post not found", 404) };
  }

  if (post.image) {
    await deleteFile(post.image);
  }

  await Post.deleteOne({ _id: postID });

  return { post, error: null };
};

// Public

export const getPublishedPosts = async ({ page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const filter = { status: "published" };

  const posts = await Post.find(filter)
    .select("_id title subTitle description link image platform createdAt") // 👈 only needed fields
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Post.countDocuments(filter);

  return {
    posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getPublishedPostById = async (postID) => {
  const post = await Post.findOne({
    _id: postID,
    status: "published",
  }).select("_id title subTitle description link image platform createdAt");

  if (!post) {
    return { post, error: new AppErrorClass("Post not found", 404) };
  }

  return { post, error: null };
};
