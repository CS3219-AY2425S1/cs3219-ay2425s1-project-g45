"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import {
  ClientSocketEvents,
  RoomDto,
  ServerSocketEvents,
} from "peerprep-shared-types";
import { useSocket } from "./socket-context";
import { useAuth } from "./auth-context";
import {
  RoomJoinRequest,
  RoomLeaveRequest,
  UserJoinedResponse,
  UserLeftResponse,
} from "peerprep-shared-types/dist/types/sockets/room";
import { getRoomById } from "@/app/actions/room";
import {
  EditorStateResponse,
  NextQuestionReply,
  NextQuestionRequest,
} from "peerprep-shared-types/dist/types/sockets/editor";

interface UserJoinedDelegate {
  (user: string): void;
}

interface UserLeftDelegate {
  (user: string): void;
}

interface QuestionRequestedDelegate {
  (): void;
}

interface QuestionRepliedDelegate {
  (accepted: boolean): void;
}

interface WorkspaceRoomContextType {
  roomId: string;
  room: RoomDto | null;
  activeUsers: string[];
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  nextQuestion: () => void;
  replyNextQuestion: (accept: boolean) => void;
  setUserJoinedDelegate: (delegate: UserJoinedDelegate) => void;
  setUserLeftDelegate: (delegate: UserLeftDelegate) => void;
  setQuestionRequestedDelegate: (delegate: QuestionRequestedDelegate) => void;
  setQuestionRepliedDelegate: (delegate: QuestionRepliedDelegate) => void;
}

const WorkspaceRoomContext = createContext<WorkspaceRoomContextType | null>(
  null
);

export const useWorkspaceRoom = () => {
  const context = useContext(WorkspaceRoomContext);
  if (!context) {
    throw new Error(
      "useWorkspaceRoom must be used within a WorkspaceRoomProvider"
    );
  }
  return context;
};

interface WorkspaceRoomProviderProps {
  children: ReactNode;
}

export const WorkspaceRoomProvider = ({
  children,
}: WorkspaceRoomProviderProps) => {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [room, setRoom] = useState<RoomDto | null>(null);
  const { socket } = useSocket();
  const { username, token } = useAuth();
  const userJoinedDelegate = useRef<UserJoinedDelegate>(() => {});
  const userLeftDelegate = useRef<UserLeftDelegate>(() => {});
  const questionRequestedDelegate = useRef<QuestionRequestedDelegate>(() => {});
  const questionRepliedDelegate = useRef<QuestionRepliedDelegate>(() => {});

  const joinRoom = (roomId: string) => {
    if (!socket) return;
    console.log("Joining room", roomId);
    setRoomId(roomId);
    const request: RoomJoinRequest = {
      roomId: roomId,
      username: username,
    };
    socket.emit(ClientSocketEvents.JOIN_ROOM, request);
    getRoomState(roomId);
  };

  const leaveRoom = () => {
    if (!socket) return;
    console.log("Leaving room", roomId);
    const request: RoomLeaveRequest = {
      roomId: roomId,
      username: username,
    };
    socket.emit(ClientSocketEvents.LEAVE_ROOM, request);
    setRoomId(null);
  };

  const nextQuestion = () => {
    if (!socket || !room || activeUsers.length < 2) return;
    console.log("Requesting next question");
    const request: NextQuestionRequest = {
      roomId: room._id,
      username: username,
    };
    socket.emit(ClientSocketEvents.REQUEST_NEXT_QUESTION, request);
  };

  const replyNextQuestion = (accept: boolean) => {
    if (!socket || !room) return;
    console.log("Replying to next question request");
    const request: NextQuestionReply = {
      roomId: room._id,
      username: username,
      accepted: accept,
    };
    socket.emit(ClientSocketEvents.REPLY_NEXT_QUESTION, request);
  };

  const handleUserJoined = (response: UserJoinedResponse) => {
    const { username: user } = response;
    console.log("User joined", user);
    setActiveUsers((prevUsers) => [...prevUsers, user]);
    userJoinedDelegate.current(user);
  };

  const handleUserLeft = (response: UserLeftResponse) => {
    const { username: user } = response;
    console.log("User Left Response Received", response);
    console.log("Active Users", activeUsers);
    console.log("User left", user);
    setActiveUsers((prevUsers) => prevUsers.filter((u) => u !== user));
    userLeftDelegate.current(user);
  };

  const handleEditorState = (response: EditorStateResponse) => {
    console.log("Editor state received", response);

    const { state } = response;
    const { activeUsers } = state;
    setActiveUsers(() => {
      return activeUsers;
    });
  };

  const handleNextQuestionRequested = () => {
    console.log("Next question request received");
    questionRequestedDelegate.current();
  };

  const handleNextQuestionReplied = ({
    username,
    accepted,
  }: {
    username: string;
    accepted: boolean;
  }) => {
    console.log("Reply to next question request received");
    questionRepliedDelegate.current(accepted);
  };

  const handleQuestionChanged = ({ questionId }: { questionId: string }) => {
    console.log("Question changed to", questionId);
    setRoom((prevRoom) => {
      if (!prevRoom) return prevRoom;
      return {
        ...prevRoom,
        question: questionId,
      };
    });
  };

  const setUserJoinedDelegate = (delegate: UserJoinedDelegate) => {
    userJoinedDelegate.current = delegate;
  };

  const setUserLeftDelegate = (delegate: UserLeftDelegate) => {
    userLeftDelegate.current = delegate;
  };

  const setQuestionRequestedDelegate = (
    delegate: QuestionRequestedDelegate
  ) => {
    questionRequestedDelegate.current = delegate;
  };

  const setQuestionRepliedDelegate = (delegate: QuestionRepliedDelegate) => {
    questionRepliedDelegate.current = delegate;
  };

  const getRoomState = (roomId: string) => {
    if (!socket) return;
    console.log("Getting room state for room", roomId);
    getRoomById(roomId, token).then((data) => {
      setRoom(data.message);
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(ServerSocketEvents.USER_JOINED, handleUserJoined);
    socket.on(ServerSocketEvents.USER_LEFT, handleUserLeft);
    socket.on(ServerSocketEvents.EDITOR_STATE, handleEditorState);
    socket.on(
      ServerSocketEvents.NEXT_QUESTION_REQUESTED,
      handleNextQuestionRequested
    );
    socket.on(
      ServerSocketEvents.NEXT_QUESTION_REPLIED,
      handleNextQuestionReplied
    );
    socket.on(ServerSocketEvents.QUESTION_CHANGED, handleQuestionChanged);

    return () => {
      socket.off(ServerSocketEvents.USER_JOINED, handleUserJoined);
      socket.off(ServerSocketEvents.USER_LEFT, handleUserLeft);
      socket.off(ServerSocketEvents.EDITOR_STATE, handleEditorState);
      socket.off(
        ServerSocketEvents.NEXT_QUESTION_REQUESTED,
        handleNextQuestionRequested
      );
      socket.off(
        ServerSocketEvents.NEXT_QUESTION_REPLIED,
        handleNextQuestionReplied
      );
      socket.off(ServerSocketEvents.QUESTION_CHANGED, handleQuestionChanged);
    };
  }, [socket]);

  return (
    <WorkspaceRoomContext.Provider
      value={{
        roomId,
        activeUsers,
        room,
        joinRoom,
        leaveRoom,
        nextQuestion,
        replyNextQuestion,
        setUserJoinedDelegate,
        setUserLeftDelegate,
        setQuestionRequestedDelegate,
        setQuestionRepliedDelegate,
      }}
    >
      {children}
    </WorkspaceRoomContext.Provider>
  );
};
