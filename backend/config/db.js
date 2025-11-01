import mongoose from "mongoose";

export const connectDB = async () => {
  const dbURL = process.env.DB_STRING.replace(
    "<db_password>",
    process.env.DB_PASSWORD
  );

  try {
    const conn = await mongoose.connect(dbURL);
    console.log("DB Connected Successfully");
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};
