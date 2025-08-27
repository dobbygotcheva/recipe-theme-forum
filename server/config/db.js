const config = require('./config');
const mongoose = require('mongoose');

module.exports = () => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: false, // Disable for MongoDB 3.6 compatibility
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 10000
  };

  return mongoose.connect(config.dbURL, options)
    .then(() => {
      console.log('MongoDB connected successfully.');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      process.exit(1); // Optional: exit process if connection fails
    });
};