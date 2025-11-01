import "dotenv/config";
import { connectDB } from "./config/db.js";

// Connect to Database
connectDB();

// Importing the Express app and starting the server
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on Port no. ${PORT}`);
});
