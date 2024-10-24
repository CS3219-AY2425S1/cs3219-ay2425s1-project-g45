import express, { Request, Response } from "express";
import { createRoom } from "../services/roomService";

const router = express.Router();

router.post("/create", async (req: Request, res: Response) => {
  try {
    let room = await createRoom(
      req.topic,
      req.difficulty,
      req.users,
      req.question
    );
    return room;
  } catch (error) {
    res.status(400).json({ message: "Error Creating Room", error });
  }
});

export default router;
