import {
  ClientSocketEvents,
  createEvent,
  EventPayloads,
  KafkaEvent,
  ServerSocketEvents,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";
import { Socket } from "socket.io";

export type RoomEventKeys = keyof Pick<
  EventPayloads,
  | CollaborationEvents.NEXT_QUESTION
  | CollaborationEvents.UPDATE_CODE
  | CollaborationEvents.LEAVE_ROOM
  | CollaborationEvents.JOIN_ROOM
>;

export interface RoomEventDelegate {
  (event: KafkaEvent<RoomEventKeys>, roomId: string): Promise<void>;
}

export function setupRoomHandler(socket: Socket, delegate: RoomEventDelegate) {
  socket.on(ClientSocketEvents.JOIN_ROOM, async (data) => {
    console.log("Joining room:", data.roomId);
    socket.join(data.roomId);

    // Purpose: to send the room details back to the user who joined the room
    //  first sends the join room event to collaboration service
    // collaboration will send back a refresh room state event which contains the current state of the room
    // this event will be sent back to the user who joined the room
    // create event
    const event = createEvent(CollaborationEvents.JOIN_ROOM, {
      roomId: data.roomId,
      username: data.username,
    });

    // send event to collaboration service
    await delegate(event, data.roomId);
  });

  socket.on(ClientSocketEvents.LEAVE_ROOM, async (data) => {
    console.log("Leaving room:", data.roomId);
    socket.to(data.roomId).emit(ServerSocketEvents.USER_LEFT, {
      username: data.username,
    });
    socket.leave(data.roomId);

    const event = createEvent(CollaborationEvents.LEAVE_ROOM, {
      roomId: data.roomId,
      username: data.username,
    });

    // send event to collaboration service
    await delegate(event, data.roomId);
  });

  socket.on(ClientSocketEvents.CHANGE_CODE, async (data) => {
    const { roomId, username, sharedCode } = data;
    console.log("Code change in room:", data);

    // everyone in the room except the sender will receive the code change on frontend
    socket.to(roomId).emit(ServerSocketEvents.CODE_CHANGED, {
      username,
      roomId,
      sharedCode: sharedCode,
      timestamp: Date.now(),
    });

    const event = createEvent(CollaborationEvents.UPDATE_CODE, {
      roomId: roomId,
      username: username,
      content: sharedCode,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });

  socket.on(ClientSocketEvents.CHANGE_LANGUAGE, async (data) => {
    const { roomId, username, language } = data;
    console.log("Language change in room:", data);

    socket.to(roomId).emit(ServerSocketEvents.LANGUAGE_CHANGED, {
      username,
      roomId,
      language,
    });
  });

  // Handle next question that has just been initiated by a user
  socket.on(ClientSocketEvents.REQUEST_NEXT_QUESTION, async (data) => {
    const { roomId, username } = data;
    console.log("Requesting next question for room:", roomId);

    // send the event to everyone in the room
    socket.to(roomId).emit(ServerSocketEvents.NEXT_QUESTION_REQUESTED, {
      username: username,
      roomId: roomId,
    });

    const event = createEvent(CollaborationEvents.NEXT_QUESTION, {
      roomId: roomId,
      username: username,
      accept: true,
    });

    // send event to collaboration service
    await delegate(event, roomId);
  });

  // Handle reply to next question request
  socket.on(ClientSocketEvents.REPLY_NEXT_QUESTION, async (data) => {
    const { roomId, username, accept } = data;

    console.log(
      "Next question",
      "for room:",
      roomId,
      accept ? "accepted" : "rejected",
      "by",
      username
    );

    socket.to(roomId).emit(ServerSocketEvents.NEXT_QUESTION_REPLIED, {
      username: username,
      roomId: roomId,
      accept: accept,
    });

    const event = createEvent(CollaborationEvents.NEXT_QUESTION, {
      roomId: roomId,
      username: username,
      accept: accept,
    });

    await delegate(event, roomId);
  });
}
