import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
    },
    menu: {
      type: String,
      default: null,
      trim: true,
    },
    subMenu: {
      type: String,
      default: null,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    path: {
      type: String,
      default: null,
      trim: true,
      validate: {
        validator: function (v) {
          return v === null || v.startsWith("/");
        },
        message: (props) => `${props.value} is not a valid path! It must start with /`,
      },
    },
    icon: {
      type: String,
      default: null,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

permissionSchema.index({ module: 1, menu: 1, subMenu: 1 });

export const Permission = mongoose.model("PermissionMaster", permissionSchema);

export default Permission;
