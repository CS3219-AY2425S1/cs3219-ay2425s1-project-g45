// src/services/kafkaHandler.ts

import { Kafka, Producer, Consumer } from "kafkajs";
import { EventEmitter } from "events";
import {
  Topics,
  KafkaEvent,
  EventPayloads,
  validateKafkaEvent,
  GatewayEvents,
  createEvent,
} from "peerprep-shared-types";

export class KafkaHandler extends EventEmitter {
  private static instance: KafkaHandler;
  private producer: Producer;
  private consumer: Consumer;

  private constructor(private kafka: Kafka) {
    super();
    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: "matching-service-group" });
  }

  public static getInstance(kafka: Kafka): KafkaHandler {
    if (!KafkaHandler.instance) {
      KafkaHandler.instance = new KafkaHandler(kafka);
    }
    return KafkaHandler.instance;
  }

  async initialize() {
    await this.producer.connect();
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: Topics.MATCHING_EVENTS,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event: KafkaEvent<keyof EventPayloads> = JSON.parse(
            message.value?.toString() || ""
          );

          validateKafkaEvent(event, topic as Topics);

          this.emit(event.type, event.payload);
        } catch (error) {
          console.error("Error processing message:", error);
        }
      },
    });
  }

  async sendGatewayEvent<T extends GatewayEvents>(
    eventType: T,
    payload: EventPayloads[T]
  ) {
    const event = createEvent(eventType, payload);

    await this.producer.send({
      topic: Topics.GATEWAY_EVENTS,
      messages: [
        {
          key: "key",
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
