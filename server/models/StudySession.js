const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  duration: { type: Number, required: true }, // minutes
  performanceScore: { type: Number, required: true }, // 0-100
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StudySession', studySessionSchema);
