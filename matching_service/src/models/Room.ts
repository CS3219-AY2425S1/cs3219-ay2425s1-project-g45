import mongoose, { Document, Schema } from "mongoose";

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

// First, let's define the interface for our Room document
interface IRoom extends Document {
  _id: string;
  users: string[];
  question: IQuestion;
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

// Now, let's create the Mongoose schema
const RoomSchema: Schema = new Schema({
  users: { type: [String], required: true },
  topic: String,
  difficulty: { type: String, enum: DifficultyLevel },
  question: { type: Object, required: true },
  messages: [
    {
      userId: { type: String, required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create and export the Mongoose model
const RoomModel = mongoose.model<IRoom>("Room", RoomSchema);

export { IRoom, RoomModel };
