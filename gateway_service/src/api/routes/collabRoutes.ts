import express from "express";
import dotenv from "dotenv";
import * as requestHelper from "../../utility/requestHelper";
dotenv.config();
const COLLAB_SERVICE = `http://${process.env.COLLAB_SERVICE_ROUTE}:${process.env.COLLAB_SERVICE_PORT}`;

const router = express.Router();

router.post(
  "/editor/runCode",
  requestHelper.sendPostRequest("editor/runCode", COLLAB_SERVICE)
);

export default router;
