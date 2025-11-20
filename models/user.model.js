import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [5, "Name must be at least 5 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },

    confirmPassword: {
      type: String,

      minlength: [6, "Confirm password must be at least 6 characters long"],
    },

    mobileNumber: {
      type: String,
    },

    governate: {
      type: String,

      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [10, "Age must be at least 10 years old"],
      max: [100, "Age must be at most 100 years old"],
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required"],
    },

    idImage: {
      type: String, // store image URL (for example, from Cloudinary or local path)
      required: [true, "ID image is required"],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
