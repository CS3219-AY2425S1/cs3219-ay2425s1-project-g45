"use client";

import React, { useEffect, useState } from "react";
import Header from "../../../components/common/header";
import ProblemDetail from "../../../components/questions/problem-detail";
import { useAuth } from "../../../contexts/auth-context";
import { getQuestion } from "../../../app/actions/questions";
import { QuestionDto } from "peerprep-shared-types";

const Problem: React.FC<any> = ({ params }) => {
  const { token } = useAuth();

  const [question, setQuestion] = useState<QuestionDto>();

  useEffect(() => {
    if (token) {
      getQuestion(params.id, token).then((data) => {
        setQuestion(data?.message);
      });
    }
  }, [token]);

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10">
      <Header />
      <main className="relative mx-5 flex space-x-20 items-center flex-1">
        <div className="w-full pl-10">
          <ProblemDetail question={question} />
        </div>
      </main>
    </div>
  );
};

export default Problem;
