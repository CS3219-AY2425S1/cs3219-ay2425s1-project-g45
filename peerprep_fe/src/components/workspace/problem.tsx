import { getQuestion } from "../../app/actions/questions";
import { useAuth } from "../../contexts/auth-context";
import React, { useEffect, useState } from "react";
import { QuestionDto } from "peerprep-shared-types";

type ProblemProps = {
  questionId: string;
};

const Problem: React.FC<ProblemProps> = ({ questionId }) => {
  const { token } = useAuth();
  const [question, setQuestion] = useState<QuestionDto>();

  useEffect(() => {
    if (token) {
      getQuestion(questionId, token).then((data) => {
        setQuestion(data?.message);
      });
    }
  }, [token, questionId]);

  return (
    <div className="h-full flex flex-col">
      {/* Title bar for the problem */}
      <div className="workspacecomponent p-4 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 shadow-sm">
        <h2 className="questiontitle">{question?.title}</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 overflow-y-scroll rounded-b-lg flex-grow">
        {/* Problem content */}
        <div className="flex-grow p-6 shadow-sm">
          {/* Difficulty*/}
          <div className="mb-4">
            <span
              className={`difficulty ${getDifficultyColor(question?.difficultyLevel)}`}
            >
              {question?.difficultyLevel}
            </span>
          </div>

          {/* Description */}
          <div className="mb-4">
            <h3 className="title dark:text-white">Description</h3>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              {question?.description}
            </p>
          </div>

          {/* Examples */}
          {question?.examples && (
            <div className="mb-4">
              <h3 className="title dark:text-white">Examples</h3>
              {question.examples.map((example, index) => (
                <div
                  key={index}
                  className="mb-4 bg-gray-50 dark:bg-gray-700 p-4 border rounded-lg"
                >
                  <pre className="points">
                    <strong>Input:</strong> {example.input}
                  </pre>
                  <pre className="points">
                    <strong>Output:</strong> {example.output}
                  </pre>
                  {example.explanation && (
                    <pre className="points">
                      <strong>Explanation:</strong> {example.explanation}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Constraints */}
          {question?.constraints && (
            <div className="mb4">
              <h3 className="title dark:text-white">Constraints</h3>
              <ul className="list-disc list-inside text-gray-700">
                {question.constraints.map((constraint, index) => (
                  <li className="points" key={index}>
                    {constraint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Topic*/}
          <div className="mb-4">
            <h3 className="title dark:text-white">Topics</h3>
            <p>
              {question?.topic?.map((topic, index) => (
                <span key={index} className="topic">
                  {topic}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Problem;

/* Helper function to determine the color based on difficulty level */
const getDifficultyColor = (difficultyLevel: string | undefined) => {
  switch (difficultyLevel) {
    case "Easy":
      return "bg-green-500";
    case "Medium":
      return "bg-yellow-500";
    case "Hard":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};
