import mongoose from "mongoose";
import Request from "../models/request.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const postRequest = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fromUserId, toUserId, productId, message, status } = req.body;

    // 1️⃣ Check if the user already sent a request for this product
    const existingRequest = await Request.findOne({
      fromUserId,
      productId,
    }).session(session);

    if (existingRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "You have already requested this product.",
      });
    }

    // 2️⃣ Create the new request
    const newRequest = await Request.create(
      [
        {
          fromUserId,
          toUserId,
          productId,
          message,
          status,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ success: true, data: newRequest[0] });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const checkRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id: productId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ requested: false, message: "Invalid IDs" });
    }

    const existingRequest = await Request.findOne({
      fromUserId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    });

    res.json({ requested: !!existingRequest });
  } catch (error) {
    next(error);
  }
};

export const checkRequests = async (req, res, next) => {
  try {
    const userId = req.user._id; // the user we want to check requests for

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // Find all requests sent TO this user
    const requestsToUser = await Request.find({
      toUserId: userId,
    })
      .populate({ path: "fromUserId", model: "User", select: "name email" })
      .populate({
        path: "productId",
        model: "Product",
        select: "name pricePerHour",
      });

    res.status(200).json({ success: true, requests: requestsToUser });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    next(error);
  }
};
