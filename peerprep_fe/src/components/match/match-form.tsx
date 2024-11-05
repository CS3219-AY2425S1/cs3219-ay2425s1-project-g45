import React, { useEffect, useState } from "react";
import Button from "../../components/common/button";
import {
  ClientSocketEvents,
  DifficultyLevel,
  ServerSocketEvents,
} from "peerprep-shared-types";

import {
  MatchAddedResponse,
  MatchCancelRequest,
  MatchCancelResponse,
  MatchFoundResponse,
  MatchRequest,
  MatchTimeoutResponse,
} from "peerprep-shared-types/dist/types/sockets/match";

import Timer from "../../components/match/timer";
import "../../styles/modal.css";
import { useSocket } from "../../contexts/socket-context";
import { useAuth } from "../../contexts/auth-context";
import { useRouter } from "next/navigation";
import Modal from "../common/modal";
import { getQuestionTopics } from "../../app/actions/questions";

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
  const { username, token } = useAuth();

  const [topics, setTopics] = useState<string[]>();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (token) {
      getQuestionTopics(token).then((data) => {
        setTopics(data?.message);
        setFormData({
          difficultyLevel: DifficultyLevel.Easy,
          topic: topics[0],
        });
      });
    }
  }, [token]);

  // Usage in form submission
  const [loading, setLoading] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isMatchFoundModalOpen, setIsMatchFoundModalOpen] = useState(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const [roomId, setRoomId] = useState<string>("");
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
    setIsMatchFoundModalOpen(true);
    setRoomId(match.roomId);
  };

  const onTimeOut = (response: MatchTimeoutResponse) => {
    unregisterListeners();
    console.log("Time out response", response);
    setIsTimerModalOpen(false);
    setIsTimeoutModalOpen(true);
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

  const MatchFoundModal = () => {
    return (
      <Modal
        title="Match Found!"
        isOpen={isMatchFoundModalOpen}
        isCloseable={false}
        width="lg"
      >
        <div className="flex flex-col">
          <h1 className="text-2xl font-hairline font-albert">Join room?</h1>
          <div className="w-1/2 flex space-x-5 self-end">
            <Button
              type="reset"
              text="No Thanks"
              onClick={() => {
                setIsMatchFoundModalOpen(false);
              }}
            />
            <Button
              type="button"
              text="Join"
              onClick={() => {
                setIsMatchFoundModalOpen(false);
                router.push(`/workspace/${roomId}`);
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  const TimeOutModal = () => {
    return (
      <Modal isOpen={isTimeoutModalOpen} isCloseable={false} width="lg">
        <div className="flex flex-col">
          <h1 className="text-2xl font-hairline font-albert p-5">
            No Match Found
          </h1>
          <div className="w-1/2 flex space-x-5 self-end">
            <Button
              type="reset"
              text="Close"
              onClick={() => {
                setIsTimeoutModalOpen(false);
              }}
            />
            <Button
              type="button"
              text="Try Again"
              onClick={() => {
                sendMatch();
                setIsTimeoutModalOpen(false);
                setIsTimerModalOpen(true);
              }}
            />
          </div>
        </div>
      </Modal>
    );
  };

  const TimerModal = () => {
    return (
      <Modal isOpen={isTimerModalOpen} isCloseable={false} width="md">
        <div>
          <Timer onClose={() => setIsTimerModalOpen(false)} />
          <Button
            type="reset"
            onClick={() => {
              cancelMatch();
              setIsTimerModalOpen(false);
            }}
            text="CLOSE"
          />
        </div>
      </Modal>
    );
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

        <select
          name="topic"
          className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full h-16 p-4 my-3 focus:outline-none"
          value={formData.topic}
          onChange={handleChange}
        >
          {topics?.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

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
      <MatchFoundModal />
      <TimeOutModal />
      <TimerModal />
    </div>
  );
}
export default MatchForm;
