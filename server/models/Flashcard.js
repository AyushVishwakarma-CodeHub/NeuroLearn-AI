const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicName: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  masteryLevel: { type: Number, default: 0 }, // 0 = New, 1 = Learning, 2 = Reviewing, 3 = Mastered
  nextReviewDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Flashcard', flashcardSchema);
