// baseKafkaHandler.ts
import { Kafka, Producer, Consumer } from "kafkajs";
import { KafkaEvent } from ".";
import { validateKafkaEvent } from "../../helper";
import { Topics } from "./topics";

export interface KafkaConfig {
  clientId: string;
  groupId: string;
  brokers: string[];
  subscribeTopic: Topics;
  publishTopic?: Topics;
}

export abstract class BaseKafkaHandler {
  protected producer: Producer;
  protected consumer: Consumer;
  protected kafka: Kafka;
  protected config: KafkaConfig;

  constructor(config: KafkaConfig) {
    this.config = config;
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
  }

  async initialize(): Promise<void> {
    await this.producer.connect();
    await this.setupConsumer();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  private async setupConsumer(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: this.config.subscribeTopic,
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          console.log(
            `Received message: ${message.value?.toString()} from topic: ${topic}`
          );
          const event = JSON.parse(message.value?.toString() || "");
          validateKafkaEvent(event, topic as Topics);
          await this.handleEvent(event);
        } catch (error) {
          console.error("Error processing message:", error);
          await this.handleError(error);
        }
      },
    });
  }

  protected async publishEvent<T extends Topics>(
    topic: T,
    event: KafkaEvent<any>,
    key?: string
  ): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          key: key || event.payload?.roomId || undefined,
          value: JSON.stringify(event),
        },
      ],
    });
  }

  protected abstract handleEvent(event: KafkaEvent<any>): Promise<void>;
  protected abstract handleError(error: unknown): Promise<void>;
}
