import React from "react";
import TableRow from "./table-row";
import { QuestionDto } from "peerprep-shared-types";

interface QuestionTableProps {
  questions: QuestionDto[];
  onClickEdit: (question: QuestionDto) => void;
  onClickDelete: (id: string) => void;
}

export default function QuestionsTable(props: QuestionTableProps) {
  const { questions, onClickEdit, onClickDelete } = props;

  return (
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
                onClickEdit={() => onClickEdit(question)}
                handleDelete={onClickDelete}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
