enum DifficultyLevel {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

interface QuestionDto {
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