const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an item name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'electronics',
      'vehicles',
      'tools',
      'party',
      'other'
    ]
  },
  rentalPrice: {
    type: Number,
    required: [true, 'Please add a rental price']
  },
  imageFilename: {
    type: String,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with rentals
ItemSchema.virtual('rentals', {
  ref: 'Rental',
  localField: '_id',
  foreignField: 'item',
  justOne: false
});

// Reverse populate with reviews
ItemSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'item',
  justOne: false
});

module.exports = mongoose.model('Item', ItemSchema);
