import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
    {
        responses: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            required: true,
        },
        status: {
            type: String,
            enum: ["unread", "read"],
            default: "unread",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Inquiry", inquirySchema);
