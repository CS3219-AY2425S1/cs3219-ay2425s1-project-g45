import { RoomModel, DifficultyLevel } from "../models/Room";
import { generateQuestion } from "../utility/questionHelper";

// Create a new room
export async function createRoom(
  topic: string,
  difficulty: DifficultyLevel,
  users: string[]
) {
  try {
    const questionParams = { topic: topic, difficultyLevel: difficulty };
    const question = await generateQuestion(questionParams);
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
