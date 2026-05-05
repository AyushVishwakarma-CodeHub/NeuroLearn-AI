const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  retentionScore: { type: Number, default: 100 }, // Percentage
  stabilityFactor: { type: Number, default: 1 }, // Used for formula
  nextRevisionDate: { type: Date, default: Date.now },
  weakPoints: [String],
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
