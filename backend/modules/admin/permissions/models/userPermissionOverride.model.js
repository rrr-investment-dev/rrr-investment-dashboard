import mongoose from "mongoose";

const userPermissionOverrideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },
    grantedPermissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PermissionMaster",
      },
    ],
    revokedPermissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PermissionMaster",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const UserPermissionOverride = mongoose.model(
  "UserPermissionOverride",
  userPermissionOverrideSchema,
);

export default UserPermissionOverride;
