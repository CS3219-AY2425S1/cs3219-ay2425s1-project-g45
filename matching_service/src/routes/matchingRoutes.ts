import express from "express";
import { Queue, IQueue } from "../services/queue";

const router = express.Router();
const queue: IQueue = new Queue();

router.post("/match", async (req, res) => {
  const { userId, topic, difficulty } = req.body;
  // TODO: Add request into queue
  // Possibly return a matching id
  // Possibly set up socket connection so that we can update the user when a match is found
  queue.add({ userId, topic, difficulty });
  res.json({ success: true });
});

router.post("/cancelMatch", async (req, res) => {
  const { userId, matchingId } = req.body;
  // TODO: Remove request from queue
  // Possiblt remove socket connection
  // Possibly return a success message
  queue.cancel({ userId, matchingId });
});

export default router;
