import { CollaborationEvents } from "./collaboration-events";
import { GatewayEvents } from "./gateway-events";
import { Topics } from "./topics";

export * from "./gateway-events";
export * from "./group";
export * from "./topics";
// Define payload types for each event
export interface EventPayloads {
  // Gateway Events
  [GatewayEvents.REFRESH_ROOM_STATE]: {
    roomId: string;
  };
  [GatewayEvents.USER_LEFT]: {
    roomId: string;
    username: string;
  };
  [GatewayEvents.ERROR]: {
    roomId: string;
    error: string;
  };
  [GatewayEvents.CODE_CHANGED]: {
    roomId: string;
    content: string;
    username: string;
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
