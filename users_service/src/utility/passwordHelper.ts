import bcrypt from "bcrypt";
import crypto from "crypto";
import { Token } from "../models/Token";

const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function compareHash(
  plaintext: string,
  hashed: string
): Promise<Boolean> {
  return bcrypt.compare(plaintext, hashed);
}

export async function getResetToken(username: string) {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = await bcrypt.hash(resetToken, saltRounds);

  return { resetToken: resetToken, hashedToken: hashedToken };
}
