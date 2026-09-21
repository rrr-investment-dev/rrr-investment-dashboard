import * as authService from "./auth.service.js";
import AppErrorClass from "../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../common/Utils/catchAsync.js";

const getCookieOptions = (req) => {
  const isSecure =
    process.env.NODE_ENV === "production" ||
    Boolean(process.env.VERCEL) ||
    req.secure ||
    req.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
  };
};

export const requestOTP = catchAsync(async (req, res, next) => {
  const { identifier } = req.body;

  const { otp } = await authService.createAndSendOTP(identifier);

  const isEmailMode = process.env.SEND_EMAIL === "true";

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
    // Only expose OTP in response on dev/staging (when email is not sent)
    ...(!isEmailMode && { otp }),
  });
});

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const { user, accessToken, refreshToken, permissionKeys } =
    await authService.verifyOTPAndLogin(otp);

  const cookieOptions = getCookieOptions(req);
  const accessDays = parseInt(process.env.JWT_ACCESS_COOKIE_EXPIRES_IN) || 1;
  const refreshDays = parseInt(process.env.JWT_REFRESH_COOKIE_EXPIRES_IN) || 30;

  res.cookie("accessjwtoken", accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + accessDays * 24 * 60 * 60 * 1000),
  });

  res.cookie("refreshjwtoken", refreshToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
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
      image: user.image,
    },
    permissions: permissionKeys,
    accessToken,
    refreshToken,
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const incomingRefreshToken =
    req.cookies?.refreshjwtoken || req.body?.refreshToken;

  const { newAccessToken } =
    await authService.refreshAccessToken(incomingRefreshToken);

  const cookieOptions = getCookieOptions(req);
  const accessDays = parseInt(process.env.JWT_ACCESS_COOKIE_EXPIRES_IN) || 1;

  res.cookie("accessjwtoken", newAccessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + accessDays * 24 * 60 * 60 * 1000),
  });

  res.status(200).json({
    status: "success",
    message: "Access token refreshed successfully",
    accessToken: newAccessToken,
  });
});

export const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshjwtoken || req.body?.refreshToken;

  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }

  const option = getCookieOptions(req);

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
