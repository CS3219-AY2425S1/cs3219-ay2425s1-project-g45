import { User } from "../models/User";
import { IUser } from "../interfaces/IUser";
import { Token } from "../models/Token";
import { IToken } from "../interfaces/IToken";
import { hashPassword, compareHash } from "../utility/passwordHelper";
import { generateToken } from "../utility/jwtHelper";
import { getResetToken } from "../utility/passwordHelper";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../utility/emailHelper";

const MAX_LOGIN_ATTEMPTS = 5;

export async function signUp(
  username: string,
  email: string,
  password: string
): Promise<string> {
  const orFilter = [{ username: username }, { email: email }];
  const hasUser = await User.exists({ $or: orFilter });
  if (!hasUser) {
    const hashedPassword = await hashPassword(password);
    const newUserBody = {
      username: username,
      email: email,
      password: hashedPassword,
    };

    const newUser = new User(newUserBody);
    await newUser.save();
    return generateUserJwt(newUser);
  } else {
    throw Error("User already exists");
  }
}

export async function signIn(username: string, password: string) {
  const user = await User.findOne({ username: username });
  console.log(username, password, user);
  console.log("user service");
  if (user) {
    if (!user.is_locked) {
      const isCorrectPassword = await compareHash(password, user.password);
      if (isCorrectPassword) {
        user.login_attempts = 0;
        await user.save();
        return generateUserJwt(user);
      } else {
        user.login_attempts += 1;
        if (user.login_attempts >= MAX_LOGIN_ATTEMPTS) {
          user.is_locked = true;
        }
        await user.save();
        throw Error("Invalid Password");
      }
    } else {
      throw Error(
        "User has been locked due to too many incorrect password attempts"
      );
    }
  } else {
    throw Error("User Not Found");
  }
}

function generateUserJwt(user: IUser) {
  const payload = {
    username: user.username,
    role: user.role,
  };
  return generateToken(payload);
}

export async function saveAttempt(
  username: string,
  question: string,
  datetime: string,
  code: string
): Promise<string> {
  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error("User not found");
    }

    // Push the new attempt to the user's history
    user.history.push({
      question,
      attemptDateTime: datetime,
      attemptData: code,
    });

    // Save the user document with the new history entry
    await user.save();

    return "Attempt saved successfully";
  } catch (error: any) {
    throw new Error("Failed to save attempt");
  }
}

export async function getHistory(username: string) {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }
    return user.history;
  } catch (error) {
    throw error;
  }
}

export async function getPasswordResetToken(username: string) {
  try {
    // check if the user exists
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    // if a token exists, delete it
    const token = Token.findOne({ username });
    if (token) {
      await token.deleteOne();
    }

    const { resetToken, hashedToken } = await getResetToken(username);

    await new Token({
      username: username,
      token: hashedToken,
      createdAt: Date.now(),
    }).save();

    sendPasswordResetEmail(user.email, username, resetToken);
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(
  username: string,
  password: string,
  newPassword: string
) {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_locked) {
      throw new Error("User account is locked");
    }

    const isCorrectPassword = await compareHash(password, user.password);
    if (isCorrectPassword) {
      user.login_attempts = 0;
      user.password = await hashPassword(newPassword);
      await user.save();

      return true;
    } else {
      user.login_attempts += 1;
      if (user.login_attempts >= MAX_LOGIN_ATTEMPTS) {
        user.is_locked = true;
      }
      await user.save();
      throw new Error("Invalid Password");
    }
  } catch (error) {
    throw new Error("Unable to reset password");
  }
}

export async function resetPasswordWithToken(
  username: string,
  resetToken: string,
  newPassword: string
) {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const token = await Token.findOne({ username });
    if (!token) {
      throw new Error("Expired password reset token");
    }

    const isTokenValid = await compareHash(resetToken, token.token);
    if (!isTokenValid) {
      throw new Error("Invalid password reset token");
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.is_locked = false;
    user.login_attempts = 0;
    await user.save();
    await token.deleteOne();

    await sendResetSuccessEmail(user.email, username);
  } catch (error) {
    throw error;
  }
}

export async function deleteAccount(username: string) {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    await user.deleteOne();
  } catch (error) {
    console.log(error);
    throw new Error("Unable to delete account");
  }
}
