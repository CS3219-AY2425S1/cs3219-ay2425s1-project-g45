"use client";

import Header from "@/components/common/header";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import Button from "@/components/common/button";
import Chat from "@/components/workspace/chat";
import Problem from "@/components/workspace/problem";
import CodeEditor from "@/components/workspace/code-editor";

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

  return (
    <div className="h-screen w-[80%] flex flex-col  mx-auto py-10 overscroll-contain">
      <Header>
        <Button
          text="Match"
          onClick={() => {
            router.push("/match");
          }}
        />
        <Button
          text="Logout"
          onClick={() => {
            deleteToken();
            router.push("/");
          }}
        />
      </Header>
      <div className="flex h-full">
        {/* Left Pane */}
        <div className="flex-1 min-w-[50px] border-r border-gray-300 h-[80%]">
          <Problem />
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
