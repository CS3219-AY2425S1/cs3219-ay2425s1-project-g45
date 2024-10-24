import express, { Request, Response } from "express";
import { createRoom } from "../services/roomService";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    let request = req.body;
    let room = await createRoom(
      request.topic,
      request.difficulty,
      request.users,
      request.question
    );
    return room;
  } catch (error) {
    res.status(400).json({ message: "Error Creating Room", error });
  }
});

export default router;
