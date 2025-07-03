const express = require('express');

const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

  
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/pending', require('./routes/pending'));
app.use('/api/accounts', require('./routes/accounts'));

app.listen(5050, () => console.log('Server running on port 5050'));