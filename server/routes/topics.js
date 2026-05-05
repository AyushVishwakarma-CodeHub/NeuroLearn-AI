const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { calculateRetention } = require('../utils/retention');
const { protect } = require('../middleware/authMiddleware');

// Get all topics for a user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const topics = await Topic.find({ userId });
    
    // Blend time-based decay with the actual stored retention score
    const updatedTopics = topics.map(topic => {
      const timeDecay = calculateRetention(topic.updatedAt, topic.stabilityFactor, topic.difficulty);
      // The stored retentionScore comes from the quiz result — blend it with decay
      const blendedScore = Math.round((topic.retentionScore * 0.6) + (timeDecay * 0.4));
      return { ...topic.toObject(), retentionScore: Math.max(0, Math.min(100, blendedScore)) };
    });
    
    res.json(updatedTopics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new topic
router.post('/', async (req, res) => {
  try {
    const newTopic = new Topic(req.body);
    await newTopic.save();
    res.status(201).json(newTopic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

