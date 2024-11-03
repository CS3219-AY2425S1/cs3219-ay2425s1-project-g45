import React, { useState } from "react";
import LargeTextfield from "../../components/common/large-text-field";
import Button from "../../components/common/button";
import { useAuth } from "../../contexts/auth-context";
import { QuestionDto, DifficultyLevel } from "peerprep-shared-types";
import { addQuestion, editQuestion } from "../../app/actions/questions";
import { v4 as uuidv4 } from "uuid";

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

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface QuestionForm {
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  topic: string;
  examples: Example[];
  constraints: string[];
}

interface DynamicField {
  id: string;
}

interface ExampleFields extends DynamicField {
  value: Example;
}

interface ConstraintFields extends DynamicField {
  value: string;
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
    examples: [],
    constraints: [],
  });
  const [error, setError] = useState<string>("");
  const [examples, setExamples] = useState<ExampleFields[]>(
    initialQuestion?.examples.map((ex) => {
      return {
        value: ex,
        id: uuidv4(),
      };
    }) ?? [{ value: { input: "", output: "" }, id: uuidv4() }]
  );
  const [constraints, setConstraints] = useState<ConstraintFields[]>(
    initialQuestion?.constraints.map((con) => {
      return { value: con, id: uuidv4() };
    }) ?? [{ value: "", id: uuidv4() }]
  );

  // Usage in form submission

  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    formData.examples = examples.map((ex) => ex.value as Example);
    formData.constraints = constraints.map((con) => con.value as string);

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

  const onAddExample = () => {
    setExamples((prev) => {
      return [...prev, { value: { input: "", output: "" }, id: uuidv4() }];
    });
  };

  const onRemoveExample = (index: number) => {
    const newExamples = examples.filter((_, i) => i !== index);
    setExamples(newExamples);
  };

  const onAddConstraint = () => {
    setConstraints((prev) => {
      return [...prev, { value: "", id: uuidv4() }];
    });
  };

  const onRemoveConstraint = (index: number) => {
    const newConstraints = constraints.filter((_, i) => i !== index);
    setConstraints(newConstraints);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    e.preventDefault();
    const { name, value, id } = e.target;
    if (name === "constraints") {
      setConstraints((prev) => {
        prev[Number(id)].value = value;
        return prev;
      });
      return;
    }
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const handleChangeExample = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, value, id } = e.target;
    const [, type] = name.split("-");
    setExamples((prev) => {
      const updatedExamples = prev.map((ex, index) => {
        if (index.toString() === id) {
          if (type === "input") {
            ex.value.input = value;
          } else if (type === "output") {
            ex.value.output = value;
          } else {
            ex.value.explanation = value;
          }
        }
        return ex;
      });
      return updatedExamples;
    });
  };

  return (
    <div>
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
        <div className="text-xl text-gray-500 dark:text-gray-400 flex justify-between">
          Examples
          <button onClick={onAddExample} type="button">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        {examples.map((field, index) => {
          const example = field.value;
          return (
            <div className="flex space-x-5" key={field.id}>
              <div className="w-1/3">
                <LargeTextfield
                  id={index.toString()}
                  name="examples-input"
                  secure={false}
                  placeholder_text="Input"
                  text={example.input}
                  onChange={handleChangeExample}
                  required
                />
              </div>
              <div className="w-1/3">
                <LargeTextfield
                  id={index.toString()}
                  name="examples-output"
                  secure={false}
                  placeholder_text="Output"
                  text={example.output}
                  onChange={handleChangeExample}
                  required
                />
              </div>
              <div className="w-1/3">
                <LargeTextfield
                  id={index.toString()}
                  name="examples-explanation"
                  secure={false}
                  placeholder_text="Explanation"
                  text={example.explanation}
                  onChange={handleChangeExample}
                />
              </div>

              <button
                hidden={examples.length === 1}
                type="button"
                onClick={() => {
                  onRemoveExample(index);
                }}
              >
                <span className="material-symbols-outlined warning">close</span>
              </button>
            </div>
          );
        })}
        <div className="text-xl text-gray-500 dark:text-gray-400 flex justify-between">
          Constraints
          <button onClick={onAddConstraint} type="button">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        {constraints.map((field, index) => {
          const constraint = field.value;
          return (
            <div className="flex space-x-5" key={field.id}>
              <div className="w-full">
                <LargeTextfield
                  id={index.toString()}
                  name="constraints"
                  secure={false}
                  placeholder_text="e.g 2 <= nums.length <= 10^4"
                  text={constraint}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                hidden={constraints.length === 1}
                type="button"
                onClick={() => {
                  onRemoveConstraint(index);
                }}
              >
                <span className="material-symbols-outlined warning">close</span>
              </button>
            </div>
          );
        })}

        {error && <p className="error">{error}</p>}
        {<Button type="submit" text={`${type} Question`} loading={loading} />}
      </form>
    </div>
  );
}
