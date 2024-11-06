import express from "express";
import { getHistory, saveAttempt, signIn, signUp } from "../services/userService";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    const token = await signUp(body.username, body.email, body.password);
    res.status(201).json({ token: token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const body = req.body;
    const token = await signIn(body.username, body.password);
    res.status(200).json({ token: token, username: body.username });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/saveAttempt", async (req, res) => {
  try {
    const { username, question, datetime, code } = req.body;
    const result = await saveAttempt(username, question, datetime, code);
    res.status(200).json({ message: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/history/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const history = await getHistory(username);
    res.status(200).json({ history });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


export default router;
