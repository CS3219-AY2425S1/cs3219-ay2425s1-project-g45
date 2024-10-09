import { Socket } from "socket.io";
import { createRoom, DifficultyLevel } from "./room";

interface ServerToClientEvents {
  roomMessage: (message: string) => void;
  roomJoined: (roomId: string) => void;
  partnerJoined: (partnerId: string) => void;
}

interface ClientToServerEvents {
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessageToRoom: (roomId: string, message: string) => void;
  requestMatch: () => void;
}

export function joinRoomWhenReady(
  socket1: Socket<ClientToServerEvents, ServerToClientEvents>,
  socket2: Socket<ClientToServerEvents, ServerToClientEvents>,
  selectedTopic: string,
  selectedDifficulty: DifficultyLevel
) {
  const roomId = `room_${socket1.id}_${socket2.id}`;

  socket1.join(roomId);
  socket2.join(roomId);

  // Notify both sockets that they've joined a room
  socket1.emit("roomJoined", roomId);
  socket2.emit("roomJoined", roomId);

  // Notify each socket about their partner
  socket1.emit("partnerJoined", socket2.data.user.username);
  socket2.emit("partnerJoined", socket1.data.user.username);

  //create room on mongodb
  const user1 = socket1.data.user;
  const user2 = socket2.data.user;

  createRoom(roomId, selectedTopic, selectedDifficulty, [user1, user2]);

  console.log(
    `Paired ${socket1.data.user.username} and ${socket2.data.user.username} in room ${roomId}`
  );
}
