import React from "react";

const ProblemDetail = ({ question }) => {
  if (!question) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading question...</p>
      </div>
    );
  }

  const getDifficultyColor = (level) => {
    switch (level) {
      case "Easy":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 bg-white rounded-lg p-6 shadow">
      {/* Title and Difficulty Section */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(question.difficultyLevel)}`}
          >
            {question.difficultyLevel}
          </span>
        </div>
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-2">
        {question.topic.map((topic, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 p-6 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Problem Description
        </h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {question.description}
        </p>
      </div>

      {/* Examples */}
      <div className="rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Examples</h2>
        <div className="space-y-6">
          {question.examples.map((example, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-700">Input: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-gray-700 text-sm font-mono">
                    {example.input}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Output: </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700 font-mono">
                    {example.output}
                  </code>
                </div>
                {example.explanation && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Explanation:{" "}
                    </span>
                    <span className="text-gray-600">{example.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div className="rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Constraints</h2>
        <ul className="space-y-2">
          {question.constraints.map((constraint, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-gray-400">•</span>
              <span className="text-gray-700">{constraint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProblemDetail;
