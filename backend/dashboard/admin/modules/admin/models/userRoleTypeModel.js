import mongoose from "mongoose";

const userRoleTypeSchema = new mongoose.Schema(
  {
    roleType: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserRoleTypeMaster = mongoose.model(
  "UserRoleTypeMaster",
  userRoleTypeSchema
);

export default UserRoleTypeMaster;
