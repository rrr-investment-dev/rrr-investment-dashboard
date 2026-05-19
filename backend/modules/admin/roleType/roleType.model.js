import mongoose from "mongoose";

const roleTypeSchema = new mongoose.Schema(
  {
    roleType: { type: String, required: true, unique: true },
    role_id: { type: String, unique: true },
    displayRoleName: { type: String, required: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const RoleType = mongoose.model("UserRoleTypeMaster", roleTypeSchema);

export default RoleType;
