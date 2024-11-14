export interface ChatMessageProps {
  username: string;
  message: string;
  index: number;
  isSender: boolean;
}

const ChatMessage = ({
  username,
  message,
  index,
  isSender,
}: ChatMessageProps) => {
  return (
    <div
      key={index}
      className={`w-fit mb-4 bg-green-800 rounded-lg p-2
        ${isSender ? "self-end place-items-end" : ""}`}
    >
      <div className="text-sm font-medium text-gray-900 dark:text-slate-300">
        {username}
      </div>
      <div className="text-sm text-gray-500 dark:text-zinc-400 text-wrap">
        {message}
      </div>
    </div>
  );
};

export default ChatMessage;
