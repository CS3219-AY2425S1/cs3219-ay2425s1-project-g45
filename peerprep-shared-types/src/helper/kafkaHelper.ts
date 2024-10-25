import {
  GatewayEvents,
  Topics,
  KafkaEvent,
  EventPayloads,
} from "../types/kafka";
import { CollaborationEvents } from "../types/kafka/collaboration-events";

class KafkaEventValidator {
  // Make validateEvent method explicitly typed
  validateEvent(
    event: unknown,
    topic: Topics
  ): asserts event is KafkaEvent<keyof EventPayloads> {
    if (!this.isKafkaEventStructure(event)) {
      throw new Error(
        `Invalid event format received: ${JSON.stringify(event)}`
      );
    }

    this.validatePayload(event);

    this.validateEventTopic(event, topic);

    console.log(
      `Validated ${event.type} event for room: ${event.payload.roomId}`
    );
  }

  private isKafkaEventStructure(
    event: unknown
  ): event is KafkaEvent<keyof EventPayloads> {
    return (
      typeof event === "object" &&
      event !== null &&
      "type" in event &&
      "payload" in event &&
      "timestamp" in event &&
      typeof (event as any).timestamp === "number" &&
      typeof (event as any).type === "string" &&
      typeof (event as any).payload === "object"
    );
  }

  private isCollaborationEvent(
    event: KafkaEvent<keyof EventPayloads>
  ): event is KafkaEvent<Extract<keyof EventPayloads, CollaborationEvents>> {
    return Object.values(CollaborationEvents).includes(
      event.type as CollaborationEvents
    );
  }

  private isGatewayEvent(
    event: KafkaEvent<keyof EventPayloads>
  ): event is KafkaEvent<Extract<keyof EventPayloads, GatewayEvents>> {
    return Object.values(GatewayEvents).includes(event.type as GatewayEvents);
  }

  private validateEventTopic(
    event: KafkaEvent<keyof EventPayloads>,
    topic: Topics
  ): void {
    switch (topic) {
      case Topics.COLLABORATION_EVENTS:
        if (!this.isCollaborationEvent(event)) {
          throw new Error(
            `Invalid event type for collaboration topic: ${event.type}`
          );
        }
        break;

      case Topics.GATEWAY_EVENTS:
        if (!this.isGatewayEvent(event)) {
          throw new Error(
            `Invalid event type for gateway topic: ${event.type}`
          );
        }
        break;

      default:
        throw new Error(`Unknown topic: ${topic}`);
    }
  }

  private validatePayload(event: KafkaEvent<keyof EventPayloads>): void {
    if (!event.payload || typeof event.payload !== "object") {
      throw new Error("Invalid payload structure");
    }

    if (!("roomId" in event.payload)) {
      throw new Error("Payload must contain roomId");
    }
  }
}

// Create a typed validator instance
const validator: {
  validateEvent(
    event: unknown,
    topic: Topics
  ): asserts event is KafkaEvent<keyof EventPayloads>;
} = new KafkaEventValidator();

// Helper function with explicit type annotation
export function validateKafkaEvent(
  event: unknown,
  topic: Topics
): asserts event is KafkaEvent<keyof EventPayloads> {
  validator.validateEvent(event, topic);
}
