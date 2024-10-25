import express from "express";
import { Kafka } from "kafkajs";
import { KafkaHandler } from "./services/kafkaHandler";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { RoomModel } from "./models/Room";
import { Groups, Topics } from "peerprep-shared-types";

dotenv.config();

const app = express();
const port = process.env.MATCHING_SERVICE_PORT;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize Kafka
const kafka = new Kafka({
  clientId: "matching-service",
  brokers: [`kafka-service:${process.env.KAFKA_BROKER_PORT}`],
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
        const event = JSON.parse(message.value?.toString() || "");
        console.log("Received collaboration event:", event.type);
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

// Get a room by ID
app.get("/room/:id", async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Matching service running on port ${port}`);
  initialize().catch(console.error);
});

// Basic health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
