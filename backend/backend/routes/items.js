const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Rental = require('../models/Rental');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');
const { verified } = require('../middleware/verify');
const upload = require('../middleware/upload');

// @desc    Get all available items (with search & filtering)
// @route   GET /api/items
// @access  Public
router.get('/', async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['q', 'category'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query object
    let queryStr = JSON.stringify(reqQuery);

    query = Item.find({ isAvailable: true }).populate('owner', 'fullName');

    // Search query
    if (req.query.q) {
      query = query.find({ name: { $regex: req.query.q, $options: 'i' } });
    }

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      query = query.find({ category: req.query.category.toLowerCase() });
    }

    // Sort by latest
    query = query.sort('-createdAt');

    const items = await query;

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'fullName email')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'fullName' }
      });

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Get related items
    let relatedItems = await Item.find({ 
      category: item.category, 
      _id: { $ne: item._id },
      isAvailable: true 
    }).sort('-createdAt').limit(3).populate('owner', 'fullName');

    if (relatedItems.length < 3) {
      const excludeIds = [item._id, ...relatedItems.map(ri => ri._id)];
      const needed = 3 - relatedItems.length;
      
      const otherItems = await Item.find({
        _id: { $nin: excludeIds },
        isAvailable: true
      }).sort('-createdAt').limit(needed).populate('owner', 'fullName');
      
      relatedItems = [...relatedItems, ...otherItems];
    }

    res.status(200).json({
      success: true,
      data: {
        item,
        relatedItems
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Create new item
// @route   POST /api/items
// @access  Private
router.post('/', protect, verified, upload.single('image'), async (req, res) => {
  try {
    req.body.owner = req.user.id;
    
    if (req.body.category) {
      req.body.category = req.body.category.toLowerCase();
    }
    
    if (req.file) {
      req.body.imageFilename = req.file.filename;
    }

    // Convert string 'true'/'false' to boolean if needed
    if (req.body.isAvailable === 'false') req.body.isAvailable = false;
    else if (req.body.isAvailable === 'true') req.body.isAvailable = true;
    else req.body.isAvailable = true; // Default to true if not provided as string or boolean

    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Make sure user is item owner or admin
    if (item.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this item' });
    }

    // Delete associated rentals and reviews
    await Rental.deleteMany({ item: item._id });
    await Review.deleteMany({ item: item._id });

    await item.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Toggle item availability
// @route   PATCH /api/items/:id/toggle
// @access  Private
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    if (item.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this item' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
router.put('/:id', protect, verified, upload.single('image'), async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    // Make sure user is item owner OR admin
    if (item.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(401).json({ success: false, error: 'Not authorized to update this item' });
    }

    // Lowercase category if provided
    if (req.body.category) {
      req.body.category = req.body.category.toLowerCase();
    }

    // Handle new image upload
    if (req.file) {
      // (Optional) Delete old image here if you want to save space
      req.body.imageFilename = req.file.filename;
    }

    // Convert string 'true'/'false' to boolean if needed
    if (req.body.isAvailable === 'false') req.body.isAvailable = false;
    else if (req.body.isAvailable === 'true') req.body.isAvailable = true;

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
