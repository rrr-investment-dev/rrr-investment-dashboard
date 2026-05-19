import Permission from "../models/permission.model.js";
import AppErrorClass from "../../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../../common/Utils/catchAsync.js";

export const createPermission = catchAsync(async (req, res, next) => {
  const { key, module, menu, subMenu, action, label, description, path, icon, order } = req.body;
  if (!key || !module || !action || !label) {
    return next(new AppErrorClass("All fields are required", 400));
  }
  const permission = await Permission.create({
    key,
    module,
    menu,
    subMenu,
    action,
    label,
    description,
    path,
    icon,
    order,
  });
  res.status(201).json({
    status: "success",
    data: permission,
  });
});

export const getAllPermissions = catchAsync(async (req, res, next) => {
  const permissions = await Permission.find({});
  res.status(200).json({
    status: "success",
    result: permissions.length,
    data: permissions,
  });
});

export const getPermissionById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const permission = await Permission.findById(id);
  if (!permission) {
    return next(new AppErrorClass("Permission not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: permission,
  });
});

export const updatePermission = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { key, module, menu, subMenu, action, label, description, isActive, path, icon, order } =
    req.body;

  const permission = await Permission.findByIdAndUpdate(
    id,
    { key, module, menu, subMenu, action, label, description, isActive, path, icon, order },
    { new: true, runValidators: true },
  );

  if (!permission) {
    return next(new AppErrorClass("Permission not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: permission,
  });
});

export const deletePermission = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const permission = await Permission.findByIdAndDelete(id);

  if (!permission) {
    return next(new AppErrorClass("Permission not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Permission deleted successfully",
  });
});
