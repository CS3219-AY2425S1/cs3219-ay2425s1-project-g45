import mongoose, { Document, Schema } from "mongoose";
import { DifficultyLevel, ChatMessage, RoomDto } from "peerprep-shared-types";

// Now, let's create the Mongoose schema
const RoomSchema: Schema = new Schema({
  users: { type: [String], required: true },
  topic: String,
  difficulty: { type: String, enum: DifficultyLevel },
  question: { type: mongoose.Types.ObjectId, required: true },
  messages: [
    {
      username: { type: String, required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create and export the Mongoose model
const RoomModel = mongoose.model<RoomDto>("Room", RoomSchema);

export { RoomModel };
