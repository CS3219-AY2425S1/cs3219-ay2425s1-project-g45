"use client";

import Header from "@/components/common/header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Button from "@/components/common/button";
import Chat from "@/components/workspace/chat";
import Problem from "@/components/workspace/problem";
import CodeEditor, { Language } from "@/components/workspace/code-editor";
import { getRoomById } from "@/app/actions/room";
import {
  ClientSocketEvents,
  RoomDto,
  ChatMessage,
} from "peerprep-shared-types";
import { useSocket } from "@/app/actions/socket";
import Modal from "@/components/common/modal";
import { VideoFeed } from "@/components/workspace/videofeed";
import { CallProvider } from "@/contexts/call-context";

type WorkspaceProps = {
  params: {
    id: string;
    // Other properties
  };
};

const Workspace: React.FC<WorkspaceProps> = ({ params }) => {
  const router = useRouter();
  const { token, username } = useAuth();
  const { socket } = useSocket();
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [sharedCode, setSharedCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>(Language.javascript);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<RoomDto>();
  const [isNextQnsModalOpen, setIsNextQnsModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [leaveMessage, setLeaveMessage] = useState<string>("");

  const handleCodeChange = (newContent: string) => {
    setSharedCode(newContent);
    if (!socket) return;
    console.log("Emitting code change");

    socket.emit(ClientSocketEvents.CODE_CHANGE, {
      message: {
        sharedCode: newContent,
        language: language,
      },
      event: ClientSocketEvents.CODE_CHANGE,
      roomId: params.id,
      username: username,
    });
  };

  const handleLanguageChange = (language: Language) => {
    setLanguage(language);

    if (!socket) return;
    console.log("Emitting code change");
    console.log(language);

    socket.emit(ClientSocketEvents.CODE_CHANGE, {
      message: {
        sharedCode: sharedCode,
        language: language,
      },
      event: ClientSocketEvents.CODE_CHANGE,
      roomId: params.id,
      username: username,
    });
  };

  function handleNewMessage(newMessage: ChatMessage) {
    console.log("New message received", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }

  function sendMessage(message: string) {
    const trimmedMessage = message.trim();
    if (!socket || !room || trimmedMessage.length < 1) return;
    console.log("Sending message from", username, ":", trimmedMessage);
    socket.emit(ClientSocketEvents.SEND_MESSAGE, {
      message: trimmedMessage,
      event: ClientSocketEvents.SEND_MESSAGE,
      roomId: room._id,
      username: username,
    });
  }

  function handleLeaveRoom() {
    if (!socket || !room) return;
    socket.emit(ClientSocketEvents.LEAVE_ROOM, {
      event: ClientSocketEvents.LEAVE_ROOM,
      roomId: room._id,
      username: username,
    });

    router.back();
  }

  function handleReplyNextQuestion(accept: boolean) {
    if (!socket || !room) return;
    console.log("Replying to next question request");
    socket.emit(ClientSocketEvents.REPLY_NEXT_QUESTION, {
      event: ClientSocketEvents.REPLY_NEXT_QUESTION,
      roomId: room._id,
      username: username,
      accept: accept,
    });
    setIsNextQnsModalOpen(false);
  }

  function handleNextQuestion() {
    if (!socket || !room || activeUsers.length < 2) return;
    console.log("Requesting next question");
    socket.emit(ClientSocketEvents.NEXT_QUESTION, {
      event: ClientSocketEvents.NEXT_QUESTION,
      roomId: room._id,
      username: username,
    });
  }

  const NextQuestionRequestModal = () => {
    // Show modal
    return (
      <Modal isOpen={isNextQnsModalOpen} isCloseable={false} width="lg">
        <div className="flex flex-col">
          <h1>Proceed to next question?</h1>
          <div className="w-1/2 flex space-x-5 self-end">
            <Button
              text="Reject"
              type="reset"
              onClick={() => {
                handleReplyNextQuestion(false);
              }}
            />
            <Button
              text="Accept"
              type="button"
              onClick={() => {
                handleReplyNextQuestion(true);
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  const ErrorModal = () => {
    return (
      <Modal isOpen={isErrorModalOpen} isCloseable={false} width="lg">
        <div className="flex flex-col">
          <h1>{error}</h1>
          <div className="w-1/4 flex space-x-5 self-end">
            <Button
              text="Ok"
              type="reset"
              onClick={() => {
                setIsErrorModalOpen(false);
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  const LeaveModal = () => {
    return (
      <Modal isOpen={isLeaveModalOpen} isCloseable={false} width="lg">
        <div className="flex flex-col">
          <h1>{leaveMessage}</h1>
          <div className="w-1/4 flex space-x-5 self-end">
            <Button
              text="Ok"
              type="reset"
              onClick={() => {
                setIsLeaveModalOpen(false);
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  useEffect(() => {
    console.log(params.id);
  }, []);

  useEffect(() => {
    if (token) {
      getRoomById(params.id, token).then((data) => {
        setRoom(data?.message);
      });
    }
  }, [token]);

  useEffect(() => {
    console.log("Shared code is", sharedCode);
  }, [sharedCode]);

  useEffect(() => {
    console.log("ROOM IS", room);
  }, [room]);

  useEffect(() => {
    if (!socket || !room?._id) return;

    console.log("Joining room", room?._id);
    // Join room using existing socket
    socket.emit(ClientSocketEvents.JOIN_ROOM, {
      roomId: room?._id,
      event: ClientSocketEvents.JOIN_ROOM,
      username: username,
    });
    socket.on(ClientSocketEvents.EDITOR_STATE, ({ content, activeUsers }) => {
      setSharedCode(content);
      setActiveUsers(activeUsers);
    });

    socket.on(
      ClientSocketEvents.CODE_CHANGE,
      ({ username: remoteUser, content: newContent, language }) => {
        console.log("hi, language is", language, "new content is", newContent);
        if (remoteUser !== username) {
          setSharedCode(newContent);
          setLanguage(language);
        }
      }
    );

    socket.on(ClientSocketEvents.USER_JOINED, ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
    });

    socket.on("roomUpdated", (room) => {
      setSharedCode(room.room.content);
      setActiveUsers(room.room.activeUsers);
    });

    socket.on(ClientSocketEvents.USER_LEFT, ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
    });

    socket.on(ClientSocketEvents.LEAVE_ROOM, (username) => {
      setLeaveMessage(`${username} has left the room`);
      console.log(leaveMessage);
      setIsLeaveModalOpen(true);
    });

    // Chat listeners
    if (!socket.hasListeners(ClientSocketEvents.NEW_CHAT)) {
      console.log("Adding new chat listener");
      socket.on(ClientSocketEvents.NEW_CHAT, (newMessage) => {
        handleNewMessage(newMessage);
      });
    }

    if (messages.length === 0) {
      console.log("Requesting chat state");
      socket.emit(ClientSocketEvents.CHAT_STATE, {
        event: ClientSocketEvents.CHAT_STATE,
        roomId: room._id,
      });
      socket.once(ClientSocketEvents.CHAT_STATE, ({ messages }) => {
        console.log("Chat state received", messages);
        setMessages(messages);
      });
    }

    // Next question listeners
    if (!socket.hasListeners(ClientSocketEvents.NEXT_QUESTION)) {
      socket.on(ClientSocketEvents.NEXT_QUESTION, () => {
        console.log("Next question request received");
        // Show modal
        setIsNextQnsModalOpen(true);
      });
    }

    if (!socket.hasListeners(ClientSocketEvents.REPLY_NEXT_QUESTION)) {
      socket.on(
        ClientSocketEvents.REPLY_NEXT_QUESTION,
        ({ username, accept }) => {
          console.log("Reply to next question request received");
          if (accept) {
            // Proceed to next question
            console.log("Request accepted by user", username);
          } else {
            console.log("Request rejected by user", username);

            setError(
              `${username} rejected the request to proceed to next question`
            );
            setIsErrorModalOpen(true);
          }
        }
      );
    }

    if (!socket.hasListeners(ClientSocketEvents.QUESTION_CHANGE)) {
      socket.on(ClientSocketEvents.QUESTION_CHANGE, ({ questionId }) => {
        console.log("Question changed to", questionId);
        setRoom((prevRoom) => {
          if (!prevRoom) return prevRoom;
          return {
            ...prevRoom,
            question: questionId,
          };
        });
      });
    }

    socket.on("disconnect", () => {});
  }, [socket, room]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isClosing", "true");
      setTimeout(() => {
        sessionStorage.removeItem("isClosing");
      }, 100); // Slight delay to ensure the flag is cleared on refresh
    };

    const handleUnload = () => {
      if (sessionStorage.getItem("isClosing") === "true") {
        handleLeaveRoom();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [handleLeaveRoom]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <CallProvider>
      <div className="flex flex-col max-h-screen">
        <Header>
          <div className="w-full flex items-start justify-start bg-gray-800 py-2 px-4 rounded-lg shadow-lg ">
            <div className="w-max flex items-center justify-start mr-5">
              <h3 className="text-base font-semibold text-gray-300 mr-4">
                User 1
              </h3>
              <div className="bg-gray-700 px-4 py-2 rounded-md text-gray-100 text-center text-sm">
                {(activeUsers.length && activeUsers[0]) || "Waiting..."}
              </div>
            </div>
            <div className="w-max flex items-center justify-start">
              <h3 className="text-base font-semibold text-gray-300 mr-4">
                User 2
              </h3>
              <div className="bg-gray-700 px-4 py-2 rounded-md text-gray-100 text-center text-sm">
                {(activeUsers.length > 1 && activeUsers[1]) || "Waiting..."}
              </div>
            </div>
          </div>
          <Button
            text="Leave Room"
            onClick={() => {
              handleLeaveRoom();
            }}
          />
        </Header>
        <div className="flex h-full overflow-auto">
          {/* Left Pane */}
          <div className="flex flex-col w-2/5 px-4">
            <div className="flex-grow h-1/2">
              <Problem questionId={room.question} />
            </div>
            <div className="flex-grow pt-4 h-1/2">
              <Chat messages={messages} sendMessage={sendMessage} />
            </div>
            <div className="flex-grow pt-4 h-1/2">
              <VideoFeed roomId={params.id} />
            </div>
          </div>

          <div className="border border-gray-300" />

          {/* Right Pane */}
          <div className="w-3/5 px-4 inline-flex flex-col">
            <CodeEditor
              language={language}
              sharedCode={sharedCode}
              handleCodeChange={handleCodeChange}
              setLanguage={handleLanguageChange}
            />
            <Button text="Next Question" onClick={handleNextQuestion} />
          </div>
        </div>
        <NextQuestionRequestModal />
        <LeaveModal />
        <ErrorModal />
      </div>
    </CallProvider>
  );
};

export default Workspace;
