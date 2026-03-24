const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Rental = require('../models/Rental');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');

// Apply middleware to all admin routes
router.use(protect);
router.use(adminOnly);

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalItems = await Item.countDocuments();
    const totalRentals = await Rental.countDocuments();
    
    // Calculate total revenue from active/completed rentals
    const rentals = await Rental.find({ status: { $in: ['Active', 'Completed'] } });
    const totalRevenue = rentals.reduce((acc, curr) => acc + curr.totalPrice, 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalItems,
        totalRentals,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find user's items
    const userItems = await Item.find({ owner: user._id });
    const itemIds = userItems.map(i => i._id);

    // Delete rentals targeting these items
    await Rental.deleteMany({ item: { $in: itemIds } });
    // Delete reviews targeting these items
    await Review.deleteMany({ item: { $in: itemIds } });
    // Delete the items
    await Item.deleteMany({ owner: user._id });

    // Delete rentals made BY this user
    await Rental.deleteMany({ renter: user._id });
    // Delete reviews made BY this user
    await Review.deleteMany({ user: user._id });

    // Delete user
    await user.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get all items
// @route   GET /api/admin/items
// @access  Private/Admin
router.get('/items', async (req, res) => {
  try {
    const items = await Item.find().populate('owner', 'fullName email').sort('-createdAt');
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
