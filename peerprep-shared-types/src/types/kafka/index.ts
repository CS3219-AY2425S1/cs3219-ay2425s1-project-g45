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
  [GatewayEvents.MATCH_FOUND]: {
    roomId: string;
    usernames: string[];
    topic: string;
    difficulty: string;
  };
  [GatewayEvents.SIGNAL_NEW_CHAT]: {
    roomId: string;
  };
  [GatewayEvents.GET_NEW_CHATS]: {
    roomId: string;
    newMessages: ChatMessage[];
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
  [CollaborationEvents.REQUEST_NEW_CHATS]: {
    roomId: string;
    lastMessageTimestamp: Date;
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
