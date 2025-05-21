const mongoose = require('mongoose');

const connectDB = async() => {
  try{
    const MONGODB_URI = process.env.MONGODB_URI.replace(/\/$/, '') + '/lead-manager';
    console.log('Connecting to MongoDB:', MONGODB_URI);
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  }catch(error){
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;