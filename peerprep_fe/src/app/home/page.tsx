"use client";

import Header from "@/components/common/header";
import { getQuestions } from "@/app/actions/questions";
import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import "../../styles/modal.css";
import { QuestionForm } from "@/components/questions/question-form";
import Button from "@/components/common/button";
import TableRow from "@/components/questions/table-row";
import { useAuth } from "@/contexts/auth-context";
import { FormType } from "@/components/questions/question-form";
import { QuestionDto } from "../types/QuestionDto";

export default function Home() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionDto[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentEditQuestion, setCurrentEditQuestion] =
    useState<QuestionDto | null>(null);

  const { token, deleteToken } = useAuth();

  useEffect(() => {
    if (token) {
      console.log(token);
      // // TODO: Validate token is still valid

      getQuestions(token).then((data) => {
        setQuestions(data?.message);
      });
    }
    console.log("No token found");
  }, [token]);

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((question) => question._id != id));
  };

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
      <Header>
        <Button
          text="Logout"
          onClick={() => {
            deleteToken();
            router.push("/auth/login");
          }}
        />
      </Header>
      <Button
        type="submit"
        onClick={() => {
          setIsAddModalOpen(true);
        }}
        text="Add Question"
      />
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white shadow-md   scroll-smooth">
          <thead className="sticky top-0">
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Questions</th>
              <th className="py-3 px-6 text-left">Difficulty</th>
              <th className="py-3 px-6 text-left">Topics</th>
              <th className="py-3 px-6 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light overflow-y-scroll">
            {questions?.map((question, index) => {
              return (
                <TableRow
                  id={question._id}
                  title={question.title}
                  difficulty={question.difficultyLevel}
                  topics={question.topic}
                  key={index}
                  onClickEdit={() => setCurrentEditQuestion(question)}
                  handleDelete={handleDelete}
                />
              );
            })}
          </tbody>
        </table>
      </div>
      {isAddModalOpen && (
        <div className="modal">
          <div
            onClick={() => {
              setIsAddModalOpen(false);
            }}
            className="overlay"
          ></div>
          <div className="modal-content">
            <QuestionForm
              type={FormType.ADD}
              afterSubmit={() => {
                setIsAddModalOpen(false);
              }}
              setQuestions={setQuestions}
              questions={questions}
            />
            <Button
              type="reset"
              onClick={() => {
                setIsAddModalOpen(false);
              }}
              text="CLOSE"
            />
          </div>
        </div>
      )}
      {currentEditQuestion && (
        <div className="modal">
          <div
            onClick={() => {
              setCurrentEditQuestion(null);
            }}
            className="overlay"
          ></div>
          <div className="modal-content">
            <QuestionForm
              type={FormType.EDIT}
              afterSubmit={() => {
                setCurrentEditQuestion(null);
              }}
              initialQuestion={currentEditQuestion}
              setQuestions={setQuestions}
              questions={questions}
            />
            <Button
              type="reset"
              onClick={() => {
                setCurrentEditQuestion(null);
              }}
              text="CLOSE"
            />
          </div>
        </div>
      )}
    </div>
  );
}
