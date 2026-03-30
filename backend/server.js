// Import Node's DNS module
const dns = require('dns');

// Force usage of Google's public DNS servers
// Helps avoid local DNS resolution issues (common in some networks/cloud setups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Load environment variables from .env file into process.env
// Example: MONGO_URI, PORT
require('dotenv').config();

// Import required libraries
const express = require('express');     // Web framework for building APIs
const mongoose = require('mongoose');   // ORM for MongoDB
const cors = require('cors');           // Middleware to enable Cross-Origin requests

// Initialize Express application
const app = express();

// Enable CORS for all incoming requests
// Allows frontend (different origin) to communicate with backend
app.use(cors());

// Middleware to parse incoming JSON request bodies
// Without this, req.body will be undefined for JSON requests
app.use(express.json());

// Route handling:
// Each route file handles specific API endpoints

// Routes for mentor-related operations
// All endpoints here will be prefixed with /api/mentors
app.use('/api/mentors', require('./routes/mentors'));

// Routes for student-related operations
app.use('/api/students', require('./routes/students'));

// Routes for evaluation-related operations
app.use('/api/evaluations', require('./routes/evaluations'));

// Global error-handling middleware
// Catches errors from anywhere in the app (routes, DB, etc.)
app.use((err, req, res, next) => {
  // Log full error stack for debugging
  console.error(err.stack);

  // Send structured error response to client
  res.status(err.status || 500).json({
    message: err.message || 'Server error'
  });
});

// Connect to MongoDB using Mongoose
// URI is stored securely in environment variables
mongoose
  .connect(process.env.MONGO_URI)

  // If DB connection is successful
  .then(() => {
    console.log('MongoDB connected');

    // Start the server only AFTER DB is connected
    // Ensures app doesn't run without database access
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })

  // If DB connection fails
  .catch((err) => {
    // Log error message
    console.error('DB connection failed:', err.message);

    // Exit the process with failure code
    // Prevents app from running in broken state
    process.exit(1);
  });