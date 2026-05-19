import RolePermission from "../models/rolePermission.model.js";
import AppErrorClass from "../../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../../common/Utils/catchAsync.js";

export const createRolePermission = catchAsync(async (req, res, next) => {
  const { roleTypeId, permissionIds } = req.body;

  if (
    !roleTypeId ||
    !Array.isArray(permissionIds) ||
    permissionIds.length === 0
  ) {
    return next(
      new AppErrorClass("roleTypeId and permissionIds array are required", 400),
    );
  }

  const rolePermission = await RolePermission.create({
    roleTypeId,
    permissionIds,
  });
  res.status(201).json({
    status: "success",
    data: rolePermission,
  });
});

export const getAllRolePermissions = catchAsync(async (req, res, next) => {
  const rolePermissions = await RolePermission.find({})
    .populate("roleTypeId")
    .populate("permissionIds");
  res.status(200).json({
    status: "success",
    result: rolePermissions.length,
    data: rolePermissions,
  });
});

export const getRolePermissionById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const rolePermission = await RolePermission.findById(id)
    .populate("roleTypeId")
    .populate("permissionIds");

  if (!rolePermission) {
    return next(new AppErrorClass("Role permission not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: rolePermission,
  });
});

export const updateRolePermission = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    return next(new AppErrorClass("permissionIds array is required", 400));
  }

  const rolePermission = await RolePermission.findByIdAndUpdate(
    id,
    { permissionIds },
    { new: true, runValidators: true },
  );

  if (!rolePermission) {
    return next(new AppErrorClass("Role permission not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: rolePermission,
  });
});

export const deleteRolePermission = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const rolePermission = await RolePermission.findByIdAndDelete(id);

  if (!rolePermission) {
    return next(new AppErrorClass("Role permission not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Role permission deleted successfully",
  });
});
