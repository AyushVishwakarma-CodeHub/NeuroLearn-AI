const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lifetimeXp: { type: Number, default: 0 },
  xp: { type: Number, default: 0 }, // Spendable currency for store
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  badges: [String],
  achievements: [{ name: String, unlockedAt: { type: Date, default: Date.now } }],
  unlockedItems: [String],
  stats: {
    studySessions: { type: Number, default: 0 },
    quizzesTaken: { type: Number, default: 0 },
    topicsCompleted: { type: Number, default: 0 }
  },
  // Profile specific fields
  avatar: { type: String, default: '/avatars/avatar_abstract.png' },
  gender: { type: String, default: 'Prefer not to say' },
  qualification: { type: String, default: '' },
  bio: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
