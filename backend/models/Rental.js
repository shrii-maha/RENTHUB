const mongoose = require('mongoose');

const RentalSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.ObjectId,
    ref: 'Item',
    required: true
  },
  renter: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  rentalDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rental', RentalSchema);
