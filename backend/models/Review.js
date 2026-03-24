const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per item
ReviewSchema.index({ item: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
