import fs from "fs";
import path from "path";
import { uploadToS3, deleteFromS3 } from "./s3.util.js";
import { processBackgroundRemoval } from "./removeBackground.js";
import logger from "./logger.js";

/**
 * Handles file processing (optional background removal) and environment-based upload.
 * In development, returns the local path.
 * In production, uploads to S3, deletes the local file, and returns the S3 URL.
 * 
 * @param {object} file - The file object from multer (req.file).
 * @param {string} folder - The destination folder name in S3 or local directory.
 * @param {boolean} runBgRemoval - Whether to run background removal first.
 * @returns {Promise<string|undefined>} - Path to save in the database.
 */
export const processUpload = async (file, folder, runBgRemoval = false) => {
  if (!file) return undefined;

  let currentPath = file.path;

  try {
    // 1. Run background removal if requested
    if (runBgRemoval) {
      currentPath = await processBackgroundRemoval(currentPath);
    }

    // 2. Upload to S3 if credentials are provided and NOT in development mode
    const useS3 = process.env.AWS_ACCESS_KEY_ID && 
                  process.env.AWS_SECRET_ACCESS_KEY && 
                  process.env.AWS_S3_BUCKET_NAME && 
                  process.env.NODE_ENV !== "development";

    if (useS3) {
      const filename = path.basename(currentPath);
      const s3Key = `${folder}/${filename}`;

      logger.info(`AWS S3 Mode: Uploading ${filename} to S3 in bucket folder ${folder}`);
      const s3Url = await uploadToS3(currentPath, s3Key);

      // Clean up the local file after uploading to S3
      try {
        if (fs.existsSync(currentPath)) {
          fs.unlinkSync(currentPath);
        }
      } catch (err) {
        logger.error(`Failed to delete local temp file ${currentPath} after S3 upload: ${err.message}`);
      }

      // Also clean up original non-bg-removed file if bg-removal ran and created a new file
      if (runBgRemoval && file.path !== currentPath) {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (err) {
          // Ignore error if it was already deleted by background removal
        }
      }

      return s3Url;
    }

    // 3. For local development, format the path correctly and return it
    return `/${currentPath.replace(/\\/g, "/")}`;
  } catch (error) {
    logger.error(`Error in processUpload: ${error.message}`);
    throw error;
  }
};

/**
 * Unifies file deletion. Handles both local files and AWS S3 URLs.
 * 
 * @param {string} filePath - Path or URL of the file to delete.
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
  if (!filePath) return;

  try {
    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      // It's a remote URL (S3)
      const url = new URL(filePath);
      // The key is the pathname without the leading slash (e.g., "/users/user_abc.jpg" -> "users/user_abc.jpg")
      const key = decodeURIComponent(url.pathname.substring(1));
      logger.info(`Deleting object from S3: ${key}`);
      await deleteFromS3(key);
    } else {
      // It's a local file path
      const normalizedPath = filePath.replace(/^\/+/, "").replace(/\\/g, "/");
      const absolutePath = path.resolve(normalizedPath);

      if (fs.existsSync(absolutePath)) {
        logger.info(`Deleting local file: ${absolutePath}`);
        fs.unlinkSync(absolutePath);
      } else {
        logger.debug(`File to delete does not exist locally: ${absolutePath}`);
      }
    }
  } catch (error) {
    logger.error(`Error in deleteFile for path ${filePath}: ${error.message}`);
  }
};
