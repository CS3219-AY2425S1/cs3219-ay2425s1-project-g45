import { ChatState, ChatMessage } from "peerprep-shared-types";
import { getRoomMessages, updateMessages } from "./roomService";

export class ChatManager {
  private roomChatStates = new Map<string, ChatState>();

  initialiseChat(roomId: string) {
    if (!this.roomChatStates.has(roomId)) {
      console.log("Initializing chat for room", roomId);
      getRoomMessages(roomId).then((messages) => {
        this.roomChatStates.set(roomId, { messages: messages || [] });
      });
    }
    console.log("roomChatStates.get(roomId)", this.roomChatStates.get(roomId));
    return this.roomChatStates.get(roomId)!;
  }

  addMessage(roomId: string, message: string, username: string) {
    const state = this.roomChatStates.get(roomId);
    if (state) {
      console.log("Adding message to room", roomId);
      console.log("message", message);
      state.messages.push({
        message: message,
        username: username,
        timestamp: new Date(),
      });
      return true;
    }
    console.error("Room chat state not found");
    return false;
  }

  getChatState(roomId: string) {
    return this.roomChatStates.get(roomId);
  }

  cleanupChat(roomId: string) {
    const messages = this.roomChatStates.get(roomId)?.messages || [];
    if (messages.length > 0) {
      updateMessages(roomId, messages);
    }
    return this.roomChatStates.delete(roomId);
  }

  getChatHistory(roomId: string) {
    const state = this.roomChatStates.get(roomId);
    if (state) {
      return state.messages;
    }
    return null;
  }

  getNewMessages(roomId: string, lastMessageTimestamp: Date) {
    const state = this.roomChatStates.get(roomId);
    if (state) {
      return state.messages.filter((message: ChatMessage) => {
        return new Date(message.timestamp) > new Date(lastMessageTimestamp);
      });
    }
    return null;
  }
}
