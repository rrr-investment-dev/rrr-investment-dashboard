import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        // postID: {
        //     type: String,
        //     unique: true
        // },

        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },

        subTitle: {
            type: String,
            trim: true
        },

        description: {
            type: String,
            trim: true,
        },

        link: {
            type: String,
            required: [true, "Link is required"],
            trim: true,
            validate: {
                validator: function (value) {
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: "Please provide a valid URL",
            },
        },

        image: {
            type: String,
            trim: true,
            default: "",
        },

        platform: {
            type: String,
            enum: ["linkedin", "instagram", "facebook", "twitter", "other"],
            default: "other",
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["published", "unpublished"],
            default: "published",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Post", postSchema);