import React, { useState } from "react";
import LargeTextfield from "@/components/common/large-text-field";
import Button from "@/components/common/button";
import { useAuth } from "@/contexts/auth-context";
import { DifficultyLevel } from "peerprep-shared-types";
import Timer from "@/components/match/timer";
import "../../styles/modal.css";
import { useSocket } from "@/contexts/socket-context";

type MatchFormProps = {};

export interface MatchFormQuestions {
  difficultyLevel: DifficultyLevel;
  topic: string;
}

export function MatchForm() {
  const { token } = useAuth();
  const { sendMatchRequest, cancelMatchRequest } = useSocket();
  const [formData, setFormData] = useState<MatchFormQuestions>({
    difficultyLevel: DifficultyLevel.Easy,
    topic: "",
  });
  const [error, setError] = useState<string>("");

  // Usage in form submission

  const [loading, setLoading] = useState<boolean>(false);
  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   setLoading(true);
  //   setError("");

  //   try {
  //     let response = null;
  //     response = await findMatch(token, formData);
  //     if (!response) {
  //       return;
  //     }

  //     if (response.errors) {
  //       console.log("Error Finding Match:", response.errors.errorMessage);
  //       setError(response.errors.errorMessage);
  //     } else {
  //       console.log("Success!:", response.message);
  //     }
  //   } catch (err) {
  //     setError("An unexpected error occurred.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  const sendMatch = () => {
    sendMatchRequest(formData.difficultyLevel, formData.topic);
  };

  const cancelMatch = () => {
    cancelMatchRequest();
    setIsTimerModalOpen(false);
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
