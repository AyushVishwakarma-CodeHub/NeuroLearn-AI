const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.VITE_CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/neurolearn')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/study', require('./routes/study'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/users', require('./routes/users'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/library', require('./routes/library'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.send('NeuroLearn Backend API Running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
