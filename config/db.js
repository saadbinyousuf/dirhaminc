// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // These are the only two options needed for modern Mongoose versions
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;