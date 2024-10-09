import express from "express";

export interface IMatchRequest {
  userId: string;
  topic: string;
  difficulty: string;
}

export interface IMatchCancelRequest {
  userId: string;
  matchingId: string;
}

export interface IMatchResponse {
  success: boolean;
  matchingId: string;
}

export interface IMatchCancelResponse {
  success: boolean;
}

export interface IMatch {
  roomId: string;
  userIds: string[];
  topic: string;
  difficulty: string;
}

export interface IQueue {
  add(request: IMatchRequest): Promise<IMatchResponse>;
  cancel(request: IMatchCancelRequest): Promise<IMatchCancelResponse>;
}

export class Queue implements IQueue {
  constructor() {
    // Setup connection to Kafka if using Kafka
  }

  public async add(request: IMatchRequest): Promise<IMatchResponse> {
    // add to queue, then return success message
    return {
      success: true,
      matchingId: "someId",
    };
  }

  public async cancel(
    request: IMatchCancelRequest
  ): Promise<IMatchCancelResponse> {
    // remove from queue, then return success message
    return {
      success: true,
    };
  }
}
