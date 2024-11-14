import { Server, Socket } from "socket.io";
import { PeerprepResponse } from "peerprep-shared-types";

export function sendMessage(
  socket: Server | Socket,
  message: PeerprepResponse
) {
  socket.emit("serverToClient", message);
}
