const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    // Generate random hex for filename similar to the Flask app
    const randomHex = crypto.randomBytes(8).toString('hex');
    cb(null, randomHex + path.extname(file.originalname));
  }
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 16000000 }, // 16MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

module.exports = upload;
