"use client";

import Header from "@/components/common/header";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import Button from "@/components/common/button";
import Chat from "@/components/workspace/chat";
import Problem from "@/components/workspace/problem";
import CodeEditor from "@/components/workspace/code-editor";
import { getQuestion } from "@/app/actions/questions";
import { getRoomById } from "@/app/actions/room";
import { RoomDto } from "peerprep-shared-types";

type WorkspaceProps = {
  params: {
    id: string;
    // Other properties
  };
};

const Workspace: React.FC<WorkspaceProps> = ({ params }) => {
  const router = useRouter();
  const { token, deleteToken } = useAuth();

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

  return (
    <div className="h-screen w-[80%] flex flex-col  mx-auto py-10 overscroll-contain">
      <Header>
        {/* <Button
          text="Match"
          onClick={() => {
            router.push("/match");
          }}
        /> */}

        <Button
          text="Logout"
          onClick={() => {
            deleteToken();
            router.push("/");
          }}
        />
      </Header>
      <div className="w-full flex items-start justify-start bg-gray-800 py-2 px-4 rounded-lg shadow-lg ">
        <div className="w-max flex items-center justify-start mr-5">
          <h3 className="text-xl font-semibold text-gray-300 mr-4">User 1</h3>
          <div className="bg-gray-700 px-4 py-2 rounded-md text-gray-100 min-w-[50px] text-center">
            {room?.users[0] || "Waiting..."}
          </div>
        </div>
        <div className="w-max flex items-center justify-start">
          <h3 className="text-xl font-semibold text-gray-300 mr-4">User 2</h3>
          <div className="bg-gray-700 px-4 py-2 rounded-md text-gray-100 min-w-[50px] text-center">
            {room?.users[1] || "Waiting..."}
          </div>
        </div>
      </div>
      <div className="flex h-full">
        {/* Left Pane */}
        <div className="flex-1 min-w-[50px] border-r border-gray-300 h-[80%]">
          <Problem question={room?.question} />
        </div>
        {/* Right Pane */}
        <div className="flex-1 min-w-[50px]">
          <div className="flex flex-col h-screen">
            <div className="flex-1 border-b border-gray-300 p-4">
              <CodeEditor />
            </div>
            <div className="flex-1 p-4">
              <Chat />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
