import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function generateToken(payload: object, expiry: string = "12h"): string {
  const key = process.env.JWT_SECRET || "";
  const options = {
    expiresIn: expiry,
  };
  const token = jwt.sign(payload, key, options);
  return token;
}
