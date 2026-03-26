const multer = require('multer');
const path = require('path');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use Cloudinary storage if credentials are set, otherwise fallback to disk (local dev)
let storage;

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  console.log('[UPLOAD] Using Cloudinary storage');
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'renthub',           // All uploads go to renthub/ folder in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
    }
  });
} else {
  console.log('[UPLOAD] Cloudinary not configured — using local disk storage');
  const fs = require('fs');
  const crypto = require('crypto');
  storage = require('multer').diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const randomHex = crypto.randomBytes(8).toString('hex');
      cb(null, randomHex + path.extname(file.originalname));
    }
  });
}

// Check file type
function checkFileType(file, cb) {
  const allowed = /jpeg|jpg|png|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => checkFileType(file, cb)
});

module.exports = upload;
module.exports.cloudinary = cloudinary;
