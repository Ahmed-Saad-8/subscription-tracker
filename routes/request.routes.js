import { Router } from "express";
import authorize from "../middlewares/auth.middlewate.js";
import {
  checkRequest,
  checkRequests,
  postRequest,
  updateRequestStatus,
  getRequestById,
  checkRequestsforme,
} from "../controllers/request.controller.js";

const requestRouter = Router();

requestRouter.post("/postrequest", authorize, postRequest);

requestRouter.get("/request/:id", authorize, checkRequest);

requestRouter.get("/checkrequest", authorize, checkRequests);

requestRouter.get("/checkrequestrorme", authorize, checkRequestsforme);

requestRouter.patch("/updatestatus/:id", authorize, updateRequestStatus);

requestRouter.get("/getrequest/:id", authorize, getRequestById);

export default requestRouter;
