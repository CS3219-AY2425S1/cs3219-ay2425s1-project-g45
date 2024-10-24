import { RoomModel } from "../models/Room";
import { DifficultyLevel } from "peerprep-shared-types";

// Create a new room
export async function createRoom(
  topic: string,
  difficulty: DifficultyLevel,
  users: string[],
  question: string
) {
  try {
    const newRoom = new RoomModel({
      users,
      question,
      topic,
      difficulty,
    });
    await newRoom.save();
    console.log("Room created successfully");
    return newRoom;
  } catch (error) {
    console.error("Error creating room:", error);
  }
}
