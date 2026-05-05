const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require('groq-sdk');
const StudySession = require('../models/StudySession');
const Topic = require('../models/Topic');
const { protect } = require('../middleware/authMiddleware');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Log a study session (like a quiz) and ping the ML service to update retention
router.post('/log', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicName, score, duration } = req.body;

    if (!topicName || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Find or create the Topic
    let topic = await Topic.findOne({ userId, title: new RegExp(`^${topicName}$`, 'i') });
    
    if (!topic) {
      topic = new Topic({
        userId,
        title: topicName,
        subject: 'General', // Default, could be derived later
        difficulty: 'medium',
        retentionScore: 100,
        stabilityFactor: 1
      });
      await topic.save();
    }

    // 2. Fetch past sessions to gather ML features
    const pastSessions = await StudySession.find({ userId, topicId: topic._id }).sort({ date: -1 });
    
    const totalReviews = pastSessions.length;
    let lastGapDays = 0;
    
    if (totalReviews > 0) {
      const lastSessionDate = pastSessions[0].date;
      const msDiff = new Date() - new Date(lastSessionDate);
      lastGapDays = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    }

    // 3. Create the new Study Session
    const newSession = new StudySession({
      userId,
      topicId: topic._id,
      duration: duration || 5, // default 5 mins for a quiz
      performanceScore: score
    });
    await newSession.save();

    // 4. Ping the ML Python Service to predict next revision
    let daysUntilNextRevision = 1; // Fallback
    try {
      const mlResponse = await axios.post(`${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/predict`, {
        last_score: score,
        study_duration: duration || 5,
        total_reviews: totalReviews + 1, // Include current
        last_gap_days: lastGapDays
      });
      
      if (mlResponse.data && mlResponse.data.days_until_next_revision !== undefined) {
        daysUntilNextRevision = mlResponse.data.days_until_next_revision;
      }
    } catch (mlErr) {
      console.error('Warning: ML Service offline or failed. Using fallback calculation.', mlErr.message);
      // Fallback rough calculation
      daysUntilNextRevision = score > 80 ? 3 : (score > 50 ? 1 : 0.5);
    }

    // 5. Update Topic retention and next revision date
    // Calculate new retention score based loosely on the ML prediction and actual score
    const newRetention = Math.min(100, Math.max(0, score * 0.8 + (daysUntilNextRevision * 2)));
    
    const nextRevisionDate = new Date();
    nextRevisionDate.setDate(nextRevisionDate.getDate() + daysUntilNextRevision);

    topic.retentionScore = Math.round(newRetention);
    topic.nextRevisionDate = nextRevisionDate;
    
    // Adjust difficulty dynamically based on score
    if (score >= 90) topic.difficulty = 'easy';
    else if (score >= 60) topic.difficulty = 'medium';
    else topic.difficulty = 'hard';

    await topic.save();

    res.json({
      message: 'Study session logged successfully',
      topic,
      mlPredictionDays: daysUntilNextRevision
    });

  } catch (err) {
    console.error('Study Log Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get overall study stats for the dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await StudySession.find({ userId });
    
    let totalMinutes = 0;
    let totalScore = 0;

    sessions.forEach(session => {
      totalMinutes += (session.duration || 0);
      totalScore += (session.performanceScore || 0);
    });

    const averageScore = sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0;
    
    // Format duration nicely
    let formattedDuration = `${totalMinutes}m`;
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      formattedDuration = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    res.json({
      totalMinutes,
      formattedDuration,
      averageScore,
      totalSessions: sessions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get full study history with topic details for analytics
router.get('/history', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch last 30 sessions, populated with topic titles
    const sessions = await StudySession.find({ userId })
      .populate('topicId', 'title')
      .sort({ date: -1 })
      .limit(50);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI-driven study recommendations
router.get('/coach', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await StudySession.find({ userId })
      .populate('topicId', 'title')
      .sort({ date: -1 })
      .limit(10);

    if (sessions.length === 0) {
      return res.json({ tip: "You haven't started studying yet! Pick a topic and take your first quiz to get personalized advice. 🚀" });
    }

    const historySummary = sessions.map(s => 
      `Topic: ${s.topicId?.title || 'Unknown'}, Score: ${s.performanceScore}%, Date: ${s.date.toLocaleDateString()}`
    ).join('\n');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI Study Coach. Analyze the user study history and give ONE short (max 2 sentences), encouraging, data-driven tip. Be specific about their scores or topics. Use an emoji.'
        },
        {
          role: 'user',
          content: `Here is my recent study history:\n${historySummary}\n\nWhat should I focus on?`
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    res.json({ tip: completion.choices[0].message.content });
  } catch (err) {
    console.error('AI Coach Error:', err);
    res.json({ tip: "Keep pushing forward! Consistency is the key to mastery. 🧠" });
  }
});

module.exports = router;
