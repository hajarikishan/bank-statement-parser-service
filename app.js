require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api.routes');

const app = express();
app.use(express.json());

// ... existing code
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// API Routes
app.use('/api', apiRoutes);
// ... rest of the file

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Bank Statement Parser API is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});