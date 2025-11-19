import Messages from "../models/message.model.js";
import mongoose from "mongoose";

export const postMessage = async (req, res, next) => {
  try {
    const { productId, borrowerId, ownerId, message, senderId } = req.body;

    if (!senderId) {
      return res.status(400).json({
        success: false,
        message: "senderId is missing",
      });
    }

    const conversationId = `${productId}_${borrowerId}_${ownerId}`;

    const newMessage = await Messages.create({
      conversationId,
      borrowerId,
      ownerId,
      productId,
      message,
      senderId, // <--- مهم جداً
    });

    res.status(201).json({
      success: true,
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

    res.json({
      success: true,
      data: messages, // return raw messages including senderId
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
