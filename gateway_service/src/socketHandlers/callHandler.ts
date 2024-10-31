import { Socket } from "socket.io";
import {
  ClientSocketEvents,
  createEvent,
  EventPayloads,
  KafkaEvent,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";

export type CallEventKeys = keyof Pick<
  EventPayloads,
  | CollaborationEvents.CALL
  | CollaborationEvents.ACCEPT_CALL
  | CollaborationEvents.END_CALL
>;

export interface CallEventDelegate {
  (event: KafkaEvent<CallEventKeys>, roomId: string): Promise<void>;
}

export function setUpCallHandler(socket: Socket, delegate: CallEventDelegate) {
  socket.on(ClientSocketEvents.INITIATE_CALL, async (data) => {
    const { roomId, from, signalData } = data;
    console.log("Initiating call in room:", data);

    const event = createEvent(CollaborationEvents.CALL, {
      roomId: roomId,
      from: from,
      signalData: signalData,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });

  socket.on(ClientSocketEvents.ACCEPT_CALL, async (data) => {
    const { roomId, from, signalData } = data;
    console.log("Accepting call in room:", data);

    const event = createEvent(CollaborationEvents.ACCEPT_CALL, {
      roomId: roomId,
      from: from,
      signalData: signalData,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });

  socket.on(ClientSocketEvents.END_CALL, async (data) => {
    const { roomId, from } = data;
    console.log("Ending call in room:", data);

    const event = createEvent(CollaborationEvents.END_CALL, {
      roomId: roomId,
      from: from,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });
}
