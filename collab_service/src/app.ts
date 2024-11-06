import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Kafka } from "kafkajs";
import {
  Groups,
  ServiceNames,
  Topics,
  validateKafkaEvent,
  KafkaEvent,
} from "peerprep-shared-types";
import { KafkaHandler } from "./services/kafkaHandler";
import { CollaborationEventKeys } from "./services/kafkaHandler";
import { getRoom } from "./services/roomService";
import roomRoutes from "./routes/roomRoutes";
import editorRoutes from "./routes/editorRoutes";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.COLLAB_SERVICE_PORT;
const kafkaUsername = process.env.KAFKA_KEY || "";
const kafkaPassword = process.env.KAFKA_PASSWORD || "";

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

const kafka =
  process.env.NODE_ENV == "production"
    ? new Kafka({
        clientId: ServiceNames.COLLABORATION_SERVICE,
        brokers: [
          `${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`,
        ],
        ssl: true,
        sasl: {
          mechanism: "plain",
          username: kafkaUsername,
          password: kafkaPassword,
        },
      })
    : new Kafka({
        clientId: ServiceNames.COLLABORATION_SERVICE,
        brokers: [
          `${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`,
        ],
      });

// Initialize Kafka handler
const kafkaHandler = new KafkaHandler(kafka);

// Initialize services
const initialize = async () => {
  await kafkaHandler.initialize();
};

// Routes
app.use("/rooms", roomRoutes);
app.use("/editor", editorRoutes);
app.get("/room/:id", async (req, res) => {
  try {
    console.log("Fetching room");
    const room = await getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    console.log("Room found", room);
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
});

// Basic route for testing
app.get("/", (req, res) => {
  res.send("Collab Service API is running!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  initialize().catch(console.error);
});
