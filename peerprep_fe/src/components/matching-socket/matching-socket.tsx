import { DifficultyLevel } from "@/app/types/QuestionDto";
import { AuthContext, useAuth } from "@/contexts/auth-context";
import { useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  "test server": (message: string) => void;
}

interface ClientToServerEvents {
  "test client": (message: string) => void;
  match: ({
    selectedDifficulty,
    selectedTopic,
  }: {
    selectedDifficulty: DifficultyLevel;
    selectedTopic: string;
  }) => void;
}
const MatchingSocket = ({ token }: { token: string }) => {
  const [serverMessage, setServerMessage] = useState<string>("");
  const [clientMessage, setClientMessage] = useState<string>("");
  console.log(token);
  const [socket, setSocket] = useState<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      "http://localhost:5004",
      {
        auth: {
          token: token,
        },
      }
    );
    setSocket(newSocket);

    newSocket.on("test server", (message) => {
      console.log("received");
      setServerMessage(message);
      console.log(message);
    });

    // Clean up on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const handleTestClient = () => {
    if (socket) {
      const message = `Client test at ${new Date().toLocaleTimeString()}`;
      const selectedTopic = "Array";
      const selectedDifficulty = DifficultyLevel.Medium;
      socket.emit("match", { selectedDifficulty, selectedTopic });
      setClientMessage(message);
    }
  };

  return (
    <div>
      <h2>Socket.IO Connection Test</h2>
      <button onClick={handleTestClient}>Send Test to Server</button>
      <div>
        <h3>Messages:</h3>
        <p>From Client: {clientMessage}</p>
        <p>From Server: {serverMessage}</p>
      </div>
    </div>
  );
};

export default MatchingSocket;
