import { RoomModel } from "../models/Room";
import { DifficultyLevel, ChatMessage } from "peerprep-shared-types";

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
      messages: [],
    });
    await newRoom.save();
    console.log("Room created successfully");
    return newRoom;
  } catch (error) {
    console.error("Error creating room:", error);
  }
}

export async function getRoom(roomId: string) {
  let room = null;
  try {
    room = await RoomModel.findById(roomId);
  } catch (error) {
    console.error("Error getting room:", error);
  }

  if (!room) {
    console.error("Room not found");
  }
  return room;
}

export async function getRoomMessages(roomId: string) {
  let room = await getRoom(roomId);
  let messages: ChatMessage[] = [];
  if (!room) {
    return messages;
  }
  room.messages.forEach((message) => {
    messages.push(message);
  });
  return messages;
}

export async function deleteRoom(roomId: string) {
  try {
    await RoomModel.findByIdAndDelete(roomId);
    console.log("Room deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting room:", error);
    return false;
  }
}

export async function updateQuestion(roomId: string, questionId: string) {
  let room = await getRoom(roomId);
  if (!room) {
    return false;
  }
  room.question = questionId;
  await room.save();
  return true;
}

export async function updateMessages(roomId: string, messages: ChatMessage[]) {
  const newRoom = await RoomModel.findByIdAndUpdate(
    roomId,
    {
      messages: messages,
    },
    { new: true, runValidators: true }
  );
  console.log("New room:", newRoom);
  return newRoom !== null;
}
