import express from "express";
import dotenv from "dotenv";
import * as requestHelper from "../../utility/requestHelper";
import { authenticateToken } from "../../utility/jwtHelper";

dotenv.config();
const USER_SERVICE = `http://${process.env.USER_SERVICE_ROUTE}:${process.env.USER_SERVICE_PORT}/auth`;

const router = express.Router();
router.post("/signup", requestHelper.sendPostRequest("signup", USER_SERVICE));

router.post("/signin", requestHelper.sendPostRequest("signin", USER_SERVICE));

router.get("/validate", authenticateToken, (req, res) => {
  res.sendStatus(200);
});
export default router;
