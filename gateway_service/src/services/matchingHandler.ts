import { QUESTION_SERVICE } from "../api/routes/questionRoutes";
const axios = require("axios");

export const COLLAB_SERVICE =
  process.env.NODE_ENV == "production"
    ? process.env.COLLAB_SERVICE_URL || ""
    : `http://${process.env.COLLAB_SERVICE_ROUTE}:${process.env.COLLAB_SERVICE_PORT}`;

export async function handleMatchFound(
  usernames: string[],
  topic: string,
  difficulty: string
) {
  let room = await createRoom(usernames, topic, difficulty);
  return room;
}

async function getRandomQuestion(topic: string, difficulty: string) {
  let url = `${QUESTION_SERVICE}/questions/random/?topic=${topic}&difficulty=${difficulty}`;
  let res = await axios.get(url);
  if (res.status == 200) {
    let question = res.data;
    return question._id;
  } else {
    console.error("Error getting random question");
  }
}

async function createRoom(users: string[], topic: string, difficulty: string) {
  let url = `${COLLAB_SERVICE}/rooms/create`;
  let questionId = await getRandomQuestion(topic, difficulty);
  console.log(questionId);
  let body = {
    topic: topic,
    difficulty: difficulty,
    users: users,
    question: questionId,
  };
  let res = await axios.post(url, body);
  if (res.status == 200) {
    return res.data;
  } else {
    console.error("Error when creating room");
  }
}
