const express = require('express');
const connectDB = require('./config/db'); // Assuming this exists
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors'); // Make sure this line is here

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors()); // Make sure this line is here
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/pending', require('./routes/pending'));


app.listen(5050, () => console.log('Server running on port 5050'));