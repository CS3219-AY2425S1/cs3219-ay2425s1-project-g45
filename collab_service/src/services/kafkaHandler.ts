import { Kafka, Producer } from "kafkajs";
import { EditorManager } from "./editor";
import { RoomModel } from "../models/Room";
import {
  GatewayEvents,
  Topics,
  KafkaEvent,
  EventPayloads,
  createEvent,
  TopicEvents,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";

export type CollaborationEventKeys = keyof Pick<
  EventPayloads,
  TopicEvents[Topics.COLLABORATION_EVENTS]
>;

export class KafkaHandler {
  private producer: Producer;
  private editorManager: EditorManager;

  constructor(kafka: Kafka) {
    this.producer = kafka.producer();
    this.editorManager = new EditorManager();
  }

  async initialize() {
    await this.producer.connect();
  }

  async handleCollaborationEvent(event: KafkaEvent<CollaborationEventKeys>) {
    const { type, payload } = event;
    try {
      switch (type) {
        case CollaborationEvents.JOIN_ROOM:
          const joinPayload =
            event.payload as EventPayloads[CollaborationEvents.JOIN_ROOM];

          await this.handleJoinRoom(joinPayload.roomId, joinPayload.username);
          break;

        case CollaborationEvents.UPDATE_CODE:
          const updatePayload =
            event.payload as EventPayloads[CollaborationEvents.UPDATE_CODE];
          await this.handleCodeChange(
            updatePayload.roomId,
            updatePayload.username,
            updatePayload.content
          );
          break;

        case CollaborationEvents.LEAVE_ROOM:
          const leavePayload =
            event.payload as EventPayloads[CollaborationEvents.LEAVE_ROOM];
          await this.handleLeaveRoom(
            leavePayload.roomId,
            leavePayload.username
          );
          break;
      }
    } catch (error) {
      console.error(`Error handling ${type} event:`, error);
      // Send error event back to gateway if needed
      const roomId = payload.roomId;

      const event = createEvent(GatewayEvents.ERROR, {
        error: `Failed to handle ${type} event`,
        roomId,
      });

      await this.sendGatewayEvent(event, roomId);
    }
  }

  private async handleJoinRoom(roomId: string, username: string) {
    // Get or initialize room state
    console.log("Joining room:", roomId, username);
    const editorState = this.editorManager.initializeRoom(roomId, "javascript");

    // Add user to room
    const newState = this.editorManager.addUserToRoom(roomId, username);

    const event = createEvent(GatewayEvents.REFRESH_ROOM_STATE, {
      roomId,
      editorState: editorState || newState,
    });

    // Send editor state back to gateway
    await this.sendGatewayEvent(event, roomId);
  }

  private async handleCodeChange(
    roomId: string,
    username: string,
    content: string
  ) {
    // Update editor state
    console.log("Updating room state with new code:", roomId, username);
    this.editorManager.updateCode(roomId, username, content);
  }

  private async handleLeaveRoom(roomId: string, username: string) {
    // Remove user from room
    const newState = this.editorManager.removeUserFromRoom(roomId, username);

    if (newState) {
      // If room is empty, consider cleanup
      if (newState.activeUsers.length === 0) {
        this.editorManager.cleanupRoom(roomId);
      }

      // Update room in database
      await RoomModel.findByIdAndUpdate(roomId, {
        $pull: { activeUsers: username },
      });
    }
  }

  private async sendGatewayEvent<T extends GatewayEvents>(
    event: KafkaEvent<T>,
    key: string
  ) {
    await this.producer.send({
      topic: Topics.GATEWAY_EVENTS,
      messages: [
        {
          key: key,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
