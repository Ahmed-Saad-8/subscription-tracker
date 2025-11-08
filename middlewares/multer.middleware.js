import multer from "multer";
import path from "path";

// Use memory storage (since we'll upload to Cloudinary)
const storage = multer.memoryStorage();

// Optional: filter files to allow only images
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

export default upload;
