import mongoose, { Schema } from "mongoose";
import { IToken } from "../interfaces/IToken";

const TokenSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
  },
  { timestamps: true }
);

export const Token = mongoose.model<IToken & mongoose.Document>(
  "Token",
  TokenSchema
);
