import React, { useState } from "react";
import LargeTextfield from "@/components/common/large-text-field";
import Button from "@/components/common/button";
import {
  ClientSocketEvents,
  DifficultyLevel,
  MatchAddedResponse,
  MatchCancelRequest,
  MatchCancelResponse,
  MatchFoundResponse,
  MatchRequest,
  MatchTimeoutResponse,
  ServerSocketEvents,
} from "peerprep-shared-types";
import Timer from "@/components/match/timer";
import "../../styles/modal.css";
import { useSocket } from "@/contexts/socket-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export interface MatchFormQuestions {
  difficultyLevel: DifficultyLevel;
  topic: string;
}

export function MatchForm() {
  const [formData, setFormData] = useState<MatchFormQuestions>({
    difficultyLevel: DifficultyLevel.Easy,
    topic: "",
  });
  const [error, setError] = useState<string>("");
  const { socket } = useSocket();
  const { username } = useAuth();

  // Usage in form submission
  const [loading, setLoading] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const sendMatchRequest = (
    selectedDifficulty: DifficultyLevel,
    selectedTopic: string
  ) => {
    if (socket && username) {
      const matchRequest: MatchRequest = {
        event: ClientSocketEvents.REQUEST_MATCH,
        selectedDifficulty,
        selectedTopic,
        username: username,
      };
      registerListeners();
      socket.emit(ClientSocketEvents.REQUEST_MATCH, matchRequest);
    }
  };

  const cancelMatchRequest = () => {
    if (socket && username) {
      const matchRequest: MatchCancelRequest = {
        event: ClientSocketEvents.CANCEL_MATCH,
        username: username,
      };
      socket.on(ServerSocketEvents.MATCH_CANCELED, onMatchCancel);
      socket.emit(ClientSocketEvents.CANCEL_MATCH, matchRequest);
      unregisterListeners();
    }
  };

  const onMatchAdded = (match: MatchAddedResponse) => {
    console.log("Match Request Response", match);
    if (match.success) {
      setIsTimerModalOpen(true);
    }
  };

  const onMatchFound = (match: MatchFoundResponse) => {
    unregisterListeners();
    console.log("Match found", match);
    setIsTimerModalOpen(false);
    router.push(`/workspace/${match.roomId}`);
  };

  const onTimeOut = (response: MatchTimeoutResponse) => {
    unregisterListeners();
    console.log("Time out response", response);
    setIsTimerModalOpen(false);
    alert("No match found. Please try again.");
  };

  const onMatchCancel = (response: MatchCancelResponse) => {
    socket?.off(ServerSocketEvents.MATCH_CANCELED, onMatchCancel);
    console.log("Match cancel response", response);

    if (response.success) {
      setIsTimerModalOpen(false);
    }
  };

  const sendMatch = () => {
    sendMatchRequest(formData.difficultyLevel, formData.topic);
  };

  const cancelMatch = () => {
    cancelMatchRequest();
    setIsTimerModalOpen(false);
  };

  const registerListeners = () => {
    socket?.on(ServerSocketEvents.MATCH_FOUND, onMatchFound);
    socket?.on(ServerSocketEvents.MATCH_REQUESTED, onMatchAdded);
    socket?.on(ServerSocketEvents.MATCH_TIMEOUT, onTimeOut);
  };

  const unregisterListeners = () => {
    socket?.off(ServerSocketEvents.MATCH_FOUND, onMatchFound);
    socket?.off(ServerSocketEvents.MATCH_REQUESTED, onMatchAdded);
    socket?.off(ServerSocketEvents.MATCH_TIMEOUT, onTimeOut);
  };

  return (
    <div>
      <h1 className="text-2xl font-hairline font-albert">
        What are you working on today?
      </h1>
      <form>
        <select
          name="difficultyLevel"
          className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full h-16 p-4 my-3 focus:outline-none"
          value={formData.difficultyLevel}
          onChange={handleChange}
        >
          {Object.values(DifficultyLevel).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <LargeTextfield
          name="topic"
          secure={false}
          placeholder_text="Topics (comma-separated, e.g., Array, Hash Table)"
          text={formData.topic}
          onChange={handleChange}
          required
        />
        {error && <p className="error">{error}</p>}
        {
          <Button
            text={`Find`}
            loading={loading}
            disabled={!(formData.topic && formData.difficultyLevel)}
            onClick={() => {
              sendMatch();
              setIsTimerModalOpen(true);
            }}
          />
        }
      </form>
      {isTimerModalOpen && (
        <div className="timermodal">
          <div
            onClick={() => {
              setIsTimerModalOpen(false);
            }}
            className="overlay"
          ></div>
          <div className="timermodal-content">
            <Timer onClose={() => setIsTimerModalOpen(false)} />
            <Button
              type="reset"
              onClick={() => {
                cancelMatch();
              }}
              text="CLOSE"
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default MatchForm;
