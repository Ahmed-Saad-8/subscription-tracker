import { Router } from "express";
import {
  getMessages,
  postMessage,
} from "../controllers/messages.controller.js";
import authorize from "../middlewares/auth.middlewate.js";

const messageRouter = Router();

messageRouter.post("/postmessage", authorize, postMessage);

messageRouter.get("/getmessage/:id", authorize, getMessages);

export default messageRouter;
