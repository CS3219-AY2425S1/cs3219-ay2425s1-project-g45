import React, { useState } from "react";
import { ChatMessage } from "peerprep-shared-types";
import { useAuth } from "@/contexts/auth-context";
import Textfield from "../common/text-field";
import Button from "../common/button";

type CodeEditorProps = {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  messages = [],
  sendMessage = () => {},
}) => {
  const { username } = useAuth();
  const [messageToSend, setMessageToSend] = useState("");
  return (
    <div className="max-h-full pt-4 px-4 bg-white rounded-lg flex flex-col">
      <div className="flex flex-col-reverse overflow-y-scroll">
        {messages &&
          messages.toReversed().map((message, index) => {
            return (
              <div
                key={index}
                className={`w-full mb-4 ${username === message.username ? "justify-items-end" : ""}`}
              >
                <div className="ml-3">
                  <div
                    className={`text-sm font-medium text-gray-900 ${username === message.username ? "justify-self-end" : ""}`}
                  >
                    {message.username}
                  </div>
                  <div className="text-sm text-gray-500">{message.message}</div>
                </div>
              </div>
            );
          })}
      </div>
      <div className="flex justify-between space-x-5 items-center">
        <Textfield
          placeholder_text="Type a message"
          maxLength={200}
          text={messageToSend}
          onChange={(e) => setMessageToSend(e.target.value.trim())}
        />
        <div>
          <Button
            text="Send"
            type="button"
            onClick={() => {
              sendMessage(messageToSend);
              setMessageToSend("");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
