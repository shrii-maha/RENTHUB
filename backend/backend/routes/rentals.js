const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');
const { verified } = require('../middleware/verify');

// @desc    Request a rental
// @route   POST /api/rentals
// @access  Private
router.post('/', protect, verified, async (req, res) => {
  try {
    const { itemId, days } = req.body;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Cannot rent own item
    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot rent your own item' });
    }
    
    // Cannot rent if not available
    if (!item.isAvailable) {
      return res.status(400).json({ success: false, error: 'Item is not available' });
    }

    const rentalDays = parseInt(days) || 1;
    const totalPrice = item.rentalPrice * rentalDays;

    const rental = await Rental.create({
      item: itemId,
      renter: req.user.id,
      totalPrice,
      depositAmount: item.depositAmount || 0,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: rental
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get user's rentals (as a renter)
// @route   GET /api/rentals/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const rentals = await Rental.find({ renter: req.user.id })
      .populate('item', 'name imageFilename rentalPrice owner')
      .sort('-rentalDate');

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Approve rental
// @route   PATCH /api/rentals/:id/approve
// @access  Private
router.patch('/:id/approve', protect, verified, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('item');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental request not found' });
    }

    // Only owner of item can approve
    if (rental.item.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    rental.status = 'Approved';
    await rental.save();

    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Reject rental
// @route   PATCH /api/rentals/:id/reject
// @access  Private
router.patch('/:id/reject', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('item');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental request not found' });
    }

    if (rental.item.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    rental.status = 'Rejected';
    await rental.save();

    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Refund deposit
// @route   PATCH /api/rentals/:id/refund-deposit
// @access  Private
router.patch('/:id/refund-deposit', protect, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('item');

    if (!rental) {
      return res.status(404).json({ success: false, error: 'Rental not found' });
    }

    // Only owner of item can refund deposit
    if (rental.item.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (rental.depositStatus === 'Refunded') {
      return res.status(400).json({ success: false, error: 'Deposit already refunded' });
    }

    rental.depositStatus = 'Refunded';
    await rental.save();

    res.status(200).json({ success: true, data: rental });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
