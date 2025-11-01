import crypto, { hash } from "crypto";
import AppErrorClass from "./../../../../../common/Utils/AppErrorClass.js";
import catchAsync from "./../../../../../common/Utils/catchAsync.js";
import User from "./../models/usersModel.js";
import Otp from "./../models/otpModel.js";
import RefreshToken from "./../models/jwtRefreshTokenModel.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // removing this code, as we are storing refresh tokens in a separate collection start
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // end

    const refreshExp = process.env.JWT_REFRESH_EXPIRES_IN;
    const days = parseInt(refreshExp); // 7

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

export const requestOTP = catchAsync(async (req, res, next) => {
  const { identifier } = req.body;

  if (!identifier) {
    return next(new AppErrorClass("Identifier is required", 400));
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const isMobile = /^[0-9]{10}$/.test(identifier);

  if (!isEmail && !isMobile) {
    return next(new AppErrorClass("Invalid identifier format", 400));
  }

  const userExists = await User.findOne({
    $or: [{ email: identifier }, { mobile: identifier }],
  });

  if (!userExists) {
    return next(new AppErrorClass("User not found", 404));
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  //   const otpExpiresAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  const otpDoc = new Otp({
    userId: userExists._id,
    otp: hashedOTP,
    otpExpiresOn: Date.now() + 10 * 60 * 1000,
  });

  await otpDoc.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
    otp,
  });
});

export const verityOTP = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  if (!otp) {
    return next(new AppErrorClass("OTP is required", 400));
  }

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const otpRecord = await Otp.findOne({
    otp: hashedOTP,
    otpExpiresOn: { $gt: Date.now() },
  });

  if (!otpRecord) {
    return next(new AppErrorClass("OTP Invalid or expired", 400));
  }

  const user = await User.findById(otpRecord.userId);

  if (!user) {
    return next(new AppErrorClass("OTP Invalid or expired", 400));
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user
  );

  res.cookie("accessjwtoken", accessToken, {
    expires: new Date(
      Date.now() +
        process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.cookie("refreshjwtoken", refreshToken, {
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({
    status: "Login Successful",
    accessToken,
    refreshToken,
  });
});

// export const refreshToken = catchAsync(async (req, res, next) => {
//   const incomingRefreshToken = req.cookies?.refreshjwtoken;
//   if (!incomingRefreshToken) {
//     return next(new AppErrorClass("Unauthorized - Refresh Token Missing", 401));
//   }

//   const decodedRefreshToken = jwt.verify(
//     incomingRefreshToken,
//     process.env.JWT_REFRESH_SECRET
//   );

//   const user = await User.findById(decodedRefreshToken.id);
//   if (!user || user.refreshToken !== incomingRefreshToken) {
//     return next(
//       new AppErrorClass("Invalid refresh token or User not found", 401)
//     );
//   }

//   const newAccessToken = user.generateAccessToken();

//   res.cookie("accessjwtoken", newAccessToken, {
//     expires: new Date(
//       Date.now() +
//         process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     secure: true,
//     sameSite: "strict",
//   });

//   res.status(200).json({
//     status: "success",
//     message: "Access token refreshed successfully",
//     accessToken: newAccessToken,
//   });
// });

export const refreshToken = catchAsync(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshjwtoken;
  if (!incomingRefreshToken) {
    return next(new AppErrorClass("Unauthorized - Refresh Token Missing", 401));
  }

  console.log(incomingRefreshToken);

  let decodedRefreshToken;
  try {
    decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    return next(new AppErrorClass("Invalid or expired refresh token", 401));
  }

  const storedToken = await RefreshToken.findOne({
    userId: decodedRefreshToken.id,
    refreshToken: incomingRefreshToken,
  });

  if (!storedToken) {
    return next(new AppErrorClass("Refresh token not found or revoked", 401));
  }

  const user = await User.findById(decodedRefreshToken.id);
  if (!user) {
    return next(new AppErrorClass("User not found", 401));
  }

  const newAccessToken = user.generateAccessToken();

  res.cookie("accessjwtoken", newAccessToken, {
    expires: new Date(
      Date.now() +
        process.env.JWT_ACCESS_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    message: "Access token refreshed successfully",
    accessToken: newAccessToken,
  });
});

export const logout = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshjwtoken;

  if (refreshToken) {
    await RefreshToken.findOneAndDelete({ refreshToken });
  }

  const option = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  };

  res.clearCookie("accessjwtoken", option);
  res.clearCookie("refreshjwtoken", option);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});
