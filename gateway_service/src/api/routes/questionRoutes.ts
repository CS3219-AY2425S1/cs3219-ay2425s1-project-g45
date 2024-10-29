import express from "express";
import dotenv from "dotenv";
import * as requestHelper from "../../utility/requestHelper";
dotenv.config();
export const QUESTION_SERVICE = `http://${process.env.QUESTION_SERVICE_ROUTE}:${process.env.QUESTION_SERVICE_PORT}/api`;

const router = express.Router();

router.post(
  "/questions",
  requestHelper.sendPostRequest("/questions", QUESTION_SERVICE)
);

router.get("/questions/random", async (req, res) => {
  console.log(req.query);
  return requestHelper.sendGetRequest("/questions/random", QUESTION_SERVICE)(
    req,
    res
  );
});

router.get(
  "/questions/topics",
  requestHelper.sendGetRequest("/questions/topics", QUESTION_SERVICE)
);

router.get(
  "/questions",
  requestHelper.sendGetRequest("/questions", QUESTION_SERVICE)
);

router.get(
  "/questions/:id",
  requestHelper.sendGetRequest("/questions/:id", QUESTION_SERVICE)
);

router.put("/questions/:id", async (req, res) => {
  const id = req.params["id"];
  return requestHelper.sendPutRequest(
    "/questions",
    QUESTION_SERVICE,
    id
  )(req, res);
});

router.delete("/questions/:id", async (req, res) => {
  const id = req.params["id"];
  return requestHelper.sendDeleteRequest(
    "/questions",
    QUESTION_SERVICE,
    id
  )(req, res);
});
export default router;
