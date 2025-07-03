const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  category: { type: String, trim: true },
  budgetAmount: { type: Number, required: true },
  spentAmount: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Budget', budgetSchema); 