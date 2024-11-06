import express, { Request, Response } from "express";
import { getUniqueTopics } from "../helper";
import { DifficultyLevel, IQuestion, Question } from "../models/Question";

const router = express.Router();

// Create a new question
router.post("/questions", async (req, res) => {
  try {
    // Check if a question with the same title already exists
    const existingQuestion = await Question.findOne({ title: req.body.title });
    if (existingQuestion) {
      return res.status(400).json({ error: "Error: Question already exists" });
    }

    const newQuestion = new Question(req.body);
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: "Error creating question", error });
  }
});

// Get all questions
router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching questions", error });
  }
});

router.get("/questions/topics", async (req, res) => {
  try {
    const topics = await getUniqueTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching topics", error });
  }
});

interface QueryParams {
  topic?: string | string[];
  difficultyLevel?: string;
}

router.get(
  "/questions/random",
  async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    try {
      const { topic, difficultyLevel } = req.query;
      console.log(req.query);

      // Build the query object
      const query: {
        topic?: { $in: string[] };
        difficultyLevel?: DifficultyLevel;
      } = {};

      if (topic) {
        const topicArray = Array.isArray(topic) ? topic : [topic];
        query.topic = { $in: topicArray };
      }

      if (difficultyLevel) {
        if (
          Object.values(DifficultyLevel).includes(
            difficultyLevel as DifficultyLevel
          )
        ) {
          query.difficultyLevel = difficultyLevel as DifficultyLevel;
        } else {
          return res.status(400).json({ message: "Invalid difficulty level" });
        }
      }

      // Count the number of matching documents
      const count = await Question.countDocuments(query);

      if (count === 0) {
        return res.status(404).json({ message: "No matching questions found" });
      }

      // Generate a random index
      const random = Math.floor(Math.random() * count);

      // Fetch the random document
      const randomQuestion = await Question.findOne(query).skip(random);

      res.json(randomQuestion);
    } catch (error) {
      res.status(500).json({
        message: "Error fetching random question",
        error: String(error),
      });
    }
  }
);

// Add more routes as needed (e.g., get by ID, update, delete)

// Get a question by ID
router.get("/questions/:id", async (req, res) => {
  try {
    console.log("here here here");
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Error fetching question", error });
  }
});

// Update a question
router.put("/questions/:id", async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json(updatedQuestion);
  } catch (error) {
    res.status(400).json({ message: "Error updating question", error });
  }
});

// Delete a question
router.delete("/questions/:id", async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting question", error });
  }
});

export default router;
