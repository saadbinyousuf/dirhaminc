const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, required: true }, // e.g., 'bank', 'cash', etc.
  balance: { type: Number, required: true, default: 0 },
  currency: { type: String, required: true },
  accountNumber: { type: String },
  institution: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Account', accountSchema); 