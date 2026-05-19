import crypto from "crypto";
import jwt from "jsonwebtoken";
import Otp from "./otp.model.js";
import RefreshToken from "./refreshToken.model.js";
import User from "../user/user.model.js";
import { getEffectivePermissionKeysForUser } from "../../../common/Utils/permission.util.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import sendEmail from "../../../common/Utils/sendEmail.js";

export const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const refreshExp = process.env.JWT_REFRESH_EXPIRES_IN;
    const days = parseInt(refreshExp);

    const refreshTokenDoc = new RefreshToken({
      userId: user._id,
      refreshToken: refreshToken,
      expiresOn: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    });

    await refreshTokenDoc.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new AppErrorClass("Error generating access and refresh tokens", 500);
  }
};

export const createAndSendOTP = async (identifier) => {
  if (!identifier) {
    throw new AppErrorClass("Identifier is required", 400);
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const isMobile = /^[0-9]{10}$/.test(identifier);

  if (!isEmail && !isMobile) {
    throw new AppErrorClass("Invalid identifier format", 400);
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { mobile: identifier }],
  });

  if (!user) {
    throw new AppErrorClass("User not found", 404);
  }

  if (!user.isActive) {
    throw new AppErrorClass("Your account is inactive. Please contact the administrator.", 403);
  }

  await Otp.deleteMany({ userId: user._id });

  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const otpDoc = new Otp({
    userId: user._id,
    otp: hashedOTP,
    otpExpiresOn: Date.now() + 10 * 60 * 1000,
  });

  await otpDoc.save({ validateBeforeSave: false });

  if (isEmail) {
    const message = `Your login OTP is ${otp}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Login Verification</h2>
        <p>Your One Time Password (OTP) for RRR Investments Dashboard is:</p>
        <h1 style="color: #4f46e5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your OTP for RRR Investments Dashboard",
        message,
        html,
      });
    } catch (error) {
      await Otp.deleteMany({ userId: user._id });
      throw new AppErrorClass("There was an error sending the OTP email. Try again later!", 500);
    }
  }

  // TODO: Add SMS sending logic here if (isMobile)

  return { user, otp };
};

export const verifyOTPAndLogin = async (otpInput) => {
  if (!otpInput) {
    throw new AppErrorClass("OTP is required", 400);
  }

  const hashedOTP = crypto.createHash("sha256").update(otpInput).digest("hex");

  const otpRecord = await Otp.findOne({
    otp: hashedOTP,
    otpExpiresOn: { $gt: Date.now() },
  });

  if (!otpRecord) {
    throw new AppErrorClass("OTP Invalid or expired", 400);
  }

  const user = await User.findById(otpRecord.userId).populate("role");

  if (!user) {
    throw new AppErrorClass("User not found", 404);
  }

  if (!user.isActive) {
    throw new AppErrorClass("Your account is inactive. Please contact the administrator.", 403);
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
  const permissionKeys = await getEffectivePermissionKeysForUser(user._id);

  return { user, accessToken, refreshToken, permissionKeys };
};

export const refreshAccessToken = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new AppErrorClass("Unauthorized - Refresh Token Missing", 401);
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    throw new AppErrorClass("Invalid or expired refresh token", 401);
  }

  const storedToken = await RefreshToken.findOne({
    userId: decodedRefreshToken.id,
    refreshToken: incomingRefreshToken,
  });

  if (!storedToken) {
    throw new AppErrorClass("Refresh token not found or revoked", 401);
  }

  const user = await User.findById(decodedRefreshToken.id);
  if (!user) {
    throw new AppErrorClass("User not found", 401);
  }

  if (!user.isActive) {
    throw new AppErrorClass("Your account is inactive.", 403);
  }

  const newAccessToken = user.generateAccessToken();

  return { newAccessToken, user };
};

export const logoutUser = async (refreshToken) => {
  if (refreshToken) {
    await RefreshToken.findOneAndDelete({ refreshToken });
  }
  return true;
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate("role");

  if (!user) {
    throw new AppErrorClass("User not found", 404);
  }

  if (!user.isActive) {
    throw new AppErrorClass("Your account is inactive.", 403);
  }

  const permissionKeys = await getEffectivePermissionKeysForUser(user._id);

  return { user, permissionKeys };
};
