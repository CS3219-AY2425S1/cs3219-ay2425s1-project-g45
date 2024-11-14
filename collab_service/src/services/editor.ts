import { EditorState } from "peerprep-shared-types";
import { HistoryModel } from "../models/History";

export class EditorManager {
  private roomEditorStates = new Map<string, EditorState>();

  initializeRoom(roomId: string, language: string = "javascript") {
    if (!this.roomEditorStates.has(roomId)) {
      console.log("Initializing room", roomId);
      this.roomEditorStates.set(roomId, {
        content: "",
        language,
        activeUsers: [],
      });
    }
    console.log(
      this.roomEditorStates.get(roomId),
      "roomEditorStates.get(roomId)"
    );
    return this.roomEditorStates.get(roomId)!;
  }

  addUserToRoom(roomId: string, username: string) {
    const state = this.roomEditorStates.get(roomId);
    if (state && !state.activeUsers.includes(username)) {
      state.activeUsers.push(username);
      return state;
    }
    return null;
  }

  removeUserFromRoom(roomId: string, username: string) {
    const state = this.roomEditorStates.get(roomId);
    if (state) {
      state.activeUsers = state.activeUsers.filter((user) => user !== username);
      return state;
    }
    return null;
  }

  updateCode(roomId: string, username: string, code: string) {
    const state = this.roomEditorStates.get(roomId);
    console.log("Updating code for", username, "in room", roomId);
    if (state) {
      state.content = code;
      return state;
    }
    console.log(state);
    return null;
  }

  getRoomState(roomId: string) {
    return this.roomEditorStates.get(roomId);
  }

  cleanupRoom(roomId: string) {
    return this.roomEditorStates.delete(roomId);
  }
}

export async function saveAttempt(
  username: string,
  question: string,
  datetime: string,
  code: string
): Promise<string> {
  try {
    // Create a new history entry
    const newHistoryEntry = new HistoryModel({
      username,
      question,
      attemptDateTime: datetime, // Set current timestamp
      attemptData: code,
    });

    // Save the new history entry
    await newHistoryEntry.save();

    return "Attempt saved successfully";
  } catch (error: any) {
    console.error("Error saving attempt:", error); // Log the actual error for debugging purposes
    throw new Error("Failed to save attempt");
  }
}

export async function getHistory(username: string) {
  try {
    const histories = await HistoryModel.find({ username });

    if (histories.length === 0) {
      throw new Error("No histories found for this username");
    }

    return histories;
  } catch (error) {
    throw error;
  }
}


