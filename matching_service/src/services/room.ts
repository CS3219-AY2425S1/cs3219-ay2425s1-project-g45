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
  roomId: string;
  users: string[];
  question: IQuestion;
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
  roomId: { type: String, required: true, unique: true },
  users: { type: [String], required: true },
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

// Create a new room
export async function createRoom(
  roomId: string,
  topic: string,
  difficulty: DifficultyLevel,
  users: string[]
) {
  try {
    // todo call question service and generate  question based on topic and difficulty
    const question = {};
    const newRoom = new RoomModel({
      roomId,
      users,
      question,
    });
    await newRoom.save();
    console.log("Room created successfully");
    return newRoom;
  } catch (error) {
    console.error("Error creating room:", error);
  }
}

// Get room by ID
async function getRoomById(roomId: string) {
  try {
    const room = await RoomModel.findOne({ roomId });
    if (!room) {
      throw new Error("Room not found");
    }
    return room;
  } catch (error) {
    console.error("Error getting room:", error);
  }
}

// Delete a room
async function deleteRoom(roomId: string) {
  try {
    const result = await RoomModel.deleteOne({ roomId });
    if (result.deletedCount === 0) {
      throw new Error("Room not found");
    }
    console.log("Room deleted successfully");
  } catch (error) {
    console.error("Error deleting room:", error);
  }
}
