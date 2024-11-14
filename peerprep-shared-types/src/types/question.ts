export enum DifficultyLevel {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

export interface QuestionDto {
  _id: string;
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  topic: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
}

export interface MatchFormQuestionDto {
  _id: string;
  difficultyLevel: DifficultyLevel;
  topic: string[];
}
