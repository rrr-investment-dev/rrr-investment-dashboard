import * as authService from "./auth.service.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../common/Utils/catchAsync.js";

export const requestOTP = catchAsync(async (req, res, next) => {
  const { identifier } = req.body;

  const { otp } = await authService.createAndSendOTP(identifier);

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
    otp,
  });
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const { user, accessToken, refreshToken, permissionKeys } = await authService.verifyOTPAndLogin(otp);

  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  res.cookie("accessjwtoken", accessToken, {
    ...cookieOptions,
    expires: new Date(
      Date.now() + process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });

  res.cookie("refreshjwtoken", refreshToken, {
    ...cookieOptions,
    expires: new Date(
      Date.now() + process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });

  res.status(200).json({
    status: "success",
    message: "Login successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
    },
    permissions: permissionKeys,
    accessToken,
    refreshToken,
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshjwtoken;

  const { newAccessToken } = await authService.refreshAccessToken(incomingRefreshToken);

  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("accessjwtoken", newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: new Date(
      Date.now() + process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });

  res.status(200).json({
    status: "success",
    message: "Access token refreshed successfully",
    accessToken: newAccessToken,
  });
});

export const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshjwtoken;

  await authService.logoutUser(refreshToken);

  const isProduction = process.env.NODE_ENV === "production";
  const option = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  };

  res.clearCookie("accessjwtoken", option);
  res.clearCookie("refreshjwtoken", option);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const me = catchAsync(async (req, res, next) => {
  const { user, permissionKeys } = await authService.getCurrentUser(req.user.id);

  res.status(200).json({
    status: "success",
    user,
    permissionKeys,
  });
});
