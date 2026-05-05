const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');
const { protect, admin } = require('../middleware/authMiddleware');

// Get Overall Stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTopics = await Topic.countDocuments();
    const totalSessions = await StudySession.countDocuments();
    
    // Recent 5 users
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt level');

    // Recent 5 activities
    const recentActivities = await StudySession.find()
      .populate('userId', 'username')
      .populate('topicId', 'title')
      .sort({ date: -1 })
      .limit(5);

    // User growth (simplified: last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersLastWeek = await User.countDocuments({ 
      role: 'user', 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.json({
      metrics: {
        totalUsers,
        totalTopics,
        totalSessions,
        newUsersLastWeek
      },
      recentUsers,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Users Detail
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
