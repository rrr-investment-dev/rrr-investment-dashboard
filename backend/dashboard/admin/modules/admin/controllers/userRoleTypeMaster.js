import UserRoleTypeMaster from "../models/userRoleTypeModel.js";
import AppErrorClass from "./../../../../../common/Utils/AppErrorClass.js";
import catchAsync from "./../../../../../common/Utils/catchAsync.js";

// API's for User role type master

export const createType = catchAsync(async (req, res, next) => {
  const { roleType } = req.body;

  const existingRole = await UserRoleTypeMaster.findOne({ roleType });
  if (existingRole) {
    return next(new AppErrorClass("Role type already exists", 400));
  }

  const userRoleType = await UserRoleTypeMaster.create({ roleType });
  res.status(201).json({
    message: "New Role created successfully",
  });
});

export const getTypeAll = catchAsync(async (req, res, next) => {
  const userRoleTypes = await UserRoleTypeMaster.find();
  res.status(200).json({
    message: "Role types fetched successfully",
    data: userRoleTypes,
  });
});

export const getTypeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userRoleType = await UserRoleTypeMaster.findById(id);
  if (!userRoleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }
  res.status(200).json({
    message: "Role type fetched successfully",
    data: userRoleType,
  });
});

export const updateTypeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { roleType } = req.body;
  const userRoleType = await UserRoleTypeMaster.findByIdAndUpdate(
    id,
    { roleType },
    {
      createdAt: Date.now(),
    },
    { new: true }
  );
  if (!userRoleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }

  res.status(200).json({
    message: "Role type updated successfully",
  });
});

export const inActiveTypeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userRoleType = await UserRoleTypeMaster.findByIdAndUpdate(
    id,
    { isActive: false },
    {
      createdAt: Date.now(),
    },
    { new: true }
  );
  if (!userRoleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }
  res.status(200).json({
    message: "Role type InActive successfully",
  });
});
