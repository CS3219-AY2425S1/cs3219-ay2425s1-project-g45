import { PeerprepRequest, PeerprepResponse } from ".";

export enum RoomClientEvents {
  JOIN_ROOM = "JOIN_ROOM",
  LEAVE_ROOM = "LEAVE_ROOM",
}

export enum RoomServerEvents {
  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",
}

// Joining and Leaving Room
export interface RoomJoinRequest extends PeerprepRequest {
  roomId: string;
}

export interface RoomLeaveRequest extends PeerprepRequest {
  roomId: string;
}

export interface UserJoinedResponse extends PeerprepResponse {
  roomId: string;
  username: string;
}

export interface UserLeftResponse extends PeerprepResponse {
  roomId: string;
  username: string;
}

export interface RoomClientToServerEvents {
  [RoomClientEvents.JOIN_ROOM]: (request: RoomJoinRequest) => void;
  [RoomClientEvents.LEAVE_ROOM]: (request: RoomLeaveRequest) => void;
}

export interface RoomServerToClientEvents {
  [RoomServerEvents.USER_JOINED]: (response: UserJoinedResponse) => void;
  [RoomServerEvents.USER_LEFT]: (response: UserLeftResponse) => void;
}
