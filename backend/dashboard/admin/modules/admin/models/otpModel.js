import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  otp: { type: String, required: true },
  otpExpiresOn: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

otpSchema.index({ otpExpiresOn: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
