import express from "express";
import dotenv from "dotenv";
import * as requestHelper from "../../utility/requestHelper";

dotenv.config();
const USER_SERVICE = `http://${process.env.USER_SERVICE_ROUTE}:${process.env.USER_SERVICE_PORT}/auth`;

const router = express.Router();
router.post("/signup", requestHelper.sendPostRequest("signup", USER_SERVICE));

router.post("/signin", requestHelper.sendPostRequest("signin", USER_SERVICE));
export default router;
