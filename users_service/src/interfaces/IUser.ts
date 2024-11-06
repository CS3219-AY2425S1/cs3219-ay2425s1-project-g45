export interface IHistory {
  question: string;        // ID or reference to the question attempted
  attemptDateTime: string;     // Date-time of the attempt
  attemptData: string;       // Data of the attempt, could be answer text, code, etc.
}
export interface IUser extends Document {
  username: string;
  password: string;
  login_attempts: number;
  is_locked: boolean;
  email: string;
  role: Roles;
  history: IHistory[];
}

export enum Roles {
  admin = "admin",
  user = "user",
}

