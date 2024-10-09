import express from "express";
import { signIn, signUp } from "../services/userService";

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

export default router;
