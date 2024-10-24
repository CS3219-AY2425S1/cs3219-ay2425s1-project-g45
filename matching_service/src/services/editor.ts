export interface EditorState {
  content: string;
  language: string;
  activeUsers: string[];
}

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
