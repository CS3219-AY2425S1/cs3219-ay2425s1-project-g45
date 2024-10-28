import React, { useState } from "react";
import { ChatMessage } from "peerprep-shared-types";
import { useAuth } from "@/contexts/auth-context";
import Textfield from "../common/text-field";
import Button from "../common/button";

type ChatProps = {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
};

const Chat: React.FC<ChatProps> = ({
  messages = [],
  sendMessage = () => {},
}) => {
  const { username } = useAuth();
  const [messageToSend, setMessageToSend] = useState("");
  return (
    <div className="h-full bg-white dark:bg-slate-800 rounded-lg flex flex-col">
      <div className="max-h-full w-full overflow-y-scroll flex-grow">
        <div className="flex flex-col-reverse px-4">
          {messages &&
            messages.toReversed().map((message, index) => {
              return (
                <div
                  key={index}
                  className={`w-full mb-4 ${username === message.username ? "justify-items-end" : ""}`}
                >
                  <div
                    className={`text-sm font-medium text-gray-900 dark:text-slate-300 ${username === message.username ? "justify-self-end" : ""}`}
                  >
                    {message.username}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-zinc-400 text-wrap">
                    {message.message}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="flex justify-between space-x-5 items-center px-4">
        <div className="flex-grow">
          <Textfield
            placeholder_text="Message"
            maxLength={200}
            text={messageToSend}
            onChange={(e) => {
              e.preventDefault();
              setMessageToSend(e.target.value.trim());
            }}
          />
        </div>
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

export default Chat;
