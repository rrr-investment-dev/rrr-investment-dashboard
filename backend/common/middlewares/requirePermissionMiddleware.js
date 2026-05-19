import AppError from "./../Utils/AppErrorClass.js";
import catchAsync from "./../Utils/catchAsync.js";

export const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return next(new AppError("User permissions not found.", 403));
    }
    if (!req.user.permissions.includes(permissionKey)) {
      return next(
        new AppError(`You do not have permission: ${permissionKey}`, 403)
      );
    }
    next();
  };
};
