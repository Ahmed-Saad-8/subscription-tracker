import { Router } from "express";
import { postMessage } from "../controllers/messages.controller.js";

const messageRouter = Router();

messageRouter.post("/postmessage", postMessage);

export default messageRouter;
