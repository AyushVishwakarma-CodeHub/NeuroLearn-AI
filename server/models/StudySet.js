const mongoose = require('mongoose');

const studySetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicName: { type: String, required: true },
  flashcards: [{
    front: { type: String, required: true },
    back: { type: String, required: true }
  }],
  quizzes: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }
  }],
}, { timestamps: true });

module.exports = mongoose.model('StudySet', studySetSchema);
