import {
  CommsClientEvents,
  CommsClientToServerEvents,
  CommsServerEvents,
  CommsServerToClientEvents,
} from "./comms";
import {
  EditorClientEvents,
  EditorClientToServerEvents,
  EditorServerEvents,
  EditorServerToClientEvents,
} from "./editor";
import {
  MatchClientEvents,
  MatchingClientToServerEvents,
  MatchServerEvents,
  MatchingServerToClientEvents,
} from "./match";
import {
  RoomClientEvents,
  RoomClientToServerEvents,
  RoomServerEvents,
  RoomServerToClientEvents,
} from "./room";

export interface PeerprepRequest {
  event: ClientSocketEvents;
  username: string;
  timestamp?: string;
}

export interface PeerprepResponse {
  event: ServerSocketEvents;
  username: string;
}

// Client Events
export const ClientSocketEvents = {
  ...MatchClientEvents,
  ...RoomClientEvents,
  ...EditorClientEvents,
  ...CommsClientEvents,
};

export type ClientSocketEvents =
  | MatchClientEvents
  | RoomClientEvents
  | EditorClientEvents
  | CommsClientEvents;

// Server Events
export const ServerSocketEvents = {
  ...MatchServerEvents,
  ...RoomServerEvents,
  ...EditorServerEvents,
  ...CommsServerEvents,
};

export type ServerSocketEvents =
  | MatchServerEvents
  | RoomServerEvents
  | EditorServerEvents
  | CommsServerEvents;

export type ClientToServerEvents = MatchingClientToServerEvents &
  RoomClientToServerEvents &
  EditorClientToServerEvents &
  CommsClientToServerEvents;

export type ServerToClientEvents = MatchingServerToClientEvents &
  RoomServerToClientEvents &
  EditorServerToClientEvents &
  CommsServerToClientEvents;
