import {
  Example,
  QuestionForm,
} from "../../components/questions/question-form";
import { QuestionDto } from "peerprep-shared-types";

const prepareFormDataForSubmission = (
  formData: QuestionForm
): Omit<QuestionDto, "_id"> | { error: string } => {
  // Validate title and description
  if (!formData.title.trim() || !formData.description.trim()) {
    return { error: "Title and description are required." };
  }

  // Validate and process topic
  const topics = formData.topic
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t !== "");
  if (topics.length === 0) {
    return { error: "At least one topic is required." };
  }

  // Validate and process examples
  const processedExamples: Example[] = [];

  for (const ex of formData.examples) {
    if (ex.input.trim() === "") {
      return {
        error: "Example input is required.",
      };
    }
    if (ex.output.trim() === "") {
      return {
        error: "Example output is required.",
      };
    }
    processedExamples.push(ex);
  }

  // Validate and process constraints
  const constraints = formData.constraints;

  try {
    return {
      title: formData.title.trim(),
      description: formData.description.trim(),
      difficultyLevel: formData.difficultyLevel,
      topic: topics,
      examples: processedExamples,
      constraints: constraints,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
};

export default prepareFormDataForSubmission;
