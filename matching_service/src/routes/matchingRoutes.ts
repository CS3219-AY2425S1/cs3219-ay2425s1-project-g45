import express, { Request, Response } from "express";
import { Queue, IQueue } from "../services/queue";

const router = express.Router();

const queue: IQueue = new Queue();

enum MatchingEvent {
  REQUEST_MATCH = "requestMatch",
  CANCEL_MATCH_REQUEST = "cancelMatchRequest",
}

export function evaluate(event: MatchingEvent, message: any): any {
  switch (event) {
    case MatchingEvent.REQUEST_MATCH:
      return queue.add({
        username: message.username,
        topic: message.topic,
        difficulty: message.difficulty,
        timestamp: Date.now(),
      });
    case MatchingEvent.CANCEL_MATCH_REQUEST:
      return queue.cancel(message.connectionId);
    default:
      return { error: "Invalid event" };
  }
}
