import React from "react";
import { QuestionDto } from "peerprep-shared-types";
type ProblemDetailProps = {
  question: QuestionDto | undefined;
};

const ProblemDetail: React.FC<ProblemDetailProps> = ({ question }) => {
  return (
    <div className="w-full h-full">
      <div>
        <div className="text-xl">Title:</div>
        <div className="pt-1 text-xl font-bold">{question?.title}</div>
      </div>
      <div className="pt-8">
        <div className="text-xl">Description:</div>
        <div className="pt-1 text-xl font-bold">{question?.description}</div>
      </div>
    </div>
  );
};

export default ProblemDetail;
