import express from "express";
import { executeCodeWithPiston } from "../services/editorApi";
import { saveAttempt, getHistory } from "../services/editor";

const router = express.Router();

router.post("/runCode", async (req, res) => {
  const { code, language } = req.body;

  try {
    // Map your language and version as needed
    const languageMapping: {
      [key: string]: { language: string; version: string };
    } = {
      javascript: { language: "javascript", version: "*" },
      typescript: { language: "typescript", version: "*" },
      python: { language: "python", version: "*" },
      java: { language: "java", version: "*" },
      // Add other languages and versions as needed
    };

    const langInfo = languageMapping[language];
    if (!langInfo) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const result = await executeCodeWithPiston({
      language: langInfo.language,
      version: langInfo.version,
      code,
    });
    if (result.run.stderr) {
      res.json({ output: result.run.stderr });
    } else {
      res.json({ output: result.run.stdout });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
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
    const username = req.params.username;
    const history = await getHistory(username); // Fetch history for the user
    res.status(200).json({ history });
  } catch (error: any) {
    console.error("Error fetching history:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
