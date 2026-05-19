import mongoose from "mongoose";
import logger from "../common/Utils/logger.js";

export const connectDB = async () => {
  const dbURL = process.env.DB_STRING.replace(
    "<db_password>",
    process.env.DB_PASSWORD,
  );

  try {
    const conn = await mongoose.connect(dbURL);
    console.log("DB Connected Successfully");
    logger.info("DB Connected Successfully");
    logger.info(`MongoDB Host: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    logger.error(`Database Error: ${err.message}`);
    process.exit(1);
  }
};
