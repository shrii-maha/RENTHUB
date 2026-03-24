const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

const app = express();

// Middleware
app.use(cors());
// Raw body needed for Stripe webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const auth = require('./routes/auth');
const items = require('./routes/items');
const rentals = require('./routes/rentals');
const payments = require('./routes/payments');
const reviews = require('./routes/reviews');
const dashboard = require('./routes/dashboard');
const admin = require('./routes/admin');
const contact = require('./routes/contact');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/items', items);
app.use('/api/rentals', rentals);
app.use('/api/payments', payments);
app.use('/api/reviews', reviews);
app.use('/api/dashboard', dashboard);
app.use('/api/admin', admin);
app.use('/api/contact', contact);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
