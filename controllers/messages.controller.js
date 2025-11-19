import Messages from "../models/message.model.js";
import mongoose from "mongoose";

export const postMessage = async (req, res, next) => {
  try {
    const { productId, borrowerId, ownerId, message, userId } = req.body;

    const conversationId = `${productId}_${borrowerId}_${ownerId}`;

    const newMessage = await Messages.create({
      conversationId,
      borrowerId,
      ownerId,
      message,
      senderId: userId, // <-- Important: logged user is the sender
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

    res.json({
      success: true,
      data: messages, // return raw messages including senderId
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
