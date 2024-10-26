import { DifficultyLevel, QuestionDto } from "./question";

export interface RoomDto {
  _id: string;
  users: string[];
  questionId: string;
  topic: string;
  difficulty: DifficultyLevel;
  //   messages: {
  //     userId: string;
  //     content: string;
  //     timestamp: Date;
  //   }[];

  createdAt: Date;
  updatedAt: Date;
}
