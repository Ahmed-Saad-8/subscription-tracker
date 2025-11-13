import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
      required: true,
    },
    message: { type: String },
    status: { type: String, default: "pending" },
  },
  { collection: "requests", timestamps: true }
);

const Request = mongoose.model("Request", requestSchema);
export default Request;
