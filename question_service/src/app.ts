import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import questionRoutes from "./routes/questionRoutes";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.QUESTION_SERVICE_PORT;

// MongoDB Atlas connection string
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(express.json());

// Routes
app.use("/api", questionRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("LeetCode Question API is running! 123");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
