import { ChatMessage } from "./chat";
import { DifficultyLevel } from "./question";

export interface RoomDto {
  _id: string;
  users: string[];
  question: string;
  topic: string;
  difficulty: DifficultyLevel;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
