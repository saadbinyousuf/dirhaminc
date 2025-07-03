const express = require('express');
const { body, validationResult } = require('express-validator');
const PendingTransaction = require('../models/PendingTransaction');
const jwt = require('jsonwebtoken');

const router = express.Router();

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
    const pending = new PendingTransaction({ ...req.body, userId: req.user });
    await pending.save();
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Read all
router.get('/', auth, async (req, res) => {
  try {
    const pendings = await PendingTransaction.find({ userId: req.user });
    res.json(pendings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const pending = await PendingTransaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      req.body,
      { new: true }
    );
    if (!pending) return res.status(404).json({ error: 'Not found' });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const pending = await PendingTransaction.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!pending) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 