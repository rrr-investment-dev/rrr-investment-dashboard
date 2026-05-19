import mongoose from "mongoose";
import RoleType from "./roleType.model.js";
import RolePermission from "../permissions/models/rolePermission.model.js";
import Permission from "../permissions/models/permission.model.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../common/Utils/catchAsync.js";
import { logActivity } from "../../../common/Utils/activityLogger.js";

export const createRoleType = catchAsync(async (req, res, next) => {
  const { roleName, roleDescription, permissions } = req.body;

  if (!roleName || typeof roleName !== "string" || !roleName.trim()) {
    return next(new AppErrorClass("roleName is required", 400));
  }

  const normalizedRoleType = roleName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") // spaces → underscore
    .replace(/[^\w]/g, ""); // remove special chars

  const existingRole = await RoleType.findOne({ roleType: normalizedRoleType });
  if (existingRole) {
    return next(new AppErrorClass("Role type already exists", 400));
  }

  // Find the highest existing role_id number
  const existingRolesWithRoleId = await RoleType.find({
    role_id: { $exists: true, $ne: null },
  })
    .sort({ role_id: -1 })
    .limit(1);

  let nextNumber = 1; // Default start
  if (existingRolesWithRoleId.length > 0) {
    const lastRoleId = existingRolesWithRoleId[0].role_id;
    const lastNumber = parseInt(lastRoleId.replace("ROLE", ""));
    nextNumber = lastNumber + 1;
  }

  // Generate role ID
  const role_id = `ROLE${String(nextNumber).padStart(2, "0")}`;

  // Validate permission keys if provided
  let permissionIds = [];
  if (permissions !== undefined) {
    if (!Array.isArray(permissions)) {
      return next(new AppErrorClass("permissions must be an array", 400));
    }

    const normalizedKeys = permissions
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((value) => value);

    if (normalizedKeys.length === 0) {
      return next(
        new AppErrorClass(
          "permissions array must have at least 1 valid key",
          400,
        ),
      );
    }

    const uniqueKeys = [...new Set(normalizedKeys)];

    const existingPermissions = await Permission.find({
      key: { $in: uniqueKeys },
    });
    if (existingPermissions.length !== uniqueKeys.length) {
      const existingKeys = existingPermissions.map((p) => p.key);
      const missingKeys = uniqueKeys.filter(
        (key) => !existingKeys.includes(key),
      );
      return next(
        new AppErrorClass(
          `Invalid permission key(s): ${missingKeys.join(", ")}`,
          400,
        ),
      );
    }

    permissionIds = existingPermissions.map((p) => p._id);
  }

  const newRole = await RoleType.create({
    roleType: normalizedRoleType,
    displayRoleName: roleName,
    description: roleDescription ? roleDescription.trim() : "",
    role_id,
  });

  // If permissions were validated and exist, create role-permission mapping
  if (permissionIds.length > 0) {
    await RolePermission.create({
      roleTypeId: newRole._id,
      permissionIds,
    });
  }

  // Log administrative activity
  await logActivity({
    action: "Role type created",
    detail: `Security role "${newRole.displayRoleName}" added`,
    module: "admin",
    userId: req.user?.id || null,
  });

  res.status(201).json({
    message: "New Role created successfully",
    // role_id,
    // data: newRole,
  });
});

export const getAllRoleTypes = catchAsync(async (req, res, next) => {
  const { includeInactiveRoleType } = req.query;

  const filter = {};
  if (includeInactiveRoleType !== "true") {
    filter.isActive = true;
  }

  const roleTypes = await RoleType.find(filter);
  res.status(200).json({
    message: "Role types fetched successfully",
    data: roleTypes,
  });
});

export const getRoleTypeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const roleType = await RoleType.findById(id);
  if (!roleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }
  res.status(200).json({
    message: "Role type fetched successfully",
    data: roleType,
  });
});

export const updateRoleType = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { roleName, roleDescription, permissions } = req.body;

  const updateData = {};
  let permissionIds = undefined;

  // Validate and update roleName
  if (roleName !== undefined) {
    if (typeof roleName !== "string" || !roleName.trim()) {
      return next(
        new AppErrorClass("roleName must be a non-empty string", 400),
      );
    }

    const normalizedRoleType = roleName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_") // spaces → underscore
      .replace(/[^\w]/g, ""); // remove special chars

    // Check if roleName already exists (excluding current role)
    const existingRole = await RoleType.findOne({
      roleType: normalizedRoleType,
      _id: { $ne: id },
    });
    if (existingRole) {
      return next(new AppErrorClass("Role name already exists", 400));
    }

    updateData.roleType = normalizedRoleType;
    updateData.displayRoleName = roleName;
  }

  // Validate and update description
  if (roleDescription !== undefined) {
    updateData.description =
      typeof roleDescription === "string" ? roleDescription.trim() : "";
  }

  // Validate permission keys if provided
  if (permissions !== undefined) {
    if (!Array.isArray(permissions)) {
      return next(new AppErrorClass("permissions must be an array", 400));
    }

    const normalizedKeys = permissions
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((value) => value);

    if (normalizedKeys.length > 0) {
      const uniqueKeys = [...new Set(normalizedKeys)];

      const existingPermissions = await Permission.find({
        key: { $in: uniqueKeys },
      });
      if (existingPermissions.length !== uniqueKeys.length) {
        const existingKeys = existingPermissions.map((p) => p.key);
        const missingKeys = uniqueKeys.filter(
          (key) => !existingKeys.includes(key),
        );
        return next(
          new AppErrorClass(
            `Invalid permission key(s): ${missingKeys.join(", ")}`,
            400,
          ),
        );
      }

      permissionIds = existingPermissions.map((p) => p._id);
    } else {
      // Empty array means clear all permissions
      permissionIds = [];
    }
  }

  // At least one field must be provided
  if (Object.keys(updateData).length === 0 && permissionIds === undefined) {
    return next(
      new AppErrorClass(
        "At least one field (roleName, roleDescription, or permissions) must be provided",
        400,
      ),
    );
  }

  // Update role details
  const updatedRoleType = await RoleType.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedRoleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }

  // Update permissions if provided (completely replace existing)
  if (permissionIds !== undefined) {
    await RolePermission.findOneAndUpdate(
      { roleTypeId: id },
      { permissionIds: permissionIds },
      { new: true, upsert: true, runValidators: true },
    );
  }

  // Log administrative activity
  await logActivity({
    action: "Role type updated",
    detail: `Security role "${updatedRoleType.displayRoleName}" revised`,
    module: "admin",
    userId: req.user?.id || null,
  });

  res.status(200).json({
    message: "Role type updated successfully",
  });
});

export const toggleRoleTypeStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new AppErrorClass("isActive must be boolean", 400));
  }

  // Fetch the role to check its details
  const roleType = await RoleType.findById(id);
  if (!roleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }

  // Check if trying to deactivate an Admin/SuperAdmin role
  const isAdminRole =
    roleType.roleType.toLowerCase().includes("admin") ||
    roleType.displayRoleName.toLowerCase().includes("admin");

  if (!isActive && isAdminRole) {
    // Check if there are other active admin roles
    const activeAdminCount = await RoleType.countDocuments({
      _id: { $ne: id },
      isActive: true,
      $or: [
        { roleType: { $regex: "admin", $options: "i" } },
        { displayRoleName: { $regex: "admin", $options: "i" } },
      ],
    });

    if (activeAdminCount === 0) {
      return next(
        new AppErrorClass(
          "Cannot deactivate the last active Admin role. At least one Admin role must remain active for system operations.",
          400,
        ),
      );
    }
  }

  const updatedRoleType = await RoleType.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true },
  );
  if (!updatedRoleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }

  // Log administrative activity
  await logActivity({
    action: "Role type updated",
    detail: `Security role "${updatedRoleType.displayRoleName}" ${isActive ? "activated" : "deactivated"}`,
    module: "admin",
    userId: req.user?.id || null,
  });

  res.status(200).json({
    status: "success",
    message: `Role type ${isActive ? "activated" : "deactivated"} successfully`,
  });
});

export const getRoleWithPermissions = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const roleType = await RoleType.findById(id);
  if (!roleType) {
    return next(new AppErrorClass("Role type not found", 404));
  }

  const rolePermission = await RolePermission.findOne({
    roleTypeId: new mongoose.Types.ObjectId(id),
  }).populate("permissionIds");

  res.status(200).json({
    message: "Role with permissions fetched successfully",
    data: {
      role: roleType,
      permissions: rolePermission ? rolePermission.permissionIds : [],
    },
  });
});
