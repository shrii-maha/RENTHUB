const mongoose = require('mongoose');

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add your name']
  },
  email: {
    type: String,
    required: [true, 'Please add your email']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactMessage', ContactMessageSchema);
