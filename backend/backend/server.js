const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

// Load env vars
dotenv.config();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

const app = express();

// Trust reverse proxy (Render, Vercel, Nginx) — fixes rate-limit X-Forwarded-For warning
app.set('trust proxy', 1);

// ============================================================
// Security Middleware
// ============================================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS — allow frontend with credentials (cookies)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL // set this in .env for production
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (e.g. mobile apps, Postman) in development
    if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now; tighten in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting on auth routes only (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login/register attempts per 15 mins per IP
  message: { success: false, error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

// Stripe webhook needs raw body
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser — needed for HttpOnly JWT cookies
app.use(cookieParser());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// Routes
// ============================================================
const auth = require('./routes/auth');
const items = require('./routes/items');
const rentals = require('./routes/rentals');
const payments = require('./routes/payments');
const reviews = require('./routes/reviews');
const dashboard = require('./routes/dashboard');
const admin = require('./routes/admin');
const contact = require('./routes/contact');

// Apply rate limiting only to auth routes
app.use('/api/auth', authLimiter, auth);
app.use('/api/items', items);
app.use('/api/rentals', rentals);
app.use('/api/payments', payments);
app.use('/api/reviews', reviews);
app.use('/api/dashboard', dashboard);
app.use('/api/admin', admin);
app.use('/api/contact', contact);

// ============================================================
// Health check endpoint
// ============================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'RentHub API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
