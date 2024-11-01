import { PeerprepRequest, PeerprepResponse } from ".";
import { DifficultyLevel } from "../question";

export enum MatchClientEvents {
  REQUEST_MATCH = "REQUEST_MATCH",
  CANCEL_MATCH = "CANCEL_MATCH",
}

export enum MatchServerEvents {
  MATCH_FOUND = "MATCH_FOUND",
  MATCH_CANCELED = "MATCH_CANCELED",
  MATCH_REQUESTED = "MATCH_REQUESTED",
  MATCH_TIMEOUT = "MATCH_TIMEOUT",
}

export interface MatchRequest extends PeerprepRequest {
  selectedDifficulty: DifficultyLevel;
  selectedTopic: string;
  event: MatchClientEvents.REQUEST_MATCH;
}

export interface MatchCancelRequest extends PeerprepRequest {
  event: MatchClientEvents.CANCEL_MATCH;
}

export interface MatchAddedResponse extends PeerprepResponse {
  event: MatchServerEvents.MATCH_REQUESTED;
  success: boolean;
}

export interface MatchCancelResponse extends PeerprepResponse {
  event: MatchServerEvents.MATCH_CANCELED;
  success: boolean;
}

export interface MatchFoundResponse extends PeerprepResponse {
  event: MatchServerEvents.MATCH_FOUND;
  roomId: string;
  opponentUsername: string;
  questionId: string;
}

export interface MatchTimeoutResponse extends PeerprepResponse {
  event: MatchServerEvents.MATCH_TIMEOUT;
}

export interface MatchingClientToServerEvents {
  [MatchClientEvents.REQUEST_MATCH]: (request: MatchRequest) => void;
  [MatchClientEvents.CANCEL_MATCH]: (request: MatchCancelRequest) => void;
}

export interface MatchingServerToClientEvents {
  [MatchServerEvents.MATCH_REQUESTED]: (response: MatchAddedResponse) => void;
  [MatchServerEvents.MATCH_TIMEOUT]: (response: MatchTimeoutResponse) => void;
  [MatchServerEvents.MATCH_FOUND]: (response: MatchFoundResponse) => void;
  [MatchServerEvents.MATCH_CANCELED]: (response: MatchCancelResponse) => void;
}
