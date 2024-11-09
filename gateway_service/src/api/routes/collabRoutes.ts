import express from "express";
import dotenv from "dotenv";
import * as requestHelper from "../../utility/requestHelper";
dotenv.config();
const COLLAB_SERVICE =
  process.env.NODE_ENV == "production"
    ? process.env.COLLAB_SERVICE_URL || ""
    : `http://${process.env.COLLAB_SERVICE_ROUTE}:${process.env.COLLAB_SERVICE_PORT}`;

const router = express.Router();

router.post(
  "/editor/runCode",
  requestHelper.sendPostRequest("editor/runCode", COLLAB_SERVICE)
);

router.post(
  "/editor/saveAttempt",
  requestHelper.sendPostRequest("editor/saveattempt", COLLAB_SERVICE)
);

router.get(
  "/editor/history/:username",
  requestHelper.sendGetRequest("editor/history/:username", COLLAB_SERVICE)
);

export default router;
