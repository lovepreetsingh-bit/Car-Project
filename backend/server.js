const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error(
    'Missing MONGODB_URI environment variable.\n' +
    'Please create a .env file in backend/ with:\n' +
    'MONGODB_URI=mongodb://localhost:27017/car-selling-db\n' +
    'or use your MongoDB Atlas connection string.'
  );
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/cars', require('./routes/carRoutes'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Car Selling API", success: true });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
