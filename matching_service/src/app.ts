import { Kafka } from "kafkajs";
import {
  Topics,
  validateKafkaEvent,
  ServiceNames,
  Groups,
} from "peerprep-shared-types";
import { KafkaHandler } from "./services/kafkaHandler";

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
    topic: Topics.MATCHING_EVENTS,
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

        await kafkaHandler.handleMatchingEvent(event);
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

initialize().catch(console.error);
