const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[UPLOAD] Cloudinary configured for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Use memory storage — hold file in RAM, then upload to Cloudinary
const storage = multer.memoryStorage();

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

// Base multer middleware (puts file in req.file.buffer)
const upload = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => checkFileType(file, cb)
});

// Helper: upload buffer to Cloudinary and return secure URL
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'renthub',
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Middleware factory: multer + optional Cloudinary upload
// Usage in routes: upload.single('image') — then call processUpload(req, res) if needed
const processUpload = async (req, res, next) => {
  try {
    if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload buffer to Cloudinary
      const url = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      req.file.cloudinaryUrl = url;
      console.log('[UPLOAD] Uploaded to Cloudinary:', url);
    }
    next();
  } catch (err) {
    console.error('[UPLOAD] Cloudinary upload failed:', err.message);
    res.status(500).json({ success: false, error: 'Image upload failed. Please try again.' });
  }
};

module.exports = upload;
module.exports.processUpload = processUpload;
module.exports.cloudinary = cloudinary;
