import mongoose from "mongoose";

const jwtRefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresOn: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

jwtRefreshTokenSchema.index({ expiresOn: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model(
  "JwtRefreshToken",
  jwtRefreshTokenSchema,
);

export default RefreshToken;
