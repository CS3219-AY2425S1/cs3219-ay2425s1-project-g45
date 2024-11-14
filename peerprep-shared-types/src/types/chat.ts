export interface ChatMessage {
  username: string;
  message: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
}
