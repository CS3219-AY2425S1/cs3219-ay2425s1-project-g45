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
import {
  useWorkspaceRoom,
  WorkspaceRoomProvider,
} from "./workspaceroom-context";
import {
  CodeChangedResponse,
  CodeChangeRequest,
  EditorStateResponse,
  LanguageChangedResponse,
  LanguageChangeRequest,
} from "peerprep-shared-types/dist/types/sockets/editor";
import { ClientSocketEvents, ServerSocketEvents } from "peerprep-shared-types";

export enum Language {
  javascript = "javascript",
  python = "python",
  java = "java",
  typescript = "typescript",
}

interface EditorContextType {
  code: string;
  language: Language;
  setCode: (code: string) => void;
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
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>(Language.javascript);

  const codeChange = (newCode: string) => {
    if (!socket || !roomId) return;
    console.log("Sending code change from", username, ":", newCode);
    setCode(newCode);

    const request: CodeChangeRequest = {
      roomId: roomId,
      username: username,
      sharedcode: newCode,
    };

    socket.emit(ClientSocketEvents.CHANGE_CODE, request);
  };

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
    setCode(content);
    setLanguage(language as Language);
  };

  const handleCodeChange = (response: CodeChangedResponse) => {
    if (response.username === username) return;
    const { sharedcode } = response;
    console.log("Editor change received", sharedcode);
    setCode(sharedcode);
  };

  const handleLanguageChange = (response: LanguageChangedResponse) => {
    const { language } = response;
    console.log("Language change received", language);
    setLanguage(language as Language);
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on(ServerSocketEvents.EDITOR_STATE, handleEditorState);
    socket.on(ServerSocketEvents.CODE_CHANGED, handleCodeChange);
    socket.on(ServerSocketEvents.LANGUAGE_CHANGED, handleLanguageChange);

    return () => {
      socket.off(ServerSocketEvents.EDITOR_STATE, handleEditorState);
      socket.off(ServerSocketEvents.CODE_CHANGED, handleCodeChange);
      socket.off(ServerSocketEvents.LANGUAGE_CHANGED, handleLanguageChange);
    };
  }, [socket, roomId]);

  return (
    <EditorContext.Provider
      value={{
        code,
        language,
        setCode: codeChange,
        setLanguage: languageChange,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
