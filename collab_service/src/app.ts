import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Kafka } from "kafkajs";
import {
  Groups,
  ServiceNames,
  Topics,
  validateKafkaEvent,
} from "peerprep-shared-types";
import { KafkaHandler } from "./services/kafkaHandler";
import { RoomModel } from "./models/Room";

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

const kafka = new Kafka({
  clientId: ServiceNames.COLLABORATION_SERVICE,
  brokers: [
    `${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`,
  ],
});

// Initialize Kafka handler
const kafkaHandler = new KafkaHandler(kafka);

// Set up Kafka consumer
const setupKafkaConsumer = async () => {
  const consumer = kafka.consumer({ groupId: Groups.MATCHING_SERVICE_GROUP });

  await consumer.connect();
  await consumer.subscribe({
    topic: Topics.COLLABORATION_EVENTS,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log(
          "Received message:",
          message.value?.toString(),
          "from topic:",
          topic
        );
        const event = JSON.parse(message.value?.toString() || "");

        validateKafkaEvent(event, topic as Topics);

        await kafkaHandler.handleCollaborationEvent(event);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });
};

// Initialize services
const initialize = async () => {
  await kafkaHandler.initialize();
  await setupKafkaConsumer();
};

// Routes

app.get("/room/:id", async (req, res) => {
  try {
    console.log("Fetching room");
    const room = await RoomModel.findById(req.params.id);
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
