import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import { KafkaHandler } from "./services/kafkaHandler";
import { Queue } from "./services/queue";
import { Matcher } from "./services/matcher";
import { ServiceNames } from "peerprep-shared-types";

dotenv.config();

// Initialize Kafka
const kafka = new Kafka({
  clientId: ServiceNames.MATCHING_SERVICE,
  brokers: [
    `${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`,
  ],
});

(async () => {
  // Get singleton instances
  console.log(
    `Connecting to Kafka at URL:${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`
  );
  const kafkaHandler = KafkaHandler.getInstance(kafka);
  const queue = Queue.getInstance(kafkaHandler);
  const matcher = Matcher.getInstance(queue, kafkaHandler);

  await kafkaHandler.initialize();

  console.log("Matching service is running.");
})();
