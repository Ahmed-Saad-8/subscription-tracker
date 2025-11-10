import { Router } from "express";
import {
  postProduct,
  getProducts,
  deleteProduct,
  getuserProducts,
} from "../controllers/product.controller.js";
import upload from "../middlewares/multer.middleware.js";
import authorize from "../middlewares/auth.middlewate.js";

const productRouter = Router();

productRouter.post(
  "/product",
  authorize,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "firstImage", maxCount: 1 },
    { name: "secondImage", maxCount: 1 },
    { name: "thirdImage", maxCount: 1 },
  ]),
  postProduct
);

productRouter.get("/getproduct", getProducts);

productRouter.get("/product/:id", authorize, getuserProducts);

productRouter.delete("/product/:id", authorize, deleteProduct);

export default productRouter;
