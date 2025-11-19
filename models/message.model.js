import mongoose from "mongoose";

const messageShema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    borrowerId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
    },
  },
  {
    collection: "messages",
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", messageShema);
export default Messages;
