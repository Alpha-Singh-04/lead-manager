const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoute');
const leadRoute = require('./routes/leadRoute');

// Load env vars
dotenv.config();

//Connect DB
connectDB();

// Create app
const app = express();

function safeUse(app, path, ...handlers) {
  if (typeof path !== 'string' || path.trim() === '' || /^:/.test(path) || /:\s*$/.test(path)) {
    throw new Error(`Malformed route path detected: '${path}'`);
  }
  console.log('Registering route:', path);
  app.use(path, ...handlers);
}

// Middleware
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5173',
  'https://lead-manager-tdjs.vercel.app', 
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin) // Allow all Vercel preview URLs
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Routes
console.log('Debug Backend: Setting up Lead Routes');
safeUse(app, '/api/auth', authRoutes);
safeUse(app, '/api/users', userRoutes);
safeUse(app, '/api/leads', leadRoute);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message
  });
});

// Base route - Moved to the very end
app.use('*', (req, res) => {
  res.send('Hello from the backend!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
