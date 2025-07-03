const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
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
  body('budgetAmount').isNumeric().withMessage('Budget amount is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const budget = new Budget({ ...req.body, userId: req.user });
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Read all
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ error: 'Not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user });
    if (!budget) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 