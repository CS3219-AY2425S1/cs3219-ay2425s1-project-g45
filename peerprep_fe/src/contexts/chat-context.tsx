"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSocket } from "./socket-context";
import {
  ClientSocketEvents,
  ServerSocketEvents,
  ChatMessage,
} from "peerprep-shared-types";
import { useAuth } from "./auth-context";
import { useWorkspaceRoom } from "./workspaceroom-context";
import { NewChatResponse } from "peerprep-shared-types/dist/types/sockets/comms";

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { roomId } = useWorkspaceRoom();
  const { socket } = useSocket();
  const { username } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleChatState = (messages: ChatMessage[]) => {
    console.log("Chat state received", messages);
    setMessages(messages);
  };

  const handleNewMessage = (request: NewChatResponse) => {
    const message = request.message;
    console.log("New message received", message);
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const sendMessage = (message: string) => {
    const trimmedMessage = message.trim();
    if (!socket || !roomId || trimmedMessage.length < 1) return;
    console.log("Sending message from", username, ":", trimmedMessage);
    socket.emit(ClientSocketEvents.SEND_MESSAGE, {
      username: username,
      roomId: roomId,
      message: trimmedMessage,
    });
  };

  useEffect(() => {
    if (!socket || socket.hasListeners(ServerSocketEvents.NEW_CHAT)) return;

    socket.on(ServerSocketEvents.NEW_CHAT, handleNewMessage);

    return () => {
      socket.off(ServerSocketEvents.NEW_CHAT);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !roomId) return;

    console.log("Getting chat state for room", roomId);
    socket.emit(ClientSocketEvents.GET_CHAT_STATE, {
      username: username,
      roomId: roomId,
    });
    console.log("Registered for chat state");
    socket.once(
      ServerSocketEvents.CHAT_STATE,
      ({ messages }: { messages: ChatMessage[] }) => handleChatState(messages)
    );

    return () => {
      socket.off(ServerSocketEvents.CHAT_STATE);
    };
  }, [socket, roomId, username]);

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};
