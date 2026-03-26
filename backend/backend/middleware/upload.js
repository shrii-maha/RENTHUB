const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Cloudinary SDK auto-reads CLOUDINARY_URL env var if set.
// We also explicitly config in case individual vars are used instead.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  ...(process.env.CLOUDINARY_URL ? { cloudinary_url: process.env.CLOUDINARY_URL } : {})
});

const cfg = cloudinary.config();
if (cfg.api_key) {
  console.log('[UPLOAD] ✅ Cloudinary ready — cloud:', cfg.cloud_name);
} else {
  console.error('[UPLOAD] ❌ Cloudinary NOT configured — check CLOUDINARY_* env vars in .env');
}

// Memory storage: file stays in RAM buffer, goes directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'));
  }
});

// After multer: upload buffer → Cloudinary via base64 data URI
const processUpload = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'renthub',
      resource_type: 'image',
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto:good' }]
    });

    req.file.cloudinaryUrl = result.secure_url;
    console.log('[UPLOAD] ✅ Saved to Cloudinary:', result.secure_url);
    next();
  } catch (err) {
    console.error('[UPLOAD] ❌ Failed:', err.message);
    res.status(500).json({ success: false, error: `Image upload failed: ${err.message}` });
  }
};

module.exports = upload;
module.exports.processUpload = processUpload;
module.exports.cloudinary = cloudinary;
