import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    action: { 
      type: String, 
      required: true, 
      trim: true 
    },
    detail: { 
      type: String, 
      required: true, 
      trim: true 
    },
    module: { 
      type: String, 
      enum: ["admin", "website", "accounts", "task", "leave"], 
      required: true 
    },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: false // Nullable for system actions or self-registrations
    },
    ipAddress: { 
      type: String 
    }
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
