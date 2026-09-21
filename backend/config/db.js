import mongoose from "mongoose";
import logger from "../common/Utils/logger.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  const dbURL = process.env.DB_STRING?.replace(
    "<db_password>",
    process.env.DB_PASSWORD,
  );

  if (!dbURL) {
    const errorMsg = "Database connection string (DB_STRING) is not configured.";
    logger.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(dbURL).then((mongooseInstance) => {
      logger.info("DB Connected Successfully");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    logger.error(`Database Error: ${err.message}`);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
    throw err;
  }
};
