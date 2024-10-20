import React, { useEffect, useState } from "react";
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
import Modal from "../common/modal";
import { getQuestionTopics } from "@/app/actions/questions";

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
      });
    }
  }, [token]);

  const handleTopicChange = (topic: string) => {
    setIsOpen(false);
    setFormData((prev) => {
      return { ...prev, topic: topic };
    });
  };

  console.log(formData);

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
        <div className="relative w-full ">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {formData.topic || "Select a topic"}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          {isOpen && (
            <ul className="absolute z-10 w-full py-1 mt-1 overflow-auto bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none">
              {topics?.map((topic) => (
                <li
                  key={topic}
                  onClick={() => handleTopicChange(topic)}
                  className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-100 hover:text-blue-900"
                >
                  {topic}
                </li>
              ))}
            </ul>
          )}
        </div>
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
