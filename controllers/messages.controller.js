import Messages from "../models/message.model.js";
import mongoose from "mongoose";

export const postMessage = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { conversationId, borrowerId, ownerId, message } = req.body;

    const messages = await new Messages.create(req.body, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        conversationId,
        borrowerId,
        ownerId,
        message,
      },
    });
  } catch (error) {
    console.error("fialed to send message", error);
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
