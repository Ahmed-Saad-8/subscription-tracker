import { Router } from "express";
import authorize from "../middlewares/auth.middlewate.js";
import {
  signOut,
  signUp,
  signIn,
  forgetPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", upload.single("idImage"), signUp);

authRouter.post("/sign-in", signIn);

authRouter.post("/sign-out", signOut);

authRouter.post("/forgot-password", forgetPassword);

authRouter.post("/reset-password", resetPassword);

export default authRouter;
