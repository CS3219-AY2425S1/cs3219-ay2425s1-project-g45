// src/services/matcher.ts

import { Queue } from "./queue";
import { KafkaHandler } from "./kafkaHandler";
import { GatewayEvents } from "peerprep-shared-types";
import { MatchingEvents } from "peerprep-shared-types/dist/types/kafka/matching-events";
import { Match, MatchRequest } from "../types/matcherTypes";
// Define necessary types within this file

export class Matcher {
  private static instance: Matcher;
  private readonly interval: number = 100; // In milliseconds
  private timeoutId: NodeJS.Timeout | null = null;
  private queue: Queue;
  private kafkaHandler: KafkaHandler;

  private constructor(queue: Queue, kafkaHandler: KafkaHandler) {
    this.queue = queue;
    this.kafkaHandler = kafkaHandler;

    // Listen to match request events
    this.kafkaHandler.on(
      MatchingEvents.MATCH_REQUESTED,
      async (payload: any) => {
        await this.handleMatchRequest(
          payload.username,
          payload.difficulty,
          payload.topic
        );
      }
    );

    // Listen to match cancel events
    this.kafkaHandler.on(MatchingEvents.MATCH_CANCEL, async (payload: any) => {
      await this.handleMatchCancel(payload.username);
    });
  }

  public static getInstance(queue: Queue, kafkaHandler: KafkaHandler): Matcher {
    if (!Matcher.instance) {
      Matcher.instance = new Matcher(queue, kafkaHandler);
    }
    return Matcher.instance;
  }

  private async handleMatchRequest(
    username: string,
    difficulty: string,
    topic: string
  ) {
    const request: MatchRequest = {
      username,
      difficulty,
      topic,
    };

    const response = await this.queue.add(request);

    if (response.success) {
      console.log(`Match request added for user: ${username}`);
      // Start the matcher if not already running
      this.start();
    } else {
      console.error(`Failed to add match request for user: ${username}`);
      // Optionally notify the user of the failure
    }
  }

  private async handleMatchCancel(username: string) {
    const response = await this.queue.cancel({ username });

    if (response.success) {
      console.log(`Match request cancelled for user: ${username}`);
      // Optionally notify the user of the cancellation
    } else {
      console.error(`Failed to cancel match request for user: ${username}`);
      // Optionally notify the user of the failure
    }
  }

  public async match(): Promise<void> {
    // Remove expired requests and notify users (handled within the queue)
    await this.queue.removeExpiredRequests();

    // Retrieve the updated requests map after removing expired requests
    const requestMap = await this.queue.getRequests();

    // Attempt to match users
    const matches = await this.matchUsers(requestMap);

    // Notify matched users
    await this.notifyMatches(matches);

    // Check the queue length to decide whether to continue matching
    const queueLength = await this.queue.getLength();
    console.log(`Current Queue Length is: ${queueLength}`);

    if (queueLength === 0) {
      console.log("Queue is empty, stopping matcher...");
      this.stop();
      return;
    }

    // Schedule the next match attempt
    this.timeoutId = setTimeout(() => {
      this.match().catch((err) => console.error("Error in match:", err));
    }, this.interval);
  }

  private async matchUsers(
    requestMap: Map<string, MatchRequest[]>
  ): Promise<Match[]> {
    const matches: Match[] = [];
    const keys = Array.from(requestMap.keys());

    for (const key of keys) {
      let length = await this.queue.getQueueLength(key);

      while (length >= 2) {
        const users = await this.queue.getNextTwoRequests(key);
        if (users) {
          const [user1, user2] = users;
          const match = await this.createMatch(user1, user2);
          matches.push(match);
        }
        length = await this.queue.getQueueLength(key);
      }
    }

    return matches;
  }

  private async createMatch(
    user1: MatchRequest,
    user2: MatchRequest
  ): Promise<Match> {
    const match: Match = {
      usernames: [user1.username, user2.username],
      topic: user1.topic,
      difficulty: user1.difficulty,
    };

    console.log(`Match found between ${user1.username} and ${user2.username}`);

    return match;
  }

  private async notifyMatches(matches: Match[]): Promise<void> {
    for (const match of matches) {
      // Use KafkaHandler to send MATCH_FOUND event
      await this.kafkaHandler.sendGatewayEvent(GatewayEvents.MATCH_FOUND, {
        usernames: match.usernames,
        topic: match.topic,
        difficulty: match.difficulty,
      });
    }
  }

  public start(): void {
    if (this.timeoutId === null) {
      this.match().catch((err) => console.error("Error starting match:", err));
    }
  }

  public stop(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
