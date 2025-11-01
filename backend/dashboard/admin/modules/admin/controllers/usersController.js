import UserRoleTypeMaster from "../models/userRoleTypeModel.js";
import AppErrorClass from "./../../../../../common/Utils/AppErrorClass.js";
import catchAsync from "./../../../../../common/Utils/catchAsync.js";
import User from "../models/usersModel.js";

// API's for User

export const createUser = catchAsync(async (req, res, next) => {
  const { name, designation, mobile, email, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }],
  });
  if (existingUser) {
    return next(new AppErrorClass("User already exists", 400));
  }

  const userRole = await UserRoleTypeMaster.findOne({ _id: role });
  if (!userRole) {
    return next(new AppErrorClass("Invalid role type selected", 400));
  }

  const user = await User.create({
    name,
    designation,
    mobile,
    email,
    role,
  });
  res.status(201).json({
    message: "New User created successfully",
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate("role");
  res.status(200).json({
    message: "Users fetched successfully",
    data: users,
  });
});

export const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("role");
  if (!user) {
    return next(new AppErrorClass("User not found", 404));
  }
  res.status(200).json({
    message: "User fetched successfully",
    data: user,
  });
});

export const updateUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, designation, mobile, email, role } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    { name, designation, mobile, email, role },
    { updatedAt: Date.now() },
    { new: true }
  );
  if (!user) {
    return next(new AppErrorClass("User not found", 404));
  }
  res.status(200).json({
    message: "User updated successfully",
  });
});

export const inActiveUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { updateAt: Date.now() },
    { new: true }
  );
  if (!user) {
    return next(new AppErrorClass("User not found", 404));
  }
  res.status(200).json({
    message: "User InActive successfully",
  });
});
