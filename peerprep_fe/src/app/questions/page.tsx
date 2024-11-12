"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { QuestionDto } from "peerprep-shared-types";

import "../../styles/modal.css";

import { getQuestions } from "../actions/questions";

import { useAuth } from "../../contexts/auth-context";

import Header from "../../components/common/header";
import { QuestionForm } from "../../components/home/question-form";
import Button from "../../components/common/button";
import { FormType } from "../../components/home/question-form";
import Modal from "../../components/common/modal";
import QuestionsTable from "@/components/home/questions-table";

export default function questions() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionDto[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentEditQuestion, setCurrentEditQuestion] =
    useState<QuestionDto | null>(null);

  const { token, username, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      redirect("/home");
    }
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
          text="Profile"
          onClick={() => {
            router.push("/profile");
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
      <QuestionsTable
        questions={questions}
        onClickDelete={handleDelete}
        onClickEdit={setCurrentEditQuestion}
      />
      <AddQuestionModal />
      <EditQuestionModel />
    </div>
  );
}
