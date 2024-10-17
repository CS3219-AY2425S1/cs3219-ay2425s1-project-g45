import dotenv from "dotenv";
import { KafkaMessage, RecordMetadata } from "kafkajs";
import {
  KafkaRequest,
  ProducerFactory,
  ConsumerFactory,
  KafkaFactory,
} from "./kafka";

dotenv.config();

export interface IMatchRequest extends KafkaRequest {
  username: string;
  topic: string;
  difficulty: string;
}

export interface IMatchCancelRequest {
  username: string;
}

export interface IMatchResponse {
  success: boolean;
}

export interface IMatchCancelResponse {
  success: boolean;
}

export interface IMatch {
  roomId: string;
  usernames: string[];
  topic: string;
  difficulty: string;
}

export interface IQueue {
  add(request: IMatchRequest): Promise<IMatchResponse>;
  cancel(request: IMatchCancelRequest): Promise<IMatchCancelResponse>;
  getRequests(): Map<string, IMatchRequest[]>;
  getLength(): number;
}

interface KafkaMessageLocation {
  topic: string;
}

export class Queue implements IQueue {
  private producer: ProducerFactory;
  private consumer: ConsumerFactory;
  private userMap: Map<string, KafkaMessageLocation>; // to store the user's partition
  private topicMap: Map<string, IMatchRequest[]>;
  private isConsumerRunning = false;

  constructor() {
    // Setup connection to Kafka if using Kafka
    const kafka = new KafkaFactory(
      "match-queue",
      [`${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`],
      ["match-queue"]
    );

    // Setup producer and consumer
    this.producer = new ProducerFactory(kafka, "match-queue");
    this.consumer = new ConsumerFactory(kafka, "match-group", "match-queue");
    this.userMap = new Map();
    this.topicMap = new Map();
    kafka.createTopicIfNotPresent(() => {
      this.producer.start();
    });
  }

  public async add(request: IMatchRequest): Promise<IMatchResponse> {
    if (!this.isConsumerRunning) {
      this.consumer.start(this.processMessage.bind(this));
      this.isConsumerRunning = true;
    }

    // check if user already exists in queue
    if (this.checkIfUserExists(request.username)) {
      return {
        success: false,
      };
    }

    // add to queue, then return success message
    let success = false;
    this.producer.sendMessage(
      request,
      (record) => {
        success = true;
        this.onAddRequestSuccess(request, record);
      },
      (error) => {
        console.error("Error sending message: ", error);
      }
    );

    return {
      success: success,
    };
  }

  public async cancel(
    request: IMatchCancelRequest
  ): Promise<IMatchCancelResponse> {
    // remove from queue, then return success message
    console.log("Cancelling request for user: ", request.username);
    const msgLocation = this.userMap.get(request.username);
    var success = false;

    if (msgLocation != undefined) {
      const { topic } = msgLocation;
      success = true;
      this.topicMap.get(topic)?.filter((x) => x.username == request.username);
      this.userMap.delete(request.username);
    }

    return {
      success: success,
    };
  }

  public getRequests(): Map<string, IMatchRequest[]> {
    // return all requests in the queue
    return this.topicMap;
  }

  public getLength(): number {
    var numRequests = 0;
    this.topicMap.forEach((value) => (numRequests += value.length));
    return numRequests;
  }

  private checkIfUserExists(username: string): boolean {
    return this.userMap.has(username);
  }

  private onAddRequestSuccess(request: IMatchRequest, record: RecordMetadata) {
    // Validate the record metadata
    if (record.baseOffset !== undefined) {
      this.userMap.set(request.username, {
        topic: this.getTopic(request),
      });
      console.log("Successfully added request to queue");
    }
  }

  private processMessage(message: KafkaMessage) {
    const request: IMatchRequest = JSON.parse(message.value?.toString() ?? "");

    const topic = this.getTopic(request);

    if (!this.topicMap.get(topic)) {
      this.topicMap.set(topic, []);
    }

    this.topicMap.get(topic)?.push(request);
  }

  private getTopic(request: IMatchRequest) {
    return `${request.topic}-${request.difficulty}`;
  }
}
