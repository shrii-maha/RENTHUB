const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Rental = require('../models/Rental');
const { protect } = require('../middleware/auth');

// @desc    Get dashboard overview
// @route   GET /api/dashboard
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's items
    const myItems = await Item.find({ owner: userId }).populate({
      path: 'rentals',
      populate: { path: 'renter', select: 'fullName email phone' }
    }).maxTimeMS(2000);

    // Get user's bank details
    const user = await User.findById(userId).select('bankName accountHolderName accountNumber ifscCode').maxTimeMS(2000);

    let pendingRequests = [];
    let rentedOut = [];
    let earnings = 0;

    myItems.forEach(item => {
      // rentals are virtually populated but if data is limited, we filter manually
      // Assuming virtual populate worked:
      if (item.rentals && item.rentals.length > 0) {
        item.rentals.forEach(r => {
          if (r.status === 'Pending') {
            pendingRequests.push(r);
          } else if (r.status === 'Active' || r.status === 'Completed') {
            rentedOut.push(r);
            earnings += r.totalPrice;
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        bankDetails: user,
        myItems,
        pendingRequests,
        rentedOut,
        earnings
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update bank details
// @route   PATCH /api/dashboard/bank
// @access  Private
router.patch('/bank', protect, async (req, res) => {
  try {
    const { bankName, accountHolderName, accountNumber, ifscCode } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, {
      bankName, accountHolderName, accountNumber, ifscCode
    }, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
