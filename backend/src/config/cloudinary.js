import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// ================= CLOUDINARY CONFIG =================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// ================= STORAGE =================

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ford_cars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"]
  })
});

// ================= MULTER =================

export const uploadCloud = multer({
  storage
});

// ================= EXPORT =================

export default cloudinary;