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
  const consumer = kafka.consumer({
    groupId: Groups.COLLABORATION_SERVICE_GROUP,
  });

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
        if (topic == Topics.COLLABORATION_EVENTS) {
          const typedEvent = event as KafkaEvent<CollaborationEventKeys>;
          await kafkaHandler.handleCollaborationEvent(typedEvent);
        } else {
          throw new Error("Invalid topic");
        }
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
