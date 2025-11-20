import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from "streamifier";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import resetPasswordEmail from "../templates/resetPasswordEmail.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      mobile,
      governorate,
      city,
      age,
      gender,
    } = req.body;

    if (password !== confirmPassword) {
      const error = new Error("Passwords do not match");
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary if provided
    let imageUrl = "";
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "user_ids" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      imageUrl = uploadResult.secure_url;
    }

    const newUsers = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
          mobile,
          governorate,
          city,
          age,
          gender,
          idImage: imageUrl,
        },
      ],
      { session }
    );

    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "User successfully created",
      data: {
        token,
        user: newUsers[0],
      },
    });
  } catch (error) {
    console.error("🔥 SIGN-UP ERROR:", error);
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("user not found");
      error.statusCode = 404;
      throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("invalid password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      message: "user signed in successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent.",
      });
    }

    // 1️⃣ توليد reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 دقائق
    await user.save({ validateBeforeSave: false });

    // 2️⃣ رابط إعادة تعيين الباسورد
    const resetURL = `https://loop-it-two.vercel.app/reset-password/${resetToken}`;

    // 3️⃣ توليد HTML باستخدام template
    const html = resetPasswordEmail(resetURL, user.name);

    // 4️⃣ إرسال الإيميل
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html,
    });

    res.status(200).json({
      message: "Reset link has been sent to your email.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending reset email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // 1) hash the received token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 2) find user with this token and check if token not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token.",
      });
    }

    // 3) hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) update user's password and clear reset token fields
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword; // optional, if you use confirmPassword
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error resetting password. Try again later.",
    });
  }
};

export const signOut = async (req, res, next) => {};
