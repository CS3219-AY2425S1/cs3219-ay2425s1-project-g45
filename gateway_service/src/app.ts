// api-gateway/server.ts
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import userRoutes from "./api/routes/userRoutes";
import questionRoutes from "./api/routes/questionRoutes";
import matchingRoutes from "./api/routes/matchingRoutes";
import { authenticateToken } from "./utility/jwtHelper";
import { WebSocketHandler } from "./websocket-handler";

// Load environment variables
dotenv.config();

class ApiGateway {
  private app: express.Application;
  private server: http.Server;
  private wsHandler: WebSocketHandler;
  private port: string;

  constructor() {
    // Initialize Express app
    this.app = express();
    this.port = this.validatePort();

    // Create HTTP server
    this.server = http.createServer(this.app);

    // Setup middleware and routes
    this.setupMiddleware();
    this.setupRoutes();

    // Initialize WebSocket handler
    this.wsHandler = new WebSocketHandler(this.server);
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
    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json());

    // Logging middleware
    this.app.use(this.logRequestTimestamp);

    // Error handling middleware
    this.app.use(this.errorHandler);
  }

  private setupRoutes(): void {
    // Public routes
    this.app.use("/auth", userRoutes);

    // Protected routes
    this.app.use(authenticateToken);
    this.app.use("/api/questions", questionRoutes);
    this.app.use("/", matchingRoutes);

    // Health check route
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

  public start(): void {
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
      this.server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  }
}

// Create and start the gateway
try {
  const gateway = new ApiGateway();
  gateway.start();
} catch (error) {
  console.error("Failed to start API Gateway:", error);
  process.exit(1);
}
