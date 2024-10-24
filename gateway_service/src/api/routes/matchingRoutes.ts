import express from "express";
import dotenv from "dotenv";
import * as requestHelper from "../../utility/requestHelper";
dotenv.config();
const MATCHING_SERVICE = `http://${process.env.MATCHING_SERVICE_ROUTE}:${process.env.MATCHING_SERVICE_PORT}`;

const router = express.Router();

router.get(
  "/room/:id",
  requestHelper.sendGetRequest("room/:id", MATCHING_SERVICE)
);
export default router;
