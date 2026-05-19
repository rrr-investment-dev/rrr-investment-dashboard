import jwt from "jsonwebtoken";
import catchAsync from "./../Utils/catchAsync.js";
import AppError from "./../Utils/AppErrorClass.js";
import User from "../../modules/admin/user/user.model.js";
import { getEffectivePermissionKeysForUser } from "./../Utils/permission.util.js";

export const protect = catchAsync(async (req, res, next) => {
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessjwtoken) {
    accessToken = req.cookies.accessjwtoken;
  }

  if (!accessToken || accessToken === "null" || accessToken === "undefined") {
    return next(new AppError("You are not logged in!", 401));
  }

  const decodedAccessToken = jwt.verify(
    accessToken,
    process.env.JWT_ACCESS_SECRET
  );

  const currentUser = await User.findById(decodedAccessToken.id).populate("role");
  if (!currentUser) {
    return next(new AppError("The user no longer exists.", 401));
  }

  if (!currentUser.isActive) {
    return next(new AppError("Your account is inactive. Please contact the administrator.", 403));
  }

  if (currentUser.role && !currentUser.role.isActive) {
    return next(new AppError("Your assigned role is currently inactive. Please contact the administrator.", 403));
  }

  const permissionKeys = await getEffectivePermissionKeysForUser(
    currentUser._id
  );
  currentUser.permissions = permissionKeys;

  req.user = currentUser;

  next();
});
