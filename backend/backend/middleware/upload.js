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
  console.log('[UPLOAD] Cloudinary configured ✓ cloud:', process.env.CLOUDINARY_CLOUD_NAME);
}

// Use memory storage — buffer held in RAM, then sent to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                allowed.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
});

// Middleware: after multer, push buffer → Cloudinary via base64 (most reliable method)
const processUpload = async (req, res, next) => {
  try {
    if (!req.file) return next(); // No file attached — skip

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Convert buffer to base64 data URI and upload to Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'renthub',
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }]
      });

      req.file.cloudinaryUrl = result.secure_url;
      console.log('[UPLOAD] ✓ Uploaded to Cloudinary:', result.secure_url);
    } else {
      console.warn('[UPLOAD] Cloudinary not configured — image will not be saved!');
    }

    next();
  } catch (err) {
    console.error('[UPLOAD] Cloudinary error:', err.message);
    return res.status(500).json({
      success: false,
      error: `Image upload failed: ${err.message}`
    });
  }
};

module.exports = upload;
module.exports.processUpload = processUpload;
module.exports.cloudinary = cloudinary;
