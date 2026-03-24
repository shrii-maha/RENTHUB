const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');

// @desc    Send contact message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const msg = await ContactMessage.create(req.body);
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
