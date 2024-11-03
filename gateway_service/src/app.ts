// api-gateway/server.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import userRoutes from "./api/routes/userRoutes";
import questionRoutes from "./api/routes/questionRoutes";
import matchingRoutes from "./api/routes/matchingRoutes";
import collabRoutes from "./api/routes/collabRoutes";
import { authenticateToken } from "./utility/jwtHelper";
import { WebSocketHandler } from "./websocket-handler";
import RedisService from "./services/redisService";

dotenv.config();

class ApiGateway {
  private app: express.Application;
  private server: http.Server;
  // private wsHandler: WebSocketHandler;
  private port: string;
  // private redisService: RedisService;

  constructor() {
    this.app = express();
    this.port = "8080";
    this.server = http.createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();

    // Initialize Redis Service
    // this.redisService = RedisService.getInstance();

    // Initialize WebSocket handler
    // this.wsHandler = new WebSocketHandler(this.server);
  }

  // Initialize Redis and other async resources
  public async initialize(): Promise<void> {
    try {
      // Connect to Redis
      // await this.redisService.connect();
      console.log("🚀 Connected to Redis");
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error; // Re-throw error to handle it in the start method
    }
  }

  private validatePort(): string {
    const port = process.env.API_GATEWAY_PORT;
    if (!port) {
      throw new Error(
        "API_GATEWAY_PORT is not set in the environment variables"
      );
    }
    return port;
  }

  private setupMiddleware(): void {
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      })
    );

    this.app.use(express.json());
    this.app.use(this.logRequestTimestamp);
    this.app.use(this.errorHandler);
  }

  private setupRoutes(): void {
    this.app.use("/auth", userRoutes);
    this.app.use(authenticateToken);
    this.app.use("/api/questions", questionRoutes);
    this.app.use("/collab", collabRoutes);
    this.app.use("/", matchingRoutes);

    this.app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    });
  }

  private logRequestTimestamp(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  }

  private errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error(`[Error] ${err.stack}`);
    res.status(500).json({
      error: "Internal Server Error",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize async services (e.g., Redis)
      await this.initialize();

      this.server.listen(this.port, () => {
        console.log(`
          🚀 API Gateway running at http://localhost:${this.port}
          📝 Environment: ${process.env.NODE_ENV || "development"}
          🔑 Auth enabled: ${Boolean(process.env.JWT_SECRET)}
          🌐 WebSocket server running
        `);
      });

      // Graceful shutdown
      process.on("SIGTERM", () => {
        console.log("SIGTERM signal received: closing HTTP server");
        this.server.close(async () => {
          console.log("HTTP server closed");

          // Disconnect from Redis
          // await this.redisService.disconnect();
          console.log("Disconnected from Redis");

          process.exit(0);
        });
      });
    } catch (error) {
      console.error("Failed to start API Gateway:", error);
      process.exit(1);
    }
  }
}

// Create and start the gateway
const gateway = new ApiGateway();
gateway.start();
