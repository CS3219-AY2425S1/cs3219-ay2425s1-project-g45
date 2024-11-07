import express from "express";
import {
  getHistory,
  getPasswordResetToken,
  resetPassword,
  resetPasswordWithToken,
  saveAttempt,
  signIn,
  signUp,
} from "../services/userService";

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
    console.log("Fetching history for user:", req.params.username);
    const username = req.params.username;
    const history = await getHistory(username); // Fetch history for the user
    res.status(200).json({ history });
  } catch (error: any) {
    console.error("Error fetching history:", error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/resetpassword/password", async (req, res) => {
  try {
    const body = req.body;
    const isPasswordChanged = await resetPassword(
      body.username,
      body.password,
      body.newPassword
    );
    if (!isPasswordChanged) {
      res.status(400).json({ error: "Unable to change password" });
    }

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/resetpassword/token", async (req, res) => {
  try {
    const body = req.body;
    await resetPasswordWithToken(body.username, body.token, body.newPassword);

    res.status(200).json({ message: "Account recovered successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/requestreset", async (req, res) => {
  try {
    const body = req.body;
    await getPasswordResetToken(body.username);

    res.status(200).json({ message: "Password reset token sent to email" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
