import React from "react";
import Header from "@/components/common/header";
import ProblemDetail from "@/components/questions/problem-detail";
import { IQuestion } from "../../../../question_service/src/models/Question";

type ProblemProps = {
  question: IQuestion;
};

const Problem: React.FC<ProblemProps> = ({ question }) => {
  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10">
      <Header />
      <main className="relative mx-5 flex space-x-20 items-center flex-1">
        <div className="w-1/2 pl-10">
          <ProblemDetail question={question} />
        </div>
      </main>
    </div>
  );
};

export default Problem;
