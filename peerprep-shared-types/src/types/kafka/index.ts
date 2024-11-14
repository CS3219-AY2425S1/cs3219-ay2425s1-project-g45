import { ChatMessage, ChatState } from "../chat";
import { EditorState } from "../editor";
import { CollaborationEvents } from "./collaboration-events";
import { GatewayEvents } from "./gateway-events";
import { MatchingEvents } from "./matching-events";
import { Topics } from "./topics";

export * from "./gateway-events";
export * from "./group";
export * from "./topics";
// Define payload types for each event
export interface EventPayloads {
  // Gateway Events
  [GatewayEvents.REFRESH_ROOM_STATE]: {
    roomId: string;
    editorState: EditorState;
  };
  [GatewayEvents.ERROR]: {
    roomId: string;
    error: string;
  };
  [GatewayEvents.MATCH_REQUESTED]: {
    success: boolean;
    username: string;
    difficulty: string;
    topic: string;
  };
  [GatewayEvents.MATCH_FOUND]: {
    usernames: string[];
    topic: string;
    difficulty: string;
  };
  [GatewayEvents.NEW_CHAT]: {
    roomId: string;
    message: ChatMessage;
  };
  [GatewayEvents.REFRESH_CHAT_STATE]: {
    roomId: string;
    chatState: ChatState;
  };
  [GatewayEvents.MATCH_TIMEOUT]: {
    username: string;
  };
  [GatewayEvents.CHANGE_QUESTION]: {
    roomId: string;
    questionId: string;
  };
  [GatewayEvents.CALL]: {
    to: string;
    from: string;
    signalData: any;
  };
  [GatewayEvents.ACCEPT_CALL]: {
    to: string;
    from: string;
    signalData: any;
  };
  [GatewayEvents.END_CALL]: {
    to: string;
    from: string;
  };

  // Collaboration Events
  [CollaborationEvents.JOIN_ROOM]: {
    roomId: string;
    username: string;
  };
  [CollaborationEvents.LEAVE_ROOM]: {
    roomId: string;
    username: string;
  };
  [CollaborationEvents.UPDATE_CODE]: {
    roomId: string;
    content: string;
    username: string;
  };
  [CollaborationEvents.SEND_MESSAGE]: {
    roomId: string;
    username: string;
    message: string;
  };
  [CollaborationEvents.REQUEST_CHAT_STATE]: {
    roomId: string;
  };
  [CollaborationEvents.NEXT_QUESTION]: {
    roomId: string;
    username: string;
    accept: boolean;
  };
  [CollaborationEvents.CALL]: {
    roomId: string;
    from: string;
    signalData: any;
  };
  [CollaborationEvents.ACCEPT_CALL]: {
    roomId: string;
    from: string;
    signalData: any;
  };
  [CollaborationEvents.END_CALL]: {
    roomId: string;
    from: string;
  };

  // Matching Events
  [MatchingEvents.MATCH_CANCEL]: {
    username: string;
  };
  [MatchingEvents.MATCH_REQUESTED]: {
    username: string;
    difficulty: string;
    topic: string;
  };
}

// Type helper for creating events
export type KafkaEvent<T extends keyof EventPayloads> = {
  type: T;
  payload: EventPayloads[T];
  timestamp: number;
};

// Topic to Event mapping type
export type TopicEvents = {
  [Topics.GATEWAY_EVENTS]: GatewayEvents;
  [Topics.COLLABORATION_EVENTS]: CollaborationEvents;
  [Topics.MATCHING_EVENTS]: MatchingEvents;
};

// Helper function to create typed events
export function createEvent<T extends keyof EventPayloads>(
  type: T,
  payload: EventPayloads[T]
): KafkaEvent<T> {
  return {
    type,
    payload,
    timestamp: Date.now(),
  };
}
