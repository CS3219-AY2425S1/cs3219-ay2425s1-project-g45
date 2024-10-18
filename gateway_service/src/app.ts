import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import userRoutes from "./api/routes/userRoutes";
import questionRoutes from "./api/routes/questionRoutes";
import { authenticateToken } from "./utility/jwtHelper";
import initializeSocketHandler from "./api/routes/socketRoutes";
import http from "http";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.API_GATEWAY_PORT;

if (!port) {
  console.error("API_GATEWAY_PORT is not set in the environment variables");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const logRequestTimestamp = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Apply the logging middleware to all routes
app.use(logRequestTimestamp);

// Routes
app.use("/auth", userRoutes);
app.use(authenticateToken);
app.use("/api/questions", questionRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("LeetCode API Gateway is running!");
});

const server = http.createServer(app);

const { io, connections, matchingServiceSocket } =
  initializeSocketHandler(server);

// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    io.close();
    matchingServiceSocket.disconnect();
  });
});
