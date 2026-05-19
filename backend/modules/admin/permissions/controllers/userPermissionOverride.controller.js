import UserPermissionOverride from "../models/userPermissionOverride.model.js";
import AppErrorClass from "../../../../common/Utils/AppErrorClass.js";
import catchAsync from "../../../../common/Utils/catchAsync.js";

export const createUserPermissionOverride = catchAsync(
  async (req, res, next) => {
    const {
      userId,
      grantedPermissions = [],
      revokedPermissions = [],
    } = req.body;

    if (!userId) {
      return next(new AppErrorClass("userId is required", 400));
    }

    if (
      (!Array.isArray(grantedPermissions) || grantedPermissions.length === 0) &&
      (!Array.isArray(revokedPermissions) || revokedPermissions.length === 0)
    ) {
      return next(
        new AppErrorClass(
          "At least one of grantedPermissions or revokedPermissions must be a non-empty array",
          400,
        ),
      );
    }

    const override = await UserPermissionOverride.create({
      userId,
      grantedPermissions,
      revokedPermissions,
    });
    res.status(201).json({
      status: "success",
      data: override,
    });
  },
);

export const getAllUserPermissionOverrides = catchAsync(
  async (req, res, next) => {
    const overrides = await UserPermissionOverride.find({})
      .populate("userId")
      .populate("grantedPermissions")
      .populate("revokedPermissions");
    res.status(200).json({
      status: "success",
      result: overrides.length,
      data: overrides,
    });
  },
);

export const getUserPermissionOverrideById = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const override = await UserPermissionOverride.findById(id)
      .populate("userId")
      .populate("grantedPermissions")
      .populate("revokedPermissions");

    if (!override) {
      return next(new AppErrorClass("User permission override not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: override,
    });
  },
);

export const updateUserPermissionOverride = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const { grantedPermissions, revokedPermissions } = req.body;

    const override = await UserPermissionOverride.findByIdAndUpdate(
      id,
      { grantedPermissions, revokedPermissions },
      { new: true, runValidators: true },
    );

    if (!override) {
      return next(new AppErrorClass("User permission override not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: override,
    });
  },
);

export const deleteUserPermissionOverride = catchAsync(
  async (req, res, next) => {
    const { id } = req.params;
    const override = await UserPermissionOverride.findByIdAndDelete(id);

    if (!override) {
      return next(new AppErrorClass("User permission override not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User permission override deleted successfully",
    });
  },
);
