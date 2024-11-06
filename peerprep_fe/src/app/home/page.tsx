"use client";

import { useEffect, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionDto } from "peerprep-shared-types";

import "../../styles/modal.css";

import { getQuestions } from "../../app/actions/questions";

import { useAuth } from "../../contexts/auth-context";

import Header from "../../components/common/header";
import { QuestionForm } from "../../components/questions/question-form";
import Button from "../../components/common/button";
import TableRow from "../../components/questions/table-row";
import { FormType } from "../../components/questions/question-form";
import Modal from "../../components/common/modal";

export default function Home() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionDto[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentEditQuestion, setCurrentEditQuestion] =
    useState<QuestionDto | null>(null);

  const { token, deleteToken, username } = useAuth();

  useEffect(() => {
    if (token) {
      getQuestions(token).then((data) => {
        setQuestions(data?.message);
      });
    }
  }, [token]);

  const handleDelete = (id: string) => {
    setQuestions(questions.filter((question) => question._id != id));
  };

  const AddQuestionModal = () => {
    if (!isAddModalOpen) return null;
    return (
      <Modal
        isOpen={isAddModalOpen}
        title="Add Question"
        width="4xl"
        height="3xl"
        isScrollable={true}
        onClose={() => setIsAddModalOpen(false)}
      >
        <QuestionForm
          type={FormType.ADD}
          afterSubmit={() => {
            setIsAddModalOpen(false);
          }}
          setQuestions={setQuestions}
          questions={questions}
        />
      </Modal>
    );
  };

  const EditQuestionModel = () => {
    if (!currentEditQuestion) return null;
    return (
      <Modal
        isOpen={currentEditQuestion ? true : false}
        title="Edit Question"
        width="4xl"
        height="3xl"
        isScrollable={true}
        onClose={() => setCurrentEditQuestion(null)}
      >
        <QuestionForm
          type={FormType.EDIT}
          afterSubmit={() => {
            setCurrentEditQuestion(null);
          }}
          initialQuestion={currentEditQuestion}
          setQuestions={setQuestions}
          questions={questions}
        />
      </Modal>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
      <Header>
        <div className="w-full h-full flex items-center justify-center">
          Hi {username}
        </div>
        <Button 
          text="History"
          onClick={() => {
            router.push("/history");
          }}
          />
        <Button
          text="Match"
          onClick={() => {
            router.push("/match");
          }}
        />
        <Button
          text="Logout"
          onClick={() => {
            deleteToken();
            router.push("/");
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
        <table className="min-w-full table-auto bg-white shadow-md scroll-smooth">
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
      <AddQuestionModal />
      <EditQuestionModel />
    </div>
  );
}
