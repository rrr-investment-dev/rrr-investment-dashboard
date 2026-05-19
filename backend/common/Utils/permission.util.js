import mongoose from "mongoose";
import User from "../../modules/admin/user/user.model.js";
import Permission from "../../modules/admin/permissions/models/permission.model.js";
import RolePermission from "../../modules/admin/permissions/models/rolePermission.model.js";
import UserPermissionOverride from "../../modules/admin/permissions/models/userPermissionOverride.model.js";
import AppErrorClass from "./AppErrorClass.js";

export async function getEffectivePermissionIdsForUser(userId) {
  // 1. Load user
  const user = await User.findById(userId).lean();
  if (!user) throw new AppErrorClass("User not found", 404);

  const finalSet = new Set();

  // 2. Load role's default permissions
  if (user.role) {
    const rolePermissionDefault = await RolePermission.findOne({
      roleTypeId: new mongoose.Types.ObjectId(user.role.toString()),
    }).lean();

    if (rolePermissionDefault?.permissionIds) {
      rolePermissionDefault.permissionIds.forEach((id) => {
        if (id) finalSet.add(id.toString());
      });
    }
  }

  // 3. Load user overrides (Try both ObjectId and String to be safe)
  const override = await UserPermissionOverride.findOne({
    $or: [
      { userId: new mongoose.Types.ObjectId(user._id.toString()) },
      { userId: user._id.toString() }
    ]
  }).lean();

  if (override) {
    const extractId = (item) => {
      if (!item) return null;
      if (typeof item === 'string') return item;
      if (item._id) return item._id.toString();
      return item.toString();
    };

    // Add granted permissions
    if (Array.isArray(override.grantedPermissions)) {
      override.grantedPermissions.forEach((p) => {
        const id = extractId(p);
        if (id && id !== "[object Object]") finalSet.add(id);
      });
    }
    // Remove revoked permissions
    if (Array.isArray(override.revokedPermissions)) {
      override.revokedPermissions.forEach((p) => {
        const id = extractId(p);
        if (id && id !== "[object Object]") finalSet.delete(id);
      });
    }
  }

  // 4. Return as ObjectIds
  return Array.from(finalSet).map((idStr) => new mongoose.Types.ObjectId(idStr));
}

export async function getEffectivePermissionKeysForUser(userId) {
  const permissionIds = await getEffectivePermissionIdsForUser(userId);

  if (!permissionIds.length) return [];

  const permissions = await Permission.find({
    _id: { $in: permissionIds }
  }).lean();

  return permissions.map((p) => p.key);
}
