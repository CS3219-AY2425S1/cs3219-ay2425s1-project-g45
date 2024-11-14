import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { ExtendedError, Socket } from "socket.io";

dotenv.config();

interface IVerifyJWTNext {
  success(decoded: JwtPayload): void;
  error(err: Error): void;
}

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
  console.log(`Request Received: ${JSON.stringify(req.body)}`);
  const auth = req.get("Authorization");
  const token = auth && auth.split(" ")[1];
  if (token == null || token == undefined) {
    console.error("error: no token");
    return res.sendStatus(401);
  }

  verifyJWT(token, {
    success: (payload: JwtPayload) => {
      req.body["username"] = payload.username;
      req.body["role"] = payload.role;
      next();
    },
    error: (err: Error) => {
      console.error("Error authenticating token:", err.message);
      res.sendStatus(403);
    },
  });
}

export function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.error("No token provided");
    return next(new Error("No token provided"));
  }

  verifyJWT(token, {
    success: (payload: JwtPayload) => {
      socket.data.username = payload.username;
      next();
    },
    error: (err: Error) => {
      console.error("Error authenticating token:", err.message);
      next(new Error("Invalid token"));
    },
  });
}

function verifyJWT(token: string, next: IVerifyJWTNext) {
  const key = process.env.JWT_SECRET || "";
  jwt.verify(token, key, (err, payload) => {
    if (err) {
      return next.error(err);
    }

    if (typeof payload === "string" || !payload) {
      return next.error(new Error("Invalid token"));
    }

    if (payload.username == null || payload.role == null) {
      return next.error(new Error("Invalid token"));
    }

    next.success(payload);
  });
}
