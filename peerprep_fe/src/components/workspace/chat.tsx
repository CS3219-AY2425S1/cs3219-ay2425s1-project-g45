import React from "react";
import { ChatMessage } from "peerprep-shared-types";
import { useAuth } from "@/contexts/auth-context";

type CodeEditorProps = {
  messages: ChatMessage[];
};

const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { messages } = props;
  const { username } = useAuth();
  return (
    <div>
      <div className="h-full flex-grow p-6 bg-white rounded-lg shadow-sm overflow-y-scroll">
        {messages &&
          messages.map((message) => {
            return (
              <div
                key={message.id}
                className={`flex items-center mb-4 ${username == message.username ? "justify-self-end" : ""}`}
              >
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    {message.username}
                  </div>
                  <div className="text-sm text-gray-500">{message.message}</div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CodeEditor;
