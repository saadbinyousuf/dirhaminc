const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', (req, res) => {
  res.json({ message: 'Register endpoint hit!' });
});

app.listen(5050, () => console.log('Server running on port 5050'));