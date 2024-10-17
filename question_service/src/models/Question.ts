import mongoose, { Document, Schema } from "mongoose";

// Define an enum for difficulty levels
export enum DifficultyLevel {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
}

// Define the interface for the Question document
export interface IQuestion extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const QuestionSchema: Schema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficultyLevel: {
      type: String,
      enum: Object.values(DifficultyLevel),
      required: true,
    },
    topic: { type: [String], required: true },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: { type: String },
      },
    ],
    constraints: [{ type: String }],
  },
  { timestamps: true }
);

// Create and export the model
export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);
