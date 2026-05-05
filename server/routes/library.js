const express = require('express');
const router = express.Router();
const StudySet = require('../models/StudySet');
const { protect } = require('../middleware/authMiddleware');

// 1. Save a new generated Study Set to Library
router.post('/save', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicName, flashcards, quizzes } = req.body;

    if (!topicName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newStudySet = new StudySet({
      userId,
      topicName,
      flashcards: flashcards || [],
      quizzes: quizzes || []
    });

    await newStudySet.save();

    res.status(201).json({ message: 'Successfully saved to library', studySet: newStudySet });
  } catch (error) {
    console.error('Error saving study set:', error);
    res.status(500).json({ error: 'Failed to save to library' });
  }
});

// 2. Get all Study Sets for a User
router.get('/my-sets', protect, async (req, res) => {
  try {
    const studySets = await StudySet.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(studySets);
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ error: 'Failed to fetch library' });
  }
});

// 3. Delete a Study Set
router.delete('/:setId', protect, async (req, res) => {
  try {
    const deleted = await StudySet.findOneAndDelete({ _id: req.params.setId, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Study set not found or not yours' });
    res.status(200).json({ message: 'Study set deleted' });
  } catch (error) {
    console.error('Error deleting study set:', error);
    res.status(500).json({ error: 'Failed to delete study set' });
  }
});

module.exports = router;
