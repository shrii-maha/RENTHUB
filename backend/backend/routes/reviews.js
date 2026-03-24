const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// @desc    Add or update review
// @route   POST /api/reviews/:itemId
// @access  Private
router.post('/:itemId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const itemId = req.params.itemId;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    let review = await Review.findOne({ item: itemId, user: req.user.id });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        item: itemId,
        user: req.user.id,
        rating,
        comment
      });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
