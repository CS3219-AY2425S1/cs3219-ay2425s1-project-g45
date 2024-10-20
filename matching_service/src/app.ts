import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { Queue, IMatchRequest, IMatchCancelRequest } from "./services/queue";
import { Matcher } from "./services/matcher";
import {
  ClientSocketEvents,
  ServerSocketEvents,
  MatchRequest,
  MatchCancelRequest,
  PeerprepResponse,
} from "peerprep-shared-types";
import mongoose from "mongoose";
import { sendMessage } from "./utility/socketHelper";
import { RoomModel } from "./models/Room";

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.MATCHING_SERVICE_PORT;

// MongoDB Atlas connection string
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("MONGODB_URI is not defined in the environment variables.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Matching Service is running!");
});

// Get a room by ID
app.get("/room/:id", async (req, res) => {
  try {
    const room = await RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
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
const matcher = new Matcher(queue, sendResponse.bind(this));

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

  if (result.success) {
    sendResponse(ServerSocketEvents.MATCH_REQUESTED, message.username, result);

    setTimeout(() => {
      matcher.start();
    }, 1000); // Delayed to allow requests to be properly added to the queue
  }
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

  if (result.success) {
    sendResponse(ServerSocketEvents.MATCH_CANCELED, message.username, result);
  }
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

function sendResponse(
  event:
    | ServerSocketEvents.MATCH_FOUND
    | ServerSocketEvents.MATCH_REQUESTED
    | ServerSocketEvents.MATCH_CANCELED
    | ServerSocketEvents.MATCH_TIMEOUT,
  username: string,
  message?: any
) {
  console.log("Notifying client:", event, username, message);

  const response: PeerprepResponse = {
    event: event,
    username,
    ...message,
  };

  sendMessage(io, response);
}
