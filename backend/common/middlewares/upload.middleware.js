import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import AppErrorClass from "../Utils/AppErrorClass.js";

const FILE_TYPES = {
    image: ["image/jpeg", "image/png", "image/webp"],

    document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],

    all: [], // allow everything
};

// Max file size (2MB)
const MAX_SIZE = 2 * 1024 * 1024;

// Ensure folder exists
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// Factory function
export const createUploader = ({
    folder = "misc",
    prefix = "file",
    type = "image",
}) => {
    const uploadPath = path.join("uploads", folder);
    ensureDir(uploadPath);

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const id = nanoid(10);
            cb(null, `${prefix}_${id}${ext}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        const allowed = FILE_TYPES[type];

        if (!allowed || allowed.length === 0) {
            return cb(null, true); // allow all
        }

        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            const readableTypes = allowed.map(t => t.split('/')[1]).join(', ');
            cb(new AppErrorClass(`Invalid file format. Allowed formats are: ${readableTypes}`, 400), false);
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: { fileSize: MAX_SIZE },
    });
};
