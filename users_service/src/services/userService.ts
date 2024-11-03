import { User } from "../models/User";
import { IUser } from "../interfaces/IUser";
import { hashPassword, comparePassword } from "../utility/passwordHelper";
import { generateToken } from "../utility/jwtHelper";

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
      const isCorrectPassword = await comparePassword(password, user.password);
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
