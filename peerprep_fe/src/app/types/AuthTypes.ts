export type FormState =
  | {
      errors?: {
        name?: string;
        email?: string;
        password?: string;
        errorMessage?: string;
      };
      message?: { token: string; username: string };
    }
  | undefined;

export type TUser = {
  email: string;
  username: string;
};

export type AuthUser = {
  token: string;
  user: TUser;
};
