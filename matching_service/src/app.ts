import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { validateSocketConnection } from "./utility/socketHelper";
import { Queue, IMatchRequest, IMatchCancelRequest } from "./services/queue";
import { Matcher } from "./services/matcher";
import {
  ClientSocketEvents,
  ServerSocketEvents,
  MatchRequest,
  MatchCancelRequest,
} from "peerprep-shared-types";

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.MATCHING_SERVICE_PORT;

app.use(cors());
app.use(express.json());

// const queue = new Queue();

app.get("/", (req, res) => {
  res.send("Matching Service is running!");
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: "*", // In production, replace with your frontend's URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const queue = new Queue();
const matcher = new Matcher(queue, {
  notify: (success: boolean, username: string, roomId: string) => {
    console.log("Notifying client:", success, username, roomId);
    io.emit("serverToClient", {
      event: success
        ? ServerSocketEvents.MATCH_FOUND
        : ServerSocketEvents.MATCH_CANCELED,
      username,
      roomId,
    });
  },
});

const handleRequestMatch = async (socket: Socket, message: MatchRequest) => {
  console.log("Received match request:", message);
  const matchRequest: IMatchRequest = {
    username: message.username,
    topic: message.selectedTopic,
    difficulty: message.selectedDifficulty,
    timestamp: message.timestamp ? parseInt(message.timestamp) : Date.now(),
  };
  console.log(matchRequest);

  const result = await queue.add(matchRequest);
  console.log(result);

  matcher.start();
};

const handleCancelMatch = async (
  socket: Socket,
  message: MatchCancelRequest
) => {
  console.log("Received cancel request:", message);
  const cancelRequest: IMatchCancelRequest = {
    username: message.username,
  };

  const result = await queue.cancel(cancelRequest);
  console.log(result);

  io.emit("serverToClient", {
    event: ServerSocketEvents.MATCH_CANCELED,
    username: message.username,
  });
};

io.on("connection", (socket) => {
  console.log("Connected to API Gateway");

  socket.on(ClientSocketEvents.REQUEST_MATCH, (message: MatchRequest) =>
    handleRequestMatch(socket, message)
  );
  socket.on(ClientSocketEvents.CANCEL_MATCH, (message: MatchCancelRequest) =>
    handleCancelMatch(socket, message)
  );

  socket.on("disconnect", () => {
    console.log("Disconnected from API Gateway");
    socket.disconnect(true);
  });
});
