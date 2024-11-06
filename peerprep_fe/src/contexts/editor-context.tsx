"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSocket } from "./socket-context";
import { useAuth } from "./auth-context";
import { useWorkspaceRoom } from "./workspaceroom-context";
import {
  EditorStateResponse,
  LanguageChangedResponse,
  LanguageChangeRequest,
} from "peerprep-shared-types/dist/types/sockets/editor";
import { ClientSocketEvents, ServerSocketEvents } from "peerprep-shared-types";
import { SocketIOProvider } from "y-socket.io";
import * as Y from "yjs";

const gatewayServiceURL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_GATEWAY_SERVICE_URL
    : "localhost:5003";

export enum Language {
  javascript = "javascript",
  python = "python",
  java = "java",
  typescript = "typescript",
}

interface EditorContextType {
  doc: Y.Doc;
  yProvider: SocketIOProvider;
  language: Language;
  setLanguage: (language: Language) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within a EditorProvider");
  }
  return context;
};

interface EditorProviderProps {
  children: ReactNode;
}

export const EditorProvider = ({ children }: EditorProviderProps) => {
  const { roomId } = useWorkspaceRoom();
  const { socket } = useSocket();
  const { username } = useAuth();
  const [ySocketProvider, setYSocketProvider] =
    useState<SocketIOProvider | null>(null);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [language, setLanguage] = useState<Language>(Language.javascript);

  const languageChange = (newLanguage: Language) => {
    if (!socket || !roomId) return;
    console.log("Sending language change from", username, ":", newLanguage);
    setLanguage(newLanguage);

    const request: LanguageChangeRequest = {
      roomId: roomId,
      username: username,
      language: newLanguage,
    };

    socket.emit(ClientSocketEvents.CHANGE_LANGUAGE, request);
  };

  const handleEditorState = (response: EditorStateResponse) => {
    const {
      state: { content, language },
    } = response;

    console.log("Editor state received", content, language);
    setLanguage(language as Language);
  };

  const handleLanguageChange = (response: LanguageChangedResponse) => {
    const { language } = response;
    console.log("Language change received", language);
    setLanguage(language as Language);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(ServerSocketEvents.EDITOR_STATE, handleEditorState);
    socket.on(ServerSocketEvents.LANGUAGE_CHANGED, handleLanguageChange);

    return () => {
      socket.off(ServerSocketEvents.EDITOR_STATE, handleEditorState);
      socket.off(ServerSocketEvents.LANGUAGE_CHANGED, handleLanguageChange);
    };
  }, [socket, roomId]);

  useEffect(() => {
    if (!roomId) return;

    console.log("Creating Y.Doc and SocketIOProvider");
    const yDoc = new Y.Doc();
    setYDoc(yDoc);
    const newSocketProvider = new SocketIOProvider(
      gatewayServiceURL,
      roomId,
      yDoc,
      {
        autoConnect: true,
        auth: { token: "valid-token" },
      }
    );

    setYSocketProvider(newSocketProvider);

    return () => {
      newSocketProvider.destroy();
    };
  }, [roomId]);

  useEffect(() => {
    if (!yDoc) return;
    console.log(yDoc.getText());
  });

  return (
    <EditorContext.Provider
      value={{
        doc: yDoc,
        yProvider: ySocketProvider,
        language,
        setLanguage: languageChange,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
