
export interface IUser extends Document {
  username: string;
  password: string;
  login_attempts: number;
  is_locked: boolean;
  email: string;
  role: Roles;
}

export enum Roles {
  admin = "admin",
  user = "user",
}
