import Messages from "../models/message.model.js";
import mongoose from "mongoose";

export const postMessage = async (req, res, next) => {
  try {
    const { productId, borrowerId, ownerId, message } = req.body;

    // generate unique conversationId
    const conversationId = `${productId}_${borrowerId}_${ownerId}`;

    const newMessage = await Messages.create({
      conversationId,
      borrowerId,
      ownerId,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Failed to send message", error);
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;
    const messages = await Messages.find({ conversationId }).sort({
      createdAt: 1,
    });

    // Map messages to include senderRole
    const messagesWithRole = messages.map((msg) => {
      let senderRole = "";
      if (msg.borrowerId.toString() === msg.borrowerId.toString())
        senderRole = "Borrower";
      if (msg.ownerId.toString() === msg.ownerId.toString())
        senderRole = "Owner";
      // Actually, you just want labels as per who sent it
      // So check which userId sent the message? We can store senderId
      return {
        _id: msg._id,
        message: msg.message,
        senderId: msg.borrowerId === msg.ownerId ? msg.borrowerId : msg.ownerId,
        borrowerId: msg.borrowerId,
        ownerId: msg.ownerId,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
      };
    });

    res.json({ success: true, data: messagesWithRole });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
