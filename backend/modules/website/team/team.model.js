import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    // teamID: {
    //     type: String,
    //     unique: true,
    // },
    name: {
        type: String,
        required: true,
        trim: true,
    },

    designation: {
        type: String,
        required: true,
        trim: true,
    },

    sectorsCovered: [
        {
            type: String,
            trim: true,
        },
    ],

    image: {
        type: String,
        required: true,
    },

    socialMedia: [
        {
            platform: {
                type: String,
                enum: ["linkedin", "twitter", "instagram", "facebook"],
                trim: true,
            },
            url: {
                type: String,
                trim: true,
            },
        },
    ],

    // order: {
    //     type: Number,
    //     default: 0,
    // },

    isActive: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
    }
)

const Team = mongoose.model("Team", teamSchema);

export default Team;