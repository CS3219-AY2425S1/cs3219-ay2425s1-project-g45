import {
  KafkaEvent,
  EventPayloads,
  GatewayEvents,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";

// Type guard to verify if a message is a valid KafkaEvent
export function isValidKafkaEvent(
  event: any
): event is KafkaEvent<keyof EventPayloads> {
  return (
    typeof event === "object" &&
    event !== null &&
    "type" in event &&
    "payload" in event &&
    "timestamp" in event &&
    typeof event.timestamp === "number" &&
    (Object.values(CollaborationEvents).includes(
      event.type as CollaborationEvents
    ) ||
      Object.values(GatewayEvents).includes(event.type as GatewayEvents))
  );
}

// Type guard for collaboration events specifically
export function isCollaborationEvent(
  event: KafkaEvent<keyof EventPayloads>
): event is KafkaEvent<Extract<keyof EventPayloads, CollaborationEvents>> {
  return Object.values(CollaborationEvents).includes(
    event.type as CollaborationEvents
  );
}
