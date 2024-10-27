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
import { ClientSocketEvents, RoomDto } from "peerprep-shared-types";
import { useSocket } from "@/app/actions/socket";

type WorkspaceProps = {
  params: {
    id: string;
    // Other properties
  };
};

const Workspace: React.FC<WorkspaceProps> = ({ params }) => {
  const router = useRouter();
  const { token, deleteToken, username } = useAuth();
  const { socket } = useSocket();

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

  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [sharedCode, setSharedCode] = useState<string>("");
  const [language, setLanguage] = useState<Language>(Language.javascript);

  useEffect(() => {
    console.log(params.id);
  }, []);

  const [room, setRoom] = useState<RoomDto>();

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
    });

    socket.on(ClientSocketEvents.USER_LEFT, ({ username, activeUsers }) => {
      setActiveUsers(activeUsers);
    });

    socket.on("disconnect", () => {});
  }, [socket, room]);

  if (!room) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header>
        <div className="w-full flex items-start justify-start bg-gray-800 py-2 px-4 rounded-lg shadow-lg ">
          <div className="w-max flex items-center justify-start mr-5">
            <h3 className="text-base font-semibold text-gray-300 mr-4">
              User 1
            </h3>
            <div className="bg-gray-700 px-4 py-2 rounded-md text-gray-100 text-center text-sm">
              {(room?.users?.length && room.users[0]) || "Waiting..."}
            </div>
          </div>
          <div className="w-max flex items-center justify-start">
            <h3 className="text-base font-semibold text-gray-300 mr-4">
              User 2
            </h3>
            <div className="bg-gray-700 px-4 py-2 rounded-md text-gray-100 text-center text-sm">
              {(room?.users?.length && room.users[1]) || "Waiting..."}
            </div>
          </div>
        </div>
        <Button
          text="Logout"
          onClick={() => {
            deleteToken();
            router.push("/");
          }}
        />
      </Header>
      <div className="h-screen flex h-full">
        {/* Left Pane */}
        <div className="flex-1 w-2/5 border-r border-gray-300 h-full">
          <div className="h-1/2">
            <Problem questionId={room.question} />
          </div>
          <div className="flex-1 p-4 h-1/2">
            <Chat messages={room.messages} />
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 w-3/5">
          <div className="flex flex-col h-screen">
            <CodeEditor
              language={language}
              sharedCode={sharedCode}
              handleCodeChange={handleCodeChange}
              setLanguage={handleLanguageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
