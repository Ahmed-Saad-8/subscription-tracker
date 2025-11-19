import express from "express";
import { PORT } from "./config/env.js";
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import authRouter from "./routes/auth.routes.js";
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import productRouter from "./routes/product.routes.js";
import requestRouter from "./routes/request.routes.js";
import messageRouter from "./routes/message.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(arcjetMiddleware);

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/users", userRouter);

app.use("/api/v1/subscriptions", subscriptionRouter);

app.use("/api/v1/products", productRouter);

app.use("/api/v1/requests", requestRouter);

app.use("/api/v1/message", messageRouter);

app.use(cors({ origin: "*", credentials: true }));

app.get("/", (req, res) => {
  res.send("Welcome to portfolio API");
});

app.listen(PORT, async () => {
  console.log(`server is running on port http://localhost:${PORT}`);

  await connectToDatabase();
});

app.use(errorMiddleware);

export default app;
