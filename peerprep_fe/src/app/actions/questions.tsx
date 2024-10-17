"use server";

import { QuestionForm } from "@/components/questions/question-form";
import dotenv from "dotenv";
import { QuestionDto } from "../types/QuestionDto";
import { parseFormData } from "../utility/questionsHelper";

dotenv.config();

type Response =
  | {
      message?: string;
      errors?: {
        errorMessage?: string[];
      };
    }
  | undefined;

export type FormRequest = (
  token: string | null,
  formState: Response,
  formData: FormData
) => Promise<Response>;

export async function getQuestions(token?: string | null) {
  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/api/questions/questions`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
    }
  );

  try {
    const data = await response.json();
    return {
      message: data,
      errors: {
        errorMessage: ["Unable to get questions"],
      },
    };
  } catch (error) {
    console.error(error);
  }
}

export async function getQuestion(id: string, token?: string | null) {
  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/api/questions/questions/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
    }
  );

  try {
    const data = await response.json();
    return {
      message: data,
      errors: {
        errorMessage: ["Unable to get question"],
      },
    };
  } catch (error) {
    console.error(error);
  }
}

export async function editQuestion(
  token: string | null,
  formData: QuestionForm,
  question?: QuestionDto
) {
  if (!question) {
    return {
      errors: {
        errorMessage: "Question not found.",
      },
    };
  }
  const { _id, ...rest } = question;
  const questionData = prepareFormDataForSubmission(formData);

  if ("error" in questionData) {
    return {
      errors: {
        errorMessage: questionData.error,
      },
    };
  }

  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/api/questions/questions/${_id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    }
  );

  try {
    const result = await response.json();
    if (response.ok) {
      return {
        message: result,
      };
    } else {
      return {
        errors: {
          errorMessage: result,
        },
      };
    }
  } catch (error) {
    console.error(error);
  }
}

export async function addQuestion(
  token: string | null,
  formData: QuestionForm
) {
  // Helper function to ensure the formData value is a string

  const questionData = prepareFormDataForSubmission(formData);

  if ("error" in questionData) {
    return {
      errors: {
        errorMessage: questionData.error,
      },
    };
  }

  const response = await fetch(
    `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/api/questions/questions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `bearer ${token}`,
      },
      body: JSON.stringify(questionData),
    }
  );

  try {
    const result = await response.json();
    if (response.ok) {
      return {
        message: result,
      };
    } else {
      return {
        errors: {
          errorMessage: result?.message ? result?.message : result,
        },
      };
    }
  } catch (error) {
    return {
      errors: {
        errorMessage: "An error occurred while adding the question.",
      },
    };
  }
}

export async function deleteQuestion(id: string, token?: string | null) {
  try {
    const response = await fetch(
      `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/api/questions/questions/${id}`,
      {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: `bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (response.ok) {
      return {
        message: data,
      };
    } else {
      return {
        message: data,
        errors: {
          questions: [`${data.message}`],
        },
      };
    }
  } catch (error: any) {
    console.error(error);
    return {
      message: "An error occurred while deleting the question",
      errors: {
        questions: [`${error.message}`],
      },
    };
  }
}

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
  const exampleEntries = formData.examples
    .split(";")
    .map((ex) => ex.trim())
    .filter((ex) => ex !== "");

  const processedExamples: {
    input: string;
    output: string;
    explanation?: string;
  }[] = [];

  for (const ex of exampleEntries) {
    const parts = ex.split("|").map((part) => part.trim());
    if (parts.length < 2 || parts.length > 3) {
      return {
        error: `Invalid example format: ${ex}. Examples (input|output|explanation; e.g., nums=[2,7,11,15], target=9|[0,1]|Because nums[0] + nums[1] == 9)`,
      };
    }
    processedExamples.push({
      input: parts[0],
      output: parts[1],
      explanation: parts[2],
    });
  }

  // Validate and process constraints
  const constraints = formData.constraints
    .split(";")
    .map((c) => c.trim())
    .filter((c) => c !== "");

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
