// "use server";

// import { MatchForm } from "@/components/match/match-form";
// import dotenv from "dotenv";
// import { MatchFormQuestionDto } from "../types/QuestionDto";
// import { parseFormData } from "../utility/questionsHelper";

// dotenv.config();

// type Response =
//   | {
//       message?: string;
//       errors?: {
//         errorMessage?: string[];
//       };
//     }
//   | undefined;

// export type FormRequest = (
//   token: string | null,
//   formState: Response,
//   formData: FormData
// ) => Promise<Response>;

// export async function findMatch(token: string | null, formData: MatchForm) {
//   // Helper function to ensure the formData value is a string

//   const matchData = prepareFormDataForSubmission(formData);

//   if ("error" in matchData) {
//     return {
//       errors: {
//         errorMessage: matchData.error,
//       },
//     };
//   }

//   // TODO: Implement the fetch call to the API Gateway for match finding
//   const response = await fetch(
//     `http://${process.env.GATEWAY_SERVICE_ROUTE}:${process.env.API_GATEWAY_PORT}/api/matchs/matchs`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `bearer ${token}`,
//       },
//       body: JSON.stringify(matchData),
//     }
//   );

//   try {
//     const result = await response.json();
//     if (response.ok) {
//       return {
//         message: result,
//       };
//     } else {
//       return {
//         errors: {
//           errorMessage: result?.message ? result?.message : result,
//         },
//       };
//     }
//   } catch (error) {
//     return {
//       errors: {
//         errorMessage: "An error occurred while finding a match.",
//       },
//     };
//   }
// }

// const prepareFormDataForSubmission = (
//   formData: MatchForm
// ): Omit<MatchFormQuestionDto, "_id"> | { error: string } => {
//   // Validate and process topic
//   const topics = formData.topic
//     .split(",")
//     .map((t) => t.trim())
//     .filter((t) => t !== "");
//   if (topics.length === 0) {
//     return { error: "At least one topic is required." };
//   }

//   try {
//     return {
//       difficultyLevel: formData.difficultyLevel,
//       topic: topics,
//     };
//   } catch (error) {
//     return { error: (error as Error).message };
//   }
// };
