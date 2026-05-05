const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 2000,
  7: 4000,
};

const ACTION_XP = {
  study_session: 10,
  quiz_completed: 20,
  revision_completed: 15,
  daily_streak: 5,
  weak_topic_improved: 25,
};

const STORE_ITEMS = {
  // Digital Perks
  'custom_timer': { name: 'Custom Study Timer', cost: 100 },
  'advanced_analytics': { name: 'Advanced Analytics', cost: 250 },
  'premium_notifications': { name: 'Smart Reminders', cost: 150 },
  'ai_tutor_priority': { name: 'AI Tutor Priority', cost: 500 },
  // Merchandise
  'merch_tshirt': { name: 'NeuroLearn T-Shirt', cost: 2000 },
  'merch_mug': { name: 'Coffee Mug', cost: 1000 },
  'merch_notebook': { name: 'Smart Notebook', cost: 800 },
  'merch_stickers': { name: 'Sticker Pack', cost: 300 },
  'merch_voucher_500': { name: '₹500 Gift Voucher', cost: 3000 },
  'merch_voucher_1000': { name: '₹1000 Gift Voucher', cost: 5000 },
};

function calculateLevel(xp) {
  let newLevel = 1;
  for (const [level, threshold] of Object.entries(LEVEL_THRESHOLDS)) {
    if (xp >= threshold) {
      newLevel = parseInt(level);
    }
  }
  return newLevel;
}

// Get Global Leaderboard (Top 10 users by lifetimeXp)
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ lifetimeXp: -1 })
      .limit(10)
      .select('username lifetimeXp level badges');
      
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch gamification status
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Add default levels config to help the frontend
    res.json({
      lifetimeXp: user.lifetimeXp,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      badges: user.badges || [],
      achievements: user.achievements || [],
      unlockedItems: user.unlockedItems || [],
      stats: user.stats || { studySessions: 0, quizzesTaken: 0, topicsCompleted: 0 },
      levelThresholds: LEVEL_THRESHOLDS
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Perform action and grant XP
router.post('/action', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const xpGranted = ACTION_XP[action] || 0;
    
    if (xpGranted > 0) {
      user.lifetimeXp += xpGranted;
      user.xp += xpGranted;
      
      // Update statistics
      if (!user.stats) user.stats = {};
      if (action === 'study_session') user.stats.studySessions = (user.stats.studySessions || 0) + 1;
      if (action === 'quiz_completed') user.stats.quizzesTaken = (user.stats.quizzesTaken || 0) + 1;
      
      // Calculate Daily Streak
      const now = new Date();
      const lastActiveDate = new Date(user.lastActive || Date.now() - 86400000); // Default to yesterday if empty
      
      const nowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastActiveStart = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
      
      const diffTime = Math.abs(nowStart - lastActiveStart);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        // Active yesterday, increment streak
        user.streak = (user.streak || 0) + 1;
      } else if (diffDays > 1) {
        // Missed a day, reset streak
        user.streak = 1;
      } else if (user.streak === 0) {
        // First time
        user.streak = 1;
      }
      
      user.lastActive = now;
      
      // Calculate level
      const oldLevel = user.level;
      const newLevel = calculateLevel(user.lifetimeXp);
      let leveledUp = false;
      if (newLevel > oldLevel) {
        user.level = newLevel;
        leveledUp = true;
      }
      
      // Check achievements
      const achievementsToUnlock = [];
      
      // 50 Study Sessions Achievement
      if (user.stats.studySessions >= 50 && !user.achievements.find(a => a.name === '50 Study Sessions')) {
        achievementsToUnlock.push('50 Study Sessions');
      }
      
      // Quiz Master Achievement
      if (user.stats.quizzesTaken >= 10 && !user.achievements.find(a => a.name === 'Quiz Master')) {
        achievementsToUnlock.push('Quiz Master');
      }
      
      // First Steps
      if (user.lifetimeXp >= 10 && !user.achievements.find(a => a.name === 'First Steps')) {
        achievementsToUnlock.push('First Steps');
      }
      
      achievementsToUnlock.forEach(name => {
        user.achievements.push({ name, unlockedAt: new Date() });
      });
      
      await user.save();
      
      res.json({
        xpGranted,
        totalXp: user.xp,
        lifetimeXp: user.lifetimeXp,
        level: user.level,
        streak: user.streak,
        leveledUp,
        newAchievements: achievementsToUnlock
      });
    } else {
      res.status(400).json({ error: 'Invalid action type' });
    }
  } catch (err) {
    console.error('Gamification action error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Purchase item from store
router.post('/purchase', protect, async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const item = STORE_ITEMS[itemId];
    if (!item) return res.status(400).json({ error: 'Invalid item ID' });
    
    if (user.unlockedItems && user.unlockedItems.includes(itemId)) {
      return res.status(400).json({ error: 'Item already unlocked' });
    }
    
    if (user.xp < item.cost) {
      return res.status(400).json({ error: `Not enough XP. Requires ${item.cost} XP.` });
    }
    
    user.xp -= item.cost;
    if (!user.unlockedItems) user.unlockedItems = [];
    user.unlockedItems.push(itemId);
    
    await user.save();
    
    res.json({ message: 'Purchase successful', xpRemaining: user.xp, unlockedItems: user.unlockedItems });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Store catalog
router.get('/store/catalog', (req, res) => {
  res.json(STORE_ITEMS);
});

module.exports = router;
