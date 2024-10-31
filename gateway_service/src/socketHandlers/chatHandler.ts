import {
  ClientSocketEvents,
  createEvent,
  EventPayloads,
  KafkaEvent,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";
import { Socket } from "socket.io";

export type ChatEventKeys = keyof Pick<
  EventPayloads,
  CollaborationEvents.SEND_MESSAGE | CollaborationEvents.REQUEST_CHAT_STATE
>;

export interface ChatEventDelegate {
  (event: KafkaEvent<ChatEventKeys>, roomId: string): Promise<void>;
}

export function setUpChatHandler(socket: Socket, delegate: ChatEventDelegate) {
  socket.on(ClientSocketEvents.SEND_MESSAGE, async (data) => {
    const { roomId, username, message } = data;
    console.log("Sending message in room:", data);

    const event = createEvent(CollaborationEvents.SEND_MESSAGE, {
      roomId: roomId,
      username: username,
      message: message,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });

  socket.on(ClientSocketEvents.CHAT_STATE, async (data) => {
    const { roomId } = data;
    console.log("Requesting chat state for room:", roomId);

    const event = createEvent(CollaborationEvents.REQUEST_CHAT_STATE, {
      roomId: roomId,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });
}
