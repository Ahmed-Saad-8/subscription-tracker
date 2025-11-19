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

    // Find the request made by the logged-in user for this product
    const existingRequest = await Request.findOne({
      fromUserId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
    })
      .populate({ path: "toUserId", model: "User", select: "name email" }) // populate toUserId
      .populate({ path: "fromUserId", model: "User", select: "name email" }) // optional, for consistency
      .populate({
        path: "productId",
        model: "Product",
        select: "name pricePerHour",
      }); // optional

    res.json({
      requested: !!existingRequest,
      request: existingRequest || null, // return the full request with populated fields
    });
  } catch (error) {
    next(error);
  }
};

export const checkRequests = async (req, res, next) => {
  try {
    const userId = req.user._id; // logged-in user

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID" });
    }

    // ✅ Find all requests sent TO the logged-in user
    const requestsToUser = await Request.find({ fromUserId: userId })
      .populate({ path: "fromUserId", model: "User", select: "name email" }) // sender info
      .populate({ path: "toUserId", model: "User", select: "name email" }) // receiver info
      .populate({
        path: "productId",
        model: "Product",
        select: "name pricePerHour",
      }) // product info
      .sort({ createdAt: -1 }); // optional: newest first

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

export const getRequestById = async (req, res, next) => {
  try {
    const { id: requestId } = req.params;

    // 1) Validate request ID
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request ID" });
    }

    // 2) Find the request and populate related data
    const request = await Request.findById(requestId)
      .populate({
        path: "fromUserId",
        model: "User",
        select: "name email city mobileNumber",
      })
      .populate({
        path: "toUserId",
        model: "User",
        select: "name email city mobileNumber",
      })
      .populate({
        path: "productId",
        model: "Product",
        select: "name description pricePerHour mainImage owner",
      });

    // 3) Not found
    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    // 4) Success response
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
