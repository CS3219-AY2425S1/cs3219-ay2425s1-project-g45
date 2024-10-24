import express from "express";
import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.COLLAB_SERVICE_PORT;

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

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*", // In production, replace with your frontend's URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Collab Service is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

io.on("connection", (socket) => {
  console.log("Connected to collab service");

  socket.on("disconnect", () => {
    console.log("Disconnected from API Gateway");
    socket.disconnect(true);
  });
});
