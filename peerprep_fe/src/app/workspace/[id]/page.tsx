"use client";

import Header from "@/components/common/header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Button from "@/components/common/button";
import Chat from "@/components/workspace/chat";
import Problem from "@/components/workspace/problem";
import CodeEditor from "@/components/workspace/code-editor";
import { ClientSocketEvents, ServerSocketEvents } from "peerprep-shared-types";
import { useSocket } from "@/app/actions/socket";
import Modal from "@/components/common/modal";
import { VideoFeed } from "@/components/workspace/videofeed";
import { useCall } from "@/contexts/call-context";
import { useWorkspaceRoom } from "@/contexts/workspaceroom-context";

type WorkspaceProps = {
  params: {
    id: string;
    // Other properties
  };
};

const Workspace: React.FC<WorkspaceProps> = ({ params }) => {
  const router = useRouter();
  const { socket } = useSocket();
  const {
    room,
    activeUsers,
    joinRoom,
    leaveRoom,
    nextQuestion,
    replyNextQuestion,
    setUserLeftDelegate,
    setQuestionRequestedDelegate,
    setQuestionRepliedDelegate,
  } = useWorkspaceRoom();
  const [isNextQnsModalOpen, setIsNextQnsModalOpen] = useState<boolean>(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [leaveMessage, setLeaveMessage] = useState<string>("");
  const { endCall } = useCall();

  function handleLeaveRoom() {
    leaveRoom();
    if (room) endCall();
    router.back();
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
                replyNextQuestion(false);
                setIsNextQnsModalOpen(false);
              }}
            />
            <Button
              text="Accept"
              type="button"
              onClick={() => {
                replyNextQuestion(true);
                setIsNextQnsModalOpen(false);
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

  const handleLeave = (user: string) => {
    console.log("User left:", user);
    setLeaveMessage(`${user} has left the room`);
    setIsLeaveModalOpen(true);
  };
  const handleNextQuestionRequested = () => {
    setIsNextQnsModalOpen(true);
  };
  const handleNextQuestionReplied = (accepted: boolean) => {
    if (!accepted) {
      setError("User rejected the request to proceed to next question");
      setIsErrorModalOpen(true);
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Join room using existing socket
    joinRoom(params.id);

    setUserLeftDelegate(handleLeave);
    setQuestionRequestedDelegate(handleNextQuestionRequested);
    setQuestionRepliedDelegate(handleNextQuestionReplied);

    socket.on("disconnect", () => {});
  }, [socket]);

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
  }, []);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
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
            <Chat />
          </div>
          <div className="flex-grow pt-4 h-1/2">
            <VideoFeed roomId={params.id} />
          </div>
        </div>

        <div className="border border-gray-300" />

        {/* Right Pane */}
        <div className="w-3/5 px-4 inline-flex flex-col">
          <CodeEditor />
          <Button text="Next Question" onClick={nextQuestion} />
        </div>
      </div>
      <NextQuestionRequestModal />
      <LeaveModal />
      <ErrorModal />
    </div>
  );
};

export default Workspace;
