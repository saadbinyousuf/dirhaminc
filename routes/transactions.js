const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Auth middleware
function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token is not valid' });
  }
}

// Create
router.post('/', auth, [
  body('amount').isNumeric().withMessage('Amount is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['income', 'expense']).withMessage('Type is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const transaction = new Transaction({ ...req.body, userId: req.user });
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Read all
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      req.body,
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 