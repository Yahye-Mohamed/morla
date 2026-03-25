import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedDatabase } from "./utils/seedDatabase.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`Morla Cafe API is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
