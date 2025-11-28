import { Router } from "express";
import {
  addfavorite,
  deletefavorite,
  getfavorits,
} from "../controllers/favorite.controller.js";

const favoriteRouter = Router();

favoriteRouter.post("/addfavorite", addfavorite);

favoriteRouter.get("/getfavorite", getfavorits);

favoriteRouter.delete("/deletefavorite/:id", deletefavorite);

export default favoriteRouter;
