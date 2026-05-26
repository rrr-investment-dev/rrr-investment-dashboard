import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import logger from "./logger.js";

const getS3Client = () => {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    logger.warn("AWS S3 environment variables are not fully configured. S3 operations will fail.");
    return null;
  }

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

/**
 * Uploads a local file to AWS S3.
 * @param {string} localFilePath - Path to the file on local disk.
 * @param {string} s3Key - Path/Filename to store the file as in S3.
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
export const uploadToS3 = async (localFilePath, s3Key) => {
  const s3 = getS3Client();
  if (!s3) {
    throw new Error("AWS S3 Client is not initialized. Check your environment variables.");
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not defined.");
  }

  // Normalize path format for S3 key (forward slashes only)
  const normalizedKey = s3Key.replace(/\\/g, "/");

  const fileStream = fs.createReadStream(localFilePath);
  const contentType = mime.lookup(localFilePath) || "application/octet-stream";

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: normalizedKey,
    Body: fileStream,
    ContentType: contentType,
  });

  await s3.send(command);
  
  // Return the public URL
  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${normalizedKey}`;
};

/**
 * Deletes an object from AWS S3.
 * @param {string} s3Key - The key of the object to delete.
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (s3Key) => {
  const s3 = getS3Client();
  if (!s3) {
    logger.warn("S3 client not initialized. Cannot delete from S3.");
    return;
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    logger.warn("AWS_S3_BUCKET_NAME not set. Cannot delete from S3.");
    return;
  }

  // Normalize path format for S3 key (forward slashes only)
  const normalizedKey = s3Key.replace(/\\/g, "/");

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: normalizedKey,
  });

  await s3.send(command);
};
