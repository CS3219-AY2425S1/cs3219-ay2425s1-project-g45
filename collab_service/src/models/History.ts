import mongoose, { Document, Schema } from "mongoose";
// import {HistoryDTO} from "peerprep-shared-types";

export interface IHistory {
  username: string;
  question: string;
  attemptDateTime: string;
  attemptData: string;
  createdAt: Date;
  updatedAt: Date;
}

const HistorySchema: Schema = new Schema({
    username: { type: String, required: true },
    question: { type: String, required: true },
    attemptDateTime: { type: String, default: () => new Date().toISOString() },
    attemptData: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });
  
  const HistoryModel = mongoose.model<IHistory>("History", HistorySchema);
  
  export { HistoryModel };