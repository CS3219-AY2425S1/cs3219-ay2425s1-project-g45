"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { DifficultyLevel } from "peerprep-shared-types";
import {
  ClientSocketEvents,
  ClientToServerEvents,
  MatchRequest,
  ServerSocketEvents,
  MatchCancelRequest,
  ServerToClientEvents,
} from "peerprep-shared-types";
import { useAuth } from "./auth-context";

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  sendMatchRequest: (
    selectedDifficulty: DifficultyLevel,
    selectedTopic: string
  ) => void;
  cancelMatchRequest: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

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
  const { token, username } = useAuth();

  useEffect(() => {
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      "http://localhost:5003",
      {
        auth: {
          token: token,
        },
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

    newSocket.on(ServerSocketEvents.MATCH_CANCELED, () => {
      console.log("match cancelled");

      // Handle different types of messages here
    });
    newSocket.on(ServerSocketEvents.MATCH_FOUND, (message) => {
      console.log("Match found", message);
      // Handle different types of messages here
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const sendMatchRequest = (
    selectedDifficulty: DifficultyLevel,
    selectedTopic: string
  ) => {
    if (socket && username) {
      const matchRequest: MatchRequest = {
        event: ClientSocketEvents.REQUEST_MATCH,
        selectedDifficulty,
        selectedTopic,
        username: username,
      };
      socket.emit(ClientSocketEvents.REQUEST_MATCH, matchRequest);
    }
  };

  const cancelMatchRequest = () => {
    if (socket && username) {
      const matchRequest: MatchCancelRequest = {
        event: ClientSocketEvents.CANCEL_MATCH,
        username: username,
      };
      socket.emit(ClientSocketEvents.CANCEL_MATCH, matchRequest);
    }
  };

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, sendMatchRequest, cancelMatchRequest }}
    >
      {children}
    </SocketContext.Provider>
  );
};
