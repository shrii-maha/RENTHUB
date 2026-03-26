const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number'],
    maxlength: [20, 'Phone number can not be more than 20 characters']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Do not return password by default
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String
  },
  otpExpires: {
    type: Date
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpire: {
    type: Date
  },
  // Bank details
  bankName: {
    type: String,
    default: ''
  },
  accountHolderName: {
    type: String,
    default: ''
  },
  accountNumber: {
    type: String,
    default: ''
  },
  ifscCode: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
