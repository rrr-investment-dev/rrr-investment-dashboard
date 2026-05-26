import fs from "fs";
import path from "path";
import User from "./user.model.js";
import RoleType from "../roleType/roleType.model.js";
import UserPermissionOverride from "../permissions/models/userPermissionOverride.model.js";
import RolePermission from "../permissions/models/rolePermission.model.js";
import Permission from "../permissions/models/permission.model.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../common/Utils/catchAsync.js";
import mongoose from "mongoose";
import { logActivity } from "../../../common/Utils/activityLogger.js";

const deleteFileIfExists = (filePath) => {
  if (!filePath) return;

  try {
    const normalizedPath = filePath.replace(/^\/+/, "").replace(/\\/g, "/");
    const absolutePath = path.resolve(normalizedPath);
    if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch (err) {
    console.error("File delete error:", err);
  }
};

// API's for User

const resolveKeysToIds = async (keysArr) => {
  if (!keysArr || keysArr.length === 0) return [];
  const normalizedKeys = keysArr.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
  if (normalizedKeys.length === 0) return [];
  const uniqueKeys = [...new Set(normalizedKeys)];

  // Separate keys into IDs and functional keys
  const ids = [];
  const keys = [];

  uniqueKeys.forEach(item => {
    if (mongoose.Types.ObjectId.isValid(item) && item.length === 24) {
      ids.push(item);
    } else {
      keys.push(item);
    }
  });

  // Find permissions matching either the _id or the key
  const existingPermissions = await Permission.find({
    $or: [
      { _id: { $in: ids } },
      { key: { $in: keys } }
    ]
  });

  if (existingPermissions.length !== uniqueKeys.length) {
    const foundIds = existingPermissions.map(p => p._id.toString());
    const foundKeys = existingPermissions.map(p => p.key);
    
    const missing = uniqueKeys.filter(item => 
      !foundIds.includes(item) && !foundKeys.includes(item)
    );

    throw new AppErrorClass(`Invalid permission key(s) or ID(s): ${missing.join(", ")}`, 400);
  }
  return existingPermissions.map((p) => p._id);
};

export const createUser = catchAsync(async (req, res, next) => {
  const {
    name,
    designation,
    mobile,
    email,
    role,
    grantedPermissions: rawGranted = [],
    revokedPermissions: rawRevoked = [],
  } = req.body;

  let grantedPermissions = rawGranted;
  let revokedPermissions = rawRevoked;

  try {
    if (typeof grantedPermissions === "string") {
      grantedPermissions = JSON.parse(grantedPermissions);
    }
  } catch (err) {}

  try {
    if (typeof revokedPermissions === "string") {
      revokedPermissions = JSON.parse(revokedPermissions);
    }
  } catch (err) {}

  const existingUser = await User.findOne({
    $or: [{ email }, { mobile }],
  });
  if (existingUser) {
    return next(new AppErrorClass("User already exists", 400));
  }

  const userRole = await RoleType.findOne({ _id: role, isActive: true });
  if (!userRole) {
    return next(new AppErrorClass("Invalid role type selected", 400));
  }

  if (grantedPermissions !== undefined && !Array.isArray(grantedPermissions)) {
    return next(new AppErrorClass("grantedPermissions must be an array", 400));
  }

  if (revokedPermissions !== undefined && !Array.isArray(revokedPermissions)) {
    return next(new AppErrorClass("revokedPermissions must be an array", 400));
  }

  // Find all users with a valid numeric usr_id format (USR or USR_ followed by digits)
  const usersWithUsrId = await User.find(
    { usr_id: { $regex: /^USR_?\d+$/ } },
    { usr_id: 1 }
  );

  let nextNumber = 1; // Default start
  if (usersWithUsrId.length > 0) {
    const numbers = usersWithUsrId
      .map((u) => parseInt(u.usr_id.replace(/\D/g, ""), 10))
      .filter((num) => !isNaN(num));
    if (numbers.length > 0) {
      nextNumber = Math.max(...numbers) + 1;
    }
  }

  // Resolve permission keys to IDs
  let grantedIds = [];
  let revokedIds = [];
  if (grantedPermissions !== undefined) {
    grantedIds = await resolveKeysToIds(grantedPermissions);
  }
  if (revokedPermissions !== undefined) {
    revokedIds = await resolveKeysToIds(revokedPermissions);
  }

  // Generate user ID
  const usr_id = `USR_${String(nextNumber).padStart(3, "0")}`;

  let image = undefined;
  if (req.file) {
    image = `/${req.file.path.replace(/\\/g, "/")}`;
  }

  const user = await User.create({
    name,
    designation,
    mobile,
    email,
    role,
    usr_id,
    image,
  });

  let override;
  if (grantedIds.length > 0 || revokedIds.length > 0) {
    override = await UserPermissionOverride.create({
      userId: user._id,
      grantedPermissions: grantedIds,
      revokedPermissions: revokedIds,
    });
  }

  // Log administrative activity
  await logActivity({
    action: "New user registered",
    detail: `${user.email} added to system`,
    module: "admin",
    userId: req.user?.id || null,
  });

  res.status(201).json({
    message: "New User created successfully",
    data: {
      user,
      override: override || null,
      usr_id,
    },
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { includeInactiveUser } = req.query;

  const filter = {};
  if (includeInactiveUser !== "true") {
    filter.isActive = true;
  }

  const users = await User.find(filter).populate("role");
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

  // 1. Use the unified utility to get all active permission IDs
  const { getEffectivePermissionIdsForUser } = await import("../../../common/Utils/permission.util.js");
  const effectivePermissionIds = await getEffectivePermissionIdsForUser(user._id);

  // 2. Load user overrides specifically for the response metadata
  const userOverride = await UserPermissionOverride.findOne({
    userId: user._id,
  }).populate(["grantedPermissions", "revokedPermissions"]);

  // 3. Fetch full permission details for the final set
  const allPermissions = await Permission.find({
    _id: { $in: effectivePermissionIds }
  }).lean();

  const userWithPermissions = {
    ...user.toObject(),
    permissions: allPermissions,
    permissionOverride: userOverride || null,
  };

  res.status(200).json({
    message: "User fetched successfully",
    data: userWithPermissions,
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    designation,
    mobile,
    email,
    role,
    grantedPermissions: rawGranted,
    revokedPermissions: rawRevoked,
  } = req.body;

  let grantedPermissions = rawGranted;
  let revokedPermissions = rawRevoked;

  try {
    if (typeof grantedPermissions === "string") {
      grantedPermissions = JSON.parse(grantedPermissions);
    }
  } catch (err) {}

  try {
    if (typeof revokedPermissions === "string") {
      revokedPermissions = JSON.parse(revokedPermissions);
    }
  } catch (err) {}

  // Validate role if provided
  if (role !== undefined) {
    const userRole = await RoleType.findOne({ _id: role, isActive: true });
    if (!userRole) {
      return next(new AppErrorClass("Invalid role type selected", 400));
    }
  }

  // Validate permissions arrays if provided
  if (grantedPermissions !== undefined && !Array.isArray(grantedPermissions)) {
    return next(new AppErrorClass("grantedPermissions must be an array", 400));
  }

  if (revokedPermissions !== undefined && !Array.isArray(revokedPermissions)) {
    return next(new AppErrorClass("revokedPermissions must be an array", 400));
  }

  // Build update data dynamically
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (designation !== undefined) updateData.designation = designation;
  if (mobile !== undefined) updateData.mobile = mobile;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;

  if (req.file) {
    const existingUser = await User.findById(id);
    if (existingUser && existingUser.image) {
      deleteFileIfExists(existingUser.image);
    }
    updateData.image = `/${req.file.path.replace(/\\/g, "/")}`;
  }

  // Update user
  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("role");
  if (!user) {
    return next(new AppErrorClass("User not found", 404));
  }

  // Fetch role default permissions
  const rolePermission = user.role
    ? await RolePermission.findOne({
      roleTypeId: new mongoose.Types.ObjectId(user.role._id),
    }).populate("permissionIds")
    : null;

  // Get role permission IDs
  const rolePermissionIds =
    rolePermission && rolePermission.permissionIds
      ? rolePermission.permissionIds.map((p) => p._id.toString())
      : [];

  // Handle permissions
  let override = await UserPermissionOverride.findOne({ userId: id }).populate([
    "grantedPermissions",
    "revokedPermissions",
  ]);

  if (grantedPermissions !== undefined || revokedPermissions !== undefined) {
    const updateFields = {};

    let grantedIds = undefined;
    let revokedIds = undefined;

    if (grantedPermissions !== undefined) {
      grantedIds = await resolveKeysToIds(grantedPermissions);
    }
    if (revokedPermissions !== undefined) {
      revokedIds = await resolveKeysToIds(revokedPermissions);
    }

    if (grantedIds !== undefined) {
      // grantedPermissions is the complete list of custom permissions the user should have
      const validGranted = grantedIds.filter(
        (permId) => !rolePermissionIds.includes(permId.toString()),
      );
      updateFields.grantedPermissions = [...new Set(validGranted)];
    }

    if (revokedIds !== undefined) {
      // revokedPermissions is the complete list of role permissions to revoke
      const validRevoked = revokedIds.filter((permId) =>
        rolePermissionIds.includes(permId.toString()),
      );
      updateFields.revokedPermissions = [...new Set(validRevoked)];
    }

    if (override) {
      // Use $set to properly handle empty arrays
      const updateQuery = {};
      if (grantedPermissions !== undefined) {
        updateQuery.grantedPermissions = updateFields.grantedPermissions || [];
      }
      if (revokedPermissions !== undefined) {
        updateQuery.revokedPermissions = updateFields.revokedPermissions || [];
      }
      override = await UserPermissionOverride.findByIdAndUpdate(
        override._id,
        { $set: updateQuery },
        { new: true },
      ).populate(["grantedPermissions", "revokedPermissions"]);
    } else {
      // Only create if there are permissions to set
      if (
        updateFields.grantedPermissions?.length > 0 ||
        updateFields.revokedPermissions?.length > 0
      ) {
        override = await UserPermissionOverride.create({
          userId: id,
          ...updateFields,
        });
        override = await UserPermissionOverride.findById(override._id).populate(
          ["grantedPermissions", "revokedPermissions"],
        );
      }
    }
  } else if (override) {
    // If no permission data provided, keep existing
    override = await UserPermissionOverride.findById(override._id).populate([
      "grantedPermissions",
      "revokedPermissions",
    ]);
  }

  // Process permissions
  let allPermissions = [];
  const grantedPermissionIds = new Set();
  const revokedPermissionIds = new Set();

  // Add role default permissions
  if (rolePermission && rolePermission.permissionIds) {
    allPermissions = rolePermission.permissionIds.map((p) => p.toObject());
    rolePermission.permissionIds.forEach((p) =>
      grantedPermissionIds.add(p._id.toString()),
    );
  }

  // Apply user overrides
  if (override) {
    // Add granted permissions
    if (override.grantedPermissions && override.grantedPermissions.length > 0) {
      override.grantedPermissions.forEach((permission) => {
        const permId = permission._id.toString();
        // Only add if not already in role defaults
        if (!grantedPermissionIds.has(permId)) {
          allPermissions.push(permission.toObject());
          grantedPermissionIds.add(permId);
        }
      });
    }

    // Remove revoked permissions
    if (override.revokedPermissions && override.revokedPermissions.length > 0) {
      override.revokedPermissions.forEach((permission) => {
        revokedPermissionIds.add(permission._id.toString());
      });
      allPermissions = allPermissions.filter(
        (p) => !revokedPermissionIds.has(p._id.toString()),
      );
    }
  }

  const userWithPermissions = {
    ...user.toObject(),
    permissions: allPermissions,
    permissionOverride: override || null,
  };

  // Log administrative activity
  await logActivity({
    action: "User updated",
    detail: `Profile for ${user.email} was revised`,
    module: "admin",
    userId: req.user?.id || null,
  });

  res.status(200).json({
    message: "User updated successfully",
    data: userWithPermissions,
  });
});

export const toggleUserStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new AppErrorClass("isActive must be boolean", 400));
  }

  // Fetch the user with role to check details
  const user = await User.findById(id).populate("role");
  if (!user) {
    return next(new AppErrorClass("User not found", 404));
  }

  // Check if trying to deactivate an Admin user
  const isAdminRole =
    user.role &&
    (user.role.roleType.toLowerCase().includes("admin") ||
      user.role.displayRoleName.toLowerCase().includes("admin"));

  if (!isActive && isAdminRole) {
    // Check if there are other active admin users
    const activeAdminCount = await User.countDocuments({
      _id: { $ne: id },
      isActive: true,
      role: {
        $in: await RoleType.find({
          $or: [
            { roleType: { $regex: "admin", $options: "i" } },
            { displayRoleName: { $regex: "admin", $options: "i" } },
          ],
        }).distinct("_id"),
      },
    });

    if (activeAdminCount === 0) {
      return next(
        new AppErrorClass(
          "Cannot deactivate the last active Admin user. At least one Admin user must remain active for system operations.",
          400,
        ),
      );
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true },
  );
  if (!updatedUser) {
    return next(new AppErrorClass("User not found", 404));
  }

  // Log administrative activity
  await logActivity({
    action: "User updated",
    detail: `Account for ${updatedUser.email} ${isActive ? "activated" : "deactivated"}`,
    module: "admin",
    userId: req.user?.id || null,
  });

  res.status(200).json({
    status: "success",
    message: `User ${isActive ? "activated" : "inactivated"} successfully`,
  });
});
