import { Question } from "../models/Question";

async function getUniqueTopics(): Promise<string[]> {
  try {
    const uniqueTopics = await Question.aggregate([
      // Unwind the topic array to create a document for each topic
      { $unwind: "$topic" },
      // Group by topic and count occurrences
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      // Sort by count in descending order (optional)
      { $sort: { _id: 1 } },
      // Project only the topic name
      { $project: { _id: 0, topic: "$_id" } },
    ]);

    // Extract the topics from the result
    return uniqueTopics.map((item) => item.topic);
  } catch (error) {
    console.error("Error fetching unique topics:", error);
    throw new Error("Failed to fetch unique topics");
  }
}

export { getUniqueTopics };
