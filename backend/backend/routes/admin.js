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
    console.log('Fetching admin stats...');
    
    const [totalUsers, totalItems, totalRentals, rentals] = await Promise.all([
      User.countDocuments({ isAdmin: false }).maxTimeMS(2000),
      Item.countDocuments().maxTimeMS(2000),
      Rental.countDocuments().maxTimeMS(2000),
      Rental.find({ status: { $in: ['Active', 'Completed'] } }).maxTimeMS(2000)
    ]);
    
    console.log('Stats queries completed');
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
    console.error('Error in /admin/stats:', error.message);
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

// @desc    Get all rentals (bookings)
// @route   GET /api/admin/rentals
// @access  Private/Admin
router.get('/rentals', async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate('renter', 'fullName email')
      .populate({
        path: 'item',
        populate: { path: 'owner', select: 'fullName email' }
      })
      .sort('-createdAt');
    res.status(200).json({ success: true, count: rentals.length, data: rentals });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Toggle user block status
// @route   PATCH /api/admin/users/:id/toggle-block
// @access  Private/Admin
router.patch('/users/:id/toggle-block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
