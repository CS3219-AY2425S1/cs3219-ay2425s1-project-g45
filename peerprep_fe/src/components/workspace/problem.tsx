import { getQuestion } from "@/app/actions/questions";
import { QuestionDto } from "@/../../peerprep-shared-types/src/types/question";
import { useAuth } from "@/contexts/auth-context";
import React, { useEffect, useState } from "react";

type ProblemProps = {
  question?: QuestionDto;
};

const Problem: React.FC<ProblemProps> = ({ question }) => {
  const { token } = useAuth();

  return (
    <div className="flex flex-col h-full p-4">
      {/* Title bar for the problem */}
      <div className="workspacecomponent p-4 bg-gray-100 border-b border-gray-200 shadow-sm">
        <h2 className="questiontitle">{question?.title}</h2>
      </div>

      {/* Problem content */}
      <div className="flex-grow p-6 bg-white rounded-b-lg shadow-sm">
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
          <h3 className="title">Description</h3>
          <p className="text-gray-700">{question?.description}</p>
        </div>

        {/* Examples */}
        {question?.examples && (
          <div className="mb-4">
            <h3 className="title">Examples</h3>
            {question.examples.map((example, index) => (
              <div
                key={index}
                className="mb-4 bg-gray-50 p-4 border rounded-lg"
              >
                <pre className="text-gray-700 mb-2">
                  <strong>Input:</strong> {example.input}
                </pre>
                <pre className="text-gray-700 mb-2">
                  <strong>Output:</strong> {example.output}
                </pre>
                {example.explanation && (
                  <pre className="text-gray-600">
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
            <h3 className="title">Constraints</h3>
            <ul className="list-disc list-inside text-gray-700">
              {question.constraints.map((constraint, index) => (
                <li key={index}>{constraint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Topic*/}
        <div className="mb-4">
          <h3 className="title">Topics</h3>
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
