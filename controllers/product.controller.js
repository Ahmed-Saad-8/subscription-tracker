// controllers/product.controller.js
import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from "streamifier";

export const postProduct = async (req, res, next) => {
  try {
    const { mainImage, firstImage, secondImage, thirdImage } = req.files;
    if (!mainImage || !firstImage || !secondImage || !thirdImage) {
      const error = new Error("All 4 product images are required");
      error.statusCode = 400;
      throw error;
    }

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

    const mainImageUrl = await uploadFromBuffer(mainImage[0]);
    const firstImageUrl = await uploadFromBuffer(firstImage[0]);
    const secondImageUrl = await uploadFromBuffer(secondImage[0]);
    const thirdImageUrl = await uploadFromBuffer(thirdImage[0]);

    const productData = {
      ...req.body,
      owner: req.user._id,
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

export const getuserProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const products = await Product.find({ owner: userId });

    res.status(200).json({
      success: true,
      message: "User products fetched successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;

    // 1️⃣ Find the product by ID
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "name email idImage"
    );
    res.json({ product });
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      status: "success",
      results: product.length,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // 1️⃣ Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2️⃣ Helper to upload images to Cloudinary
    const uploadFromBuffer = (file) =>
      new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

    // 3️⃣ Update images if provided
    if (req.files) {
      const { mainImage, firstImage, secondImage, thirdImage } = req.files;

      if (mainImage && mainImage[0]) {
        product.mainImage = await uploadFromBuffer(mainImage[0]);
      }
      if (firstImage && firstImage[0]) {
        product.firstImage = await uploadFromBuffer(firstImage[0]);
      }
      if (secondImage && secondImage[0]) {
        product.secondImage = await uploadFromBuffer(secondImage[0]);
      }
      if (thirdImage && thirdImage[0]) {
        product.thirdImage = await uploadFromBuffer(thirdImage[0]);
      }
    }

    // 4️⃣ Update text fields from req.body
    const fields = [
      "name",
      "description",
      "pricePerHour",
      "replacementValue",
      "category",
      "itemCondition",
      "city",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // 5️⃣ Save product
    await product.save();

    return res.status(200).json({ status: "success", product });
  } catch (error) {
    console.error("💥 Update error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
