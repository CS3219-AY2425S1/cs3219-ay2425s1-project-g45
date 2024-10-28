import { DifficultyLevel } from "./question";

export enum ClientSocketEvents {
  REQUEST_MATCH = "REQUEST_MATCH",
  CANCEL_MATCH = "CANCEL_MATCH",
  JOIN_ROOM = "JOIN_ROOM",
  LEAVE_ROOM = "LEAVE_ROOM",
  EDITOR_STATE = "editor_state",
  CODE_CHANGE = "code_change",
  USER_JOINED = "user_joined",
  USER_LEFT = "user_left",
  LANGUAGE_CHANGE = "language_change",
  SEND_MESSAGE = "send_message",
  NEW_CHAT = "new_chat",
  CHAT_STATE = "chat_state",
}

export enum ServerSocketEvents {
  MATCH_FOUND = "MATCH_FOUND",
  MATCH_CANCELED = "MATCH_CANCELED",
  MATCH_REQUESTED = "MATCH_REQUESTED",
  MATCH_TIMEOUT = "MATCH_TIMEOUT",
}

export interface PeerprepRequest {
  event: ClientSocketEvents;
  username: string;
  timestamp?: string;
}

export interface PeerprepResponse {
  event: ServerSocketEvents;
  username: string;
}

// Matching service
export interface MatchRequest extends PeerprepRequest {
  selectedDifficulty: DifficultyLevel;
  selectedTopic: string;
  event: ClientSocketEvents.REQUEST_MATCH;
}

export interface MatchCancelRequest extends PeerprepRequest {
  event: ClientSocketEvents.CANCEL_MATCH;
}

export interface MatchAddedResponse extends PeerprepResponse {
  event: ServerSocketEvents.MATCH_REQUESTED;
  success: boolean;
}

export interface MatchCancelResponse extends PeerprepResponse {
  event: ServerSocketEvents.MATCH_CANCELED;
  success: boolean;
}

export interface MatchFoundResponse extends PeerprepResponse {
  event: ServerSocketEvents.MATCH_FOUND;
  roomId: string;
  opponentUsername: string;
  questionId: string;
}

export interface MatchTimeoutResponse extends PeerprepResponse {
  event: ServerSocketEvents.MATCH_TIMEOUT;
}

export interface RoomJoinRequest extends PeerprepRequest {
  event: ClientSocketEvents.JOIN_ROOM;
  roomId: string;
}

export interface RoomLeaveRequest extends PeerprepRequest {
  event: ClientSocketEvents.LEAVE_ROOM;
  roomId: string;
}

export interface ServerToClientEvents {
  [ServerSocketEvents.MATCH_REQUESTED]: (response: MatchAddedResponse) => void;
  [ServerSocketEvents.MATCH_TIMEOUT]: (response: MatchTimeoutResponse) => void;
  [ServerSocketEvents.MATCH_FOUND]: (response: MatchFoundResponse) => void;
  [ServerSocketEvents.MATCH_CANCELED]: (response: MatchCancelResponse) => void;
}

export interface ClientToServerEvents {
  [ClientSocketEvents.REQUEST_MATCH]: (request: MatchRequest) => void;
  [ClientSocketEvents.CANCEL_MATCH]: (request: MatchCancelRequest) => void;
  [ClientSocketEvents.JOIN_ROOM]: (request: RoomJoinRequest) => void;
  [ClientSocketEvents.LEAVE_ROOM]: (request: RoomLeaveRequest) => void;
}

export enum ServicesSocket {
  MATCHING_SERVICE = "matching_service",
}
