import mongoose from "mongoose";

const formConfigSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: [true, "Field label is required"],
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Field name (key) is required"],
            unique: true,
            trim: true,
        },
        type: {
            type: String,
            required: [true, "Field type is required"],
            enum: ["text", "email", "tel", "url", "textarea", "number", "select", "radio", "checkbox", "date", "time", "file"],
        },
        placeholder: {
            type: String,
            trim: true,
        },
        required: {
            type: Boolean,
            default: false,
        },
        options: [
            {
                label: String,
                value: String,
            },
        ],
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

formConfigSchema.pre("validate", async function (next) {
    try {
        if (this.isModified("label") && !this.name) {
            this.name = this.label
                .toLowerCase()
                .trim()
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .split(/\s+/)
                .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
                .join("");
        }

        if (this.isNew && (this.order === undefined || this.order === 0)) {
            const lastConfig = await this.constructor.findOne().sort("-order");
            if (lastConfig && typeof lastConfig.order === 'number') {
                this.order = lastConfig.order + 1;
            } else {
                this.order = 0;
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("FormConfig", formConfigSchema);
