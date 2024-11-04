// src/services/queue.ts

import { createClient, RedisClientType } from "redis";
import { KafkaHandler } from "./kafkaHandler";
import { GatewayEvents } from "peerprep-shared-types";
import {
  MatchResponse,
  MatchRequest,
  MatchCancelRequest,
  MatchCancelResponse,
} from "../types/matcherTypes";

export class Queue {
  private static instance: Queue;
  private redisClient: RedisClientType;
  private userMap: Map<string, string>; // Map username to topicKey
  private TIMEOUT_THRESHOLD = 30 * 1000; // 30 seconds
  private kafkaHandler: KafkaHandler;

  private constructor(kafkaHandler: KafkaHandler) {
    this.kafkaHandler = kafkaHandler;

    const redisUrl =
      process.env.NODE_ENV === "production"
        ? process.env.REDIS_URL
        : `${process.env.REDIS_ROUTE}:${process.env.REDIS_PORT}`;
    // Initialize Redis client
    this.redisClient = createClient({
      url: redisUrl,
    });

    this.userMap = new Map();

    this.redisClient.on("error", (err) =>
      console.error("Redis Client Error", err)
    );

    this.redisClient.connect().catch((err) => {
      console.error("Error connecting to Redis:", err);
    });
  }

  public static getInstance(kafkaHandler: KafkaHandler): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue(kafkaHandler);
    }
    return Queue.instance;
  }

  public async add(request: MatchRequest): Promise<MatchResponse> {
    const topicKey = this.getTopicKey(request);

    // Check if user already exists in the queue
    if (this.userMap.has(request.username)) {
      console.log(
        `User ${request.username} already exists in the queue. Removing old instance.`
      );

      // Retrieve all requests in the queue
      const queueData = await this.redisClient.lRange(topicKey, 0, -1);

      // Remove the old instance of the user from the Redis list
      for (const data of queueData) {
        const existingRequest = JSON.parse(data) as MatchRequest;
        if (existingRequest.username === request.username) {
          await this.redisClient.lRem(topicKey, 1, data);
          break;
        }
      }
    }

    // Add timestamp to request
    const requestData = { ...request, timestamp: Date.now() };

    // Add the request to the Redis list
    await this.redisClient.rPush(topicKey, JSON.stringify(requestData));

    // Update the userMap with the new topicKey
    this.userMap.set(request.username, topicKey);

    console.log(`User: ${request.username} has been added to the queue.`);

    return { success: true };
  }

  public async cancel(
    request: MatchCancelRequest
  ): Promise<MatchCancelResponse> {
    console.log("Cancelling request for user:", request.username);

    const topicKey = this.userMap.get(request.username);

    if (topicKey) {
      // Get all requests from the list
      const requestsData = await this.redisClient.lRange(topicKey, 0, -1);

      for (const requestData of requestsData) {
        const matchRequest: MatchRequest = JSON.parse(requestData);
        if (matchRequest.username === request.username) {
          // Remove the request from the list
          await this.redisClient.lRem(topicKey, 1, requestData);
          break;
        }
      }

      // Remove user from userMap
      this.userMap.delete(request.username);

      console.log(`Request for user ${request.username} has been cancelled.`);

      return { success: true };
    } else {
      console.error(`User ${request.username} not found in queue.`);
      return { success: false };
    }
  }

  public async getRequests(): Promise<Map<string, MatchRequest[]>> {
    const topicMap = new Map<string, MatchRequest[]>();

    // Get all keys matching the pattern
    const keys = await this.redisClient.keys("matchRequest:*"); // Adjust pattern if needed

    for (const key of keys) {
      const requestsData = await this.redisClient.lRange(key, 0, -1);
      const requests = requestsData.map(
        (data) => JSON.parse(data) as MatchRequest
      );
      topicMap.set(key, requests);
    }

    return topicMap;
  }

  public async getLength(): Promise<number> {
    let numRequests = 0;

    // Get all keys
    const keys = await this.redisClient.keys("matchRequest:*");

    for (const key of keys) {
      const length = await this.redisClient.lLen(key);
      numRequests += length;
    }

    return numRequests;
  }

  public async getQueueLength(key: string): Promise<number> {
    return await this.redisClient.lLen(key);
  }

  public async getNextTwoRequests(
    key: string
  ): Promise<[MatchRequest, MatchRequest] | null> {
    const transaction = this.redisClient.multi();

    transaction.lPop(key);
    transaction.lPop(key);

    const results = await transaction.exec();

    const user1Data = results ? results[0] : null;
    const user2Data = results ? results[1] : null;

    if (user1Data && user2Data) {
      const user1: MatchRequest = JSON.parse(user1Data as string);
      const user2: MatchRequest = JSON.parse(user2Data as string);

      // Remove users from userMap
      this.userMap.delete(user1.username);
      this.userMap.delete(user2.username);

      return [user1, user2];
    }

    return null;
  }

  private checkIfUserExists(username: string): boolean {
    return this.userMap.has(username);
  }

  private getTopicKey(request: MatchRequest): string {
    return `matchRequest:${request.topic}-${request.difficulty}`;
  }

  public async removeExpiredRequests(): Promise<void> {
    const now = Date.now();

    // Get all topic keys
    const keys = await this.redisClient.keys("matchRequest:*");

    for (const key of keys) {
      const requestsData = await this.redisClient.lRange(key, 0, -1);

      for (const requestData of requestsData) {
        const matchRequest: MatchRequest = JSON.parse(requestData);
        if (now - (matchRequest.timestamp || 0) >= this.TIMEOUT_THRESHOLD) {
          // Remove the request from the list
          await this.redisClient.lRem(key, 1, requestData);

          // Remove user from userMap
          this.userMap.delete(matchRequest.username);

          console.log(
            `Request for user ${matchRequest.username} has expired and been removed.`
          );

          // Notify the user about the timeout via Kafka
          await this.kafkaHandler.sendGatewayEvent(
            GatewayEvents.MATCH_TIMEOUT,
            {
              username: matchRequest.username,
            }
          );
        } else {
          // Since the list is ordered by insertion, we can break early
          break;
        }
      }
    }
  }
}
