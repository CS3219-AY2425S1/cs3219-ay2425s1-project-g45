import { DifficultyLevel } from "../models/Room";
import dotenv from "dotenv";

dotenv.config();

interface QuestionParams {
  topic: string | string[];
  difficultyLevel: DifficultyLevel;
}

export async function generateQuestion(params?: QuestionParams) {
  try {
    let url = new URL(
      `http://${process.env.QUESTION_SERVICE_ROUTE}:${process.env.QUESTION_SERVICE_PORT}/api/questions/random`
    );

    if (params) {
      if (params.topic) {
        if (Array.isArray(params.topic)) {
          params.topic.forEach((t) => url.searchParams.append("topic", t));
        } else {
          url.searchParams.append("topic", params.topic);
        }
      }
      if (params.difficultyLevel) {
        url.searchParams.append("difficultyLevel", params.difficultyLevel);
      }
    }

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch question. Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}
