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

import { MatchingEvents } from "peerprep-shared-types/dist/types/kafka/matching-events";

export class KafkaHandler extends EventEmitter {
  private producer: Producer;
  private consumer: Consumer;

  constructor(private kafka: Kafka) {
    super();
    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: "matching-service-group" });
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
    payload: EventPayloads[T],
    key: string
  ) {
    const event = createEvent(eventType, payload);

    await this.producer.send({
      topic: Topics.GATEWAY_EVENTS,
      messages: [
        {
          key: key,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
