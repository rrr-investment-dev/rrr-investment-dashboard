import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import "../roleType/roleType.model.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    designation: { type: String, required: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "UserRoleTypeMaster" },
    isActive: { type: Boolean, default: true },
    usr_id: { type: String, unique: true, index: true },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isNew && !this.usr_id) {
    const count = await mongoose.model("User").countDocuments();
    this.usr_id = `USR-${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});

userSchema.methods.generateAccessToken = function () {
  const payload = {
    id: this._id,
    name: this.name,
    designation: this.designation,
  };
  const accessSecret =
    process.env.JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    "default_jwt_secret_key_rrr";
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";

  return jwt.sign(payload, accessSecret, {
    expiresIn,
  });
};

userSchema.methods.generateRefreshToken = function () {
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET ||
    process.env.JWT_SECRET ||
    "default_jwt_secret_key_rrr";
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

  return jwt.sign({ id: this._id }, refreshSecret, {
    expiresIn,
  });
};

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
