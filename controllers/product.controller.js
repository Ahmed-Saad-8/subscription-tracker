// controllers/product.controller.js
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinaryConfig.js";

import streamifier from "streamifier";

export const postProduct = async (req, res, next) => {
  try {
    // 1️⃣ Check if all 4 required image files are present
    const { mainImage, firstImage, secondImage, thirdImage } = req.files;
    if (!mainImage || !firstImage || !secondImage || !thirdImage) {
      const error = new Error("All 4 product images are required");
      error.statusCode = 400;
      throw error;
    }

    // 2️⃣ Helper function to upload a file buffer to Cloudinary using streamifier
    const uploadFromBuffer = (file) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    };

    // 3️⃣ Upload each image and get the secure URL
    const mainImageUrl = await uploadFromBuffer(mainImage[0]);
    const firstImageUrl = await uploadFromBuffer(firstImage[0]);
    const secondImageUrl = await uploadFromBuffer(secondImage[0]);
    const thirdImageUrl = await uploadFromBuffer(thirdImage[0]);

    // 4️⃣ Build product data
    const productData = {
      ...req.body, // name, description, pricePerHour, replacementValue, category, itemCondition, startDate, endDate
      owner: req.user._id, // assign logged-in user as owner
      email: req.user.email,
      mainImage: mainImageUrl,
      firstImage: firstImageUrl,
      secondImage: secondImageUrl,
      thirdImage: thirdImageUrl,
    };

    // 5️⃣ Save the product to MongoDB
    const product = await Product.create(productData);

    // 6️⃣ Send success response
    res.status(201).json({
      status: "success",
      product,
    });
  } catch (error) {
    next(error); // Pass to your error middleware
  }
};

export const getProducts = async (req, res, next) => {
  try {
    // 1️⃣ Fetch all products
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("owner", "name email"); // newest first

    // 2️⃣ Send response
    res.status(200).json({
      status: "success",
      results: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // 1️⃣ Find the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    // 2️⃣ Check ownership
    if (product.owner.toString() !== req.user._id.toString()) {
      const error = new Error("You are not authorized to delete this product");
      error.statusCode = 403;
      throw error;
    }

    // 3️⃣ Delete images from Cloudinary
    const getPublicId = (url) => {
      // Extract public ID from Cloudinary URL
      // Example: https://res.cloudinary.com/<cloud_name>/image/upload/v123456/products/abc123.png
      const parts = url.split("/upload/");
      const pathAndFile = parts[1].split(".")[0]; // remove extension
      return pathAndFile;
    };

    const images = [
      product.mainImage,
      product.firstImage,
      product.secondImage,
      product.thirdImage,
    ];

    for (const imgUrl of images) {
      const publicId = getPublicId(imgUrl);
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(`Failed to delete image ${imgUrl} from Cloudinary:`, err);
        // Continue deleting other images and product
      }
    }

    // 4️⃣ Delete product from MongoDB
    await product.deleteOne();

    // 5️⃣ Send success response
    res.status(200).json({
      status: "success",
      message: "Product and images successfully deleted",
    });
  } catch (error) {
    next(error);
  }
};
