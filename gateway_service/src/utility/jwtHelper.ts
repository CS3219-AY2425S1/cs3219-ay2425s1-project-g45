import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
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

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const auth = req.get("Authorization");
    const token = auth && auth.split(" ")[1];
    if (token == null || token == undefined) {
      console.error("error: no token");
      return res.sendStatus(401);
    }
    const key = process.env.JWT_SECRET || "";
    const payload: JwtPayload | string = jwt.verify(token, key);
    if (typeof payload === "string") {
      throw new Error("Invalid token");
    }
    req.body["username"] = payload?.username;
    req.body["role"] = payload?.role;
    next();
  } catch (error: any) {
    console.error("Error authenticating token:", error.message);
    res.sendStatus(403);
  }
}
