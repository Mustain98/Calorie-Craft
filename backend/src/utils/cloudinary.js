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
async function cloneImage(imageUrl, imageId) {
  try {
    // Prefer given URL
    let sourceUrl = imageUrl;
    if (!sourceUrl && imageId) {
      sourceUrl = cloudinary.url(imageId, { secure: true });
    }

    if (!sourceUrl) return null;

    const uploaded = await cloudinary.uploader.upload(sourceUrl, {
      folder: 'meal-images',
      public_id: `meal-${Date.now()}`,
      overwrite: false,
      resource_type: 'image',
    });

    return { url: uploaded.secure_url, id: uploaded.public_id };
  } catch (err) {
    console.warn('Image clone failed:', err.message);
    return null;
  }
}

module.exports = { cloudinary, parser,cloneImage };
