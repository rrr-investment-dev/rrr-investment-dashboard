import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserRoleTypeMaster",
      required: true,
    },
    isActive: { type: Boolean, default: true },
    image: { type: String, trim: true },
    usr_id: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

userSchema.methods.generateAccessToken = function () {
  const payload = {
    id: this._id,
    name: this.name,
    designation: this.designation,
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const User = mongoose.model("User", userSchema);

export default User;
