import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [5, "Name must be at least 5 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [50, "description must be at least 50 characters long"],
      maxlength: [800, "description must be at most 800 characters long"],
    },
    startDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "Start date cannot be in the past",
      },

      immutable: true,
      required: [true, "Description is required"],
    },
    endDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be after the start date",
      },

      immutable: true,
      required: [true, "date is required"],
    },
    pricePerHour: {
      type: Number,
      required: [true, "price is required"],
    },
    replacementValue: {
      type: Number,
      required: [true, "replacement value is required"],
    },
    category: {
      type: String,
      enum: [
        "Laptops",
        "Hand-Tools",
        "Bikes",
        "Cameras",
        "Camera-Tools",
        "Electronics",
        "Skating-Tolls",
        "Clothing",
      ], // only these allowed
      required: [true, "Category is required"],
    },

    itemCondition: {
      type: String,
      enum: ["New", "Used", "Refurbished"], // only these allowed
      required: [true, "Item condition is required"],
    },
    mainImage: {
      type: String, // store image URL (for example, from Cloudinary or local path)
      required: [true, "ID image is required"],
    },
    firstImage: {
      type: String, // store image URL (for example, from Cloudinary or local path)
      required: [true, "ID image is required"],
    },
    secondImage: {
      type: String, // store image URL (for example, from Cloudinary or local path)
      required: [true, "ID image is required"],
    },
    thirdImage: {
      type: String, // store image URL (for example, from Cloudinary or local path)
      required: [true, "ID image is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
