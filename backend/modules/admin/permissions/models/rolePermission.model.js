import mongoose from "mongoose";

const rolePermissionSchema = new mongoose.Schema(
  {
    roleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRoleTypeMaster",
      required: true,
      index: true,
      unique: true,
    },
    permissionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PermissionMaster",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const RolePermission = mongoose.model(
  "RolePermissionMaster",
  rolePermissionSchema,
);

export default RolePermission;
