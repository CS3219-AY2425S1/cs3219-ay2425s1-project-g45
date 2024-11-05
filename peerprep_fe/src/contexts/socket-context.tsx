"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
} from "peerprep-shared-types";
import { useAuth } from "./auth-context";
import dotenv from "dotenv";

dotenv.config();
interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);
const gatewayServiceURL =
  process.env.NODE_ENV === "production"
    ? process.env.GATEWAY_SERVICE_URL
    : `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}`;

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      return;
    }

    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      gatewayServiceURL,
      {
        auth: {
          token: token,
        },
        transports: ["websocket"],
      }
    );

    newSocket.on("connect", () => {
      console.log("Connected to socket");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
