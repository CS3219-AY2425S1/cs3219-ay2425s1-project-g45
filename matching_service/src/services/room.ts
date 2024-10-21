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
