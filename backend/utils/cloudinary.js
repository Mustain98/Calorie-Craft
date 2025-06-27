const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'meal-images',
    allowed_formats: ['jpg', 'png', 'jpeg','webp'], // Optional: modern param is `format`
    public_id: (req, file) => {
      return `meal-${Date.now()}`; // Unique name for each file
    }
  },
});

// Multer Upload Middleware
const parser = multer({ storage });

module.exports = { cloudinary, parser };
