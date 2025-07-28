import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract public_id from cloudinary URL
export function getCloudinaryPublicId(url) {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  return parts[1].split(".")[0];
}

export default cloudinary;
