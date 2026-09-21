import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    careerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      required: [true, "Career ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Applicant name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Applicant email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Applicant phone number is required"],
      trim: true,
    },
    resume: {
      type: String,
      required: [true, "Resume is required"],
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
export default JobApplication;
