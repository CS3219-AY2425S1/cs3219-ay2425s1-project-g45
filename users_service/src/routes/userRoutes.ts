import express from "express";
import {
  deleteAccount,
  getPasswordResetToken,
  resetPassword,
  resetPasswordWithToken,
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
    res.status(400).json({ error: error });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const username = req.params["id"];
    console.log(username);

    await deleteAccount(username);
    res.status(200).json({ message: "Account deleted" });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

export default router;
