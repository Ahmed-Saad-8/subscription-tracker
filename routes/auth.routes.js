import { Router } from "express";
import authorize from "../middlewares/auth.middlewate.js";
import { signOut, signUp, signIn } from "../controllers/auth.controller.js";
import upload from "../middlewares/multer.middleware.js";

const authRouter = Router();

authRouter.post("/sign-up", upload.single("idImage"), signUp);

authRouter.post("/sign-in", signIn);

authRouter.post("/sign-out", signOut);

export default authRouter;
