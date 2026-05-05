const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const { protect } = require('../middleware/authMiddleware');

// Get all due flashcards for a user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch flashcards that are due (nextReviewDate <= now)
    const flashcards = await Flashcard.find({ 
      userId, 
      nextReviewDate: { $lte: new Date() } 
    }).sort({ nextReviewDate: 1 });

    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a missed question as a flashcard
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicName, question, answer } = req.body;
    
    // Check if flashcard already exists to avoid exact duplicates
    const existing = await Flashcard.findOne({ userId, question });
    if (existing) {
      return res.status(200).json({ message: 'Flashcard already exists', flashcard: existing });
    }

    const newFlashcard = new Flashcard({ userId, topicName, question, answer });
    await newFlashcard.save();
    
    res.status(201).json(newFlashcard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a flashcard after review (Spaced Repetition Algorithm)
router.put('/:id/review', protect, async (req, res) => {
  try {
    const { isCorrect } = req.body;
    const flashcard = await Flashcard.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!flashcard) return res.status(404).json({ error: 'Flashcard not found' });

    if (isCorrect) {
      // Increase mastery and push out review date
      flashcard.masteryLevel = Math.min(3, flashcard.masteryLevel + 1);
      
      const nextDate = new Date();
      if (flashcard.masteryLevel === 1) nextDate.setDate(nextDate.getDate() + 1); // Tomorrow
      else if (flashcard.masteryLevel === 2) nextDate.setDate(nextDate.getDate() + 3); // 3 days
      else nextDate.setDate(nextDate.getDate() + 7); // A week
      
      flashcard.nextReviewDate = nextDate;
    } else {
      // Reset mastery and review immediately
      flashcard.masteryLevel = 0;
      flashcard.nextReviewDate = new Date();
    }

    await flashcard.save();
    res.json(flashcard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
