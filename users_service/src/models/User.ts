import mongoose, { Document, mongo, Schema } from "mongoose";
import { IUser, Roles } from "../interfaces/IUser";

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    login_attempts: { type: Number, default: 0 },
    is_locked: { type: Boolean, default: false },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(Roles), default: Roles.user },
    history: {
      type: [
        {
          question: { type: String },
          attemptDateTime: { type: String, default: () => new Date().toISOString() },
          attemptData: { type: String, default: "" },
        }
      ],
      default: null, // set default to null
    },
    
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser & mongoose.Document>(
  "User",
  UserSchema
);
