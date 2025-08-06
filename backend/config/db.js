const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Auth Atlas MongoDB CONNECTED SUCCESSFULLY');
  } catch (error) {
    console.error('Auth Atlas MongoDB connection failed:', error);
    process.exit(1); // Exit the process with failure
  }
}

module.exports = connectDB;