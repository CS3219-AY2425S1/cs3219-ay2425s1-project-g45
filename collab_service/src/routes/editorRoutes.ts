import express from "express";
import { executeCodeWithPiston } from "../services/editorApi";

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

export default router;
