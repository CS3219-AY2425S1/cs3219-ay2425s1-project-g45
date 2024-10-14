import { Server, Socket as ServerSocket } from "socket.io";
import { io as Client, Socket as ClientSocket } from "socket.io-client";
import {
  ClientSocketEvents,
  ServerSocketEvents,
  ServicesSocket,
} from "peerprep-shared-types";
import { authenticateSocket } from "../../utility/jwtHelper";

type Connections = Map<string, ServerSocket>;

const createMatchingServiceSocket = (): ClientSocket => {
  const socket = Client(`http://matching-service:5004`);

  socket.on("connect", () => console.log("Connected to matching service"));

  socket.on("connect_error", (err) =>
    console.error(`connect_error due to ${err}`)
  );

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("Disconnected from matching service");
  });

  return socket;
};

const handleMatchingServiceMessage = (
  message: any,
  connections: Connections
) => {
  console.log(`Received message from matching service: ${message}`);
  if (validateClientTransfer(message)) {
    const socket = connections.get(message.connectionId);
    if (socket == null) {
      console.error("No socket found for connectionId");
      return;
    }
    socket.emit(message.event, message);
  }
};

const validateClientTransfer = (message: any): boolean => {
  if (message.event == null || message.event == undefined) {
    console.error("No event specified in message");
    return false;
  }
  if (message.connectionId == null || message.connectionId == undefined) {
    console.error("No connectionId specified in message");
    return false;
  }
  return true;
};

const socketTransfer = (
  matchingServiceSocket: ClientSocket,
  service: ServicesSocket,
  event: ClientSocketEvents,
  message: any
) => {
  switch (service) {
    case ServicesSocket.MATCHING_SERVICE:
      message.event = event;
      matchingServiceSocket.emit("clientToServer", message);
      break;
    default:
      break;
  }
};

const handleClientMessage = (
  socket: ServerSocket,
  message: any,
  matchingServiceSocket: ClientSocket
) => {
  const event = message.event;
  if (event == null || event == undefined) {
    console.error("No event specified in message");
    return;
  }

  const targetService = getTargetService(event);
  if (targetService == null) {
    console.error("No target service for event");
    return;
  }
  message.connectionId = socket.id;
  console.log(`Received message from client: ${JSON.stringify(message)}`);
  console.log(`Forwarding message to service: ${targetService}`);

  socketTransfer(matchingServiceSocket, targetService, event, message);
};

const setupServerSocket = (io: Server, matchingServiceSocket: ClientSocket) => {
  const connections: Connections = new Map();

  io.use(authenticateSocket).on("connection", (socket: ServerSocket) => {
    console.log(`User connected: ${socket.data.username}`);
    connections.set(socket.id, socket);

    socket.on("clientToServer", (message) =>
      handleClientMessage(socket, message, matchingServiceSocket)
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.data.username}`);
      connections.delete(socket.id);
      socket.disconnect(true);
    });
  });

  matchingServiceSocket.on("serverToClient", (message) =>
    handleMatchingServiceMessage(message, connections)
  );

  return connections;
};

function getTargetService(event: ClientSocketEvents): ServicesSocket | null {
  switch (event) {
    case ClientSocketEvents.REQUEST_MATCH:
    case ClientSocketEvents.CANCEL_MATCH:
      return ServicesSocket.MATCHING_SERVICE;
    default:
      return null;
  }
}

const initializeSocketHandler = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: `*`,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const matchingServiceSocket = createMatchingServiceSocket();
  const connections = setupServerSocket(io, matchingServiceSocket);

  return { io, connections, matchingServiceSocket };
};

export default initializeSocketHandler;
