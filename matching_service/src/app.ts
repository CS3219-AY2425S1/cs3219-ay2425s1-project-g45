import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import express from "express";
import { KafkaHandler } from "./services/kafkaHandler";
import { Queue } from "./services/queue";
import { Matcher } from "./services/matcher";
import { ServiceNames } from "peerprep-shared-types";

dotenv.config();

// Initialize Express
const app = express();
const port = process.env.MATCHING_SERVICE_PORT || 5004;

// Initialize Kafka
const kafka = new Kafka({
  clientId: ServiceNames.MATCHING_SERVICE,
  brokers: [
    `${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`,
  ],
});

// Service state tracking
let serviceHealth = {
  status: "starting",
  kafka: false,
  queue: false,
  matcher: false,
  lastChecked: new Date().toISOString(),
};

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json("Matching service is running.");
});

(async () => {
  try {
    // Get singleton instances

    console.log(
      `Connecting to Kafka at URL:${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`
    );

    try {
      const kafkaHandler = KafkaHandler.getInstance(kafka);
      const queue = Queue.getInstance(kafkaHandler);
      const matcher = Matcher.getInstance(queue, kafkaHandler);

      // Initialize Kafka and update health status
      await kafkaHandler.initialize();
    } catch (error) {
      console.error("Failed to connect to Kafka:", error);
    }

    // Start Express server
    app.listen(port, () => {
      console.log(`Health check server running on port ${port}`);
      console.log("Matching service is running.");
    });
  } catch (error) {
    console.error("Service initialization failed:", error);
    serviceHealth.status = "failed";
    process.exit(1);
  }
})();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  serviceHealth.status = "shutting_down";

  try {
    console.log("Closing Express server");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
