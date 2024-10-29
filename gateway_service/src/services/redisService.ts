// src/services/RedisService.ts

import { createClient, RedisClientType } from "redis";

class RedisService {
  private static instance: RedisService;
  private redisClient: RedisClientType;

  private constructor() {
    const redisUrl =
      `${process.env.REDIS_ROUTE}:${process.env.REDIS_PORT}` ||
      "redis://localhost:6379";
    this.redisClient = createClient({
      url: redisUrl,
    });

    this.redisClient.on("connect", () => {
      console.log("Connected to Redis");
    });

    this.redisClient.on("error", (error) => {
      console.error("Redis connection error:", error);
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  // Connect to Redis
  public async connect(): Promise<void> {
    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }
  }

  // Disconnect from Redis
  public async disconnect(): Promise<void> {
    if (this.redisClient.isOpen) {
      await this.redisClient.disconnect();
    }
  }

  // Set a key with an optional expiration time in seconds
  public async set(
    key: string,
    value: string,
    expiration?: number
  ): Promise<void> {
    if (expiration) {
      await this.redisClient.set(key, value, {
        EX: expiration,
      });
    } else {
      await this.redisClient.set(key, value);
    }
  }

  // Get a value by key
  public async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  // Delete a key
  public async delete(key: string): Promise<number> {
    return await this.redisClient.del(key);
  }

  // Set a hash (useful for storing objects)
  public async setHash(
    key: string,
    data: Record<string, string>
  ): Promise<void> {
    await this.redisClient.hSet(key, data);
  }

  // Get all fields of a hash
  public async getHash(key: string): Promise<Record<string, string>> {
    return await this.redisClient.hGetAll(key);
  }

  // Delete a hash field
  public async deleteHashField(key: string, field: string): Promise<number> {
    return await this.redisClient.hDel(key, field);
  }

  // Check if a key exists
  public async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }
}

export default RedisService;
