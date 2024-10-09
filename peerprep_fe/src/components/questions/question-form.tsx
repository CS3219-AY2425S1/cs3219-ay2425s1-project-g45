import React, { useState } from "react";
import LargeTextfield from "@/components/common/large-text-field";
import Button from "@/components/common/button";
import { useAuth } from "@/contexts/auth-context";
import { DifficultyLevel, QuestionDto } from "@/app/types/QuestionDto";
import { addQuestion, editQuestion } from "@/app/actions/questions";

export enum FormType {
  EDIT = "Edit",
  ADD = "Add",
}

interface QuestionFormProps {
  initialQuestion?: QuestionDto;
  type: FormType;
  afterSubmit: VoidFunction;
  setQuestions: React.Dispatch<React.SetStateAction<QuestionDto[]>>;
  questions: QuestionDto[];
}

export interface QuestionForm {
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  topic: string;
  examples: string;
  constraints: string;
}

export function QuestionForm({
  initialQuestion,
  type,
  afterSubmit,
  setQuestions,
  questions,
}: QuestionFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<QuestionForm>({
    title: initialQuestion?.title || "",
    description: initialQuestion?.description || "",
    difficultyLevel: initialQuestion?.difficultyLevel || DifficultyLevel.Easy,
    topic: initialQuestion?.topic ? initialQuestion.topic.join(", ") : "",
    examples: initialQuestion?.examples
      ? initialQuestion.examples
          .map((ex) => `${ex.input}|${ex.output}|${ex.explanation || ""}`)
          .join("; ")
      : "",
    constraints: initialQuestion?.constraints
      ? initialQuestion.constraints.join("; ")
      : "",
  });
  const [error, setError] = useState<string>("");

  // Usage in form submission

  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      let response = null;
      if (type === FormType.EDIT) {
        response = await editQuestion(token, formData, initialQuestion);
        console.log("Editing question:", response);
      } else {
        response = await addQuestion(token, formData);
      }
      if (!response) {
        return;
      }

      if (response.errors) {
        console.log("Error adding question:", response.errors.errorMessage);
        setError(response.errors.errorMessage);
      } else {
        console.log("Success!:", response.message);

        if (type === FormType.EDIT) {
          const updatedQuestion = response.message as QuestionDto;
          const updatedQuestions = questions.map((question) => {
            if (question._id === updatedQuestion._id) {
              return updatedQuestion;
            } else {
              return question;
            }
          });
          setQuestions(updatedQuestions);
        } else {
          setQuestions([...questions, response.message as QuestionDto]);
        }

        afterSubmit();
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  return (
    <div>
      <h1 className="font-bold text-slate-200 dark:text-slate-700">
        {type} Question
      </h1>
      <form onSubmit={handleSubmit}>
        <LargeTextfield
          name="title"
          secure={false}
          placeholder_text="Title"
          text={formData.title}
          onChange={handleChange}
          required
        />
        <LargeTextfield
          name="description"
          secure={false}
          placeholder_text="Description"
          text={formData.description}
          onChange={handleChange}
          required
        />
        <select
          name="difficultyLevel"
          className="bg-slate-200 dark:bg-slate-700 rounded-lg w-full h-16 p-4 my-3 focus:outline-none"
          value={formData.difficultyLevel}
          onChange={handleChange}
        >
          {Object.values(DifficultyLevel).map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <LargeTextfield
          name="topic"
          secure={false}
          placeholder_text="Topics (comma-separated, e.g., Array, Hash Table)"
          text={formData.topic}
          onChange={handleChange}
          required
        />
        <LargeTextfield
          name="examples"
          secure={false}
          placeholder_text="Examples (input|output|explanation; e.g., nums=[2,7,11,15], target=9|[0,1]|Because nums[0] + nums[1] == 9)"
          text={formData.examples}
          onChange={handleChange}
          required
        />
        <LargeTextfield
          name="constraints"
          secure={false}
          placeholder_text='Constraints (semicolon-separated, e.g., "2 <= nums.length <= 10^4; -10^9 <= nums[i] <= 10^9")'
          text={formData.constraints}
          onChange={handleChange}
          required
        />
        {error && <p className="error">{error}</p>}
        {<Button type="submit" text={`${type} Question`} loading={loading} />}
      </form>
    </div>
  );
}
