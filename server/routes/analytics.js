const express = require('express');
const router = express.Router();
const axios = require('axios');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// AI Tutor Chat — powered by Groq (llama-3.3-70b-versatile)
router.post('/tutor', async (req, res) => {
  try {
    const { messages } = req.body;

    // Map to Groq-compatible format (system message + conversation)
    const groqMessages = [
      {
        role: 'system',
        content: `You are NeuroLearn AI, an advanced intelligent study tutor. Your job is to:
1. Explain concepts using first-principles thinking
2. Break down complex topics into simple, digestible parts
3. Use analogies and real-world examples
4. Ask follow-up questions to test understanding
5. Be encouraging and supportive
Keep responses concise but thorough. Use markdown formatting for clarity.`
      },
      ...messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    res.json({ reply });
  } catch (err) {
    console.error('AI Tutor Error:', err.message);
    res.status(500).json({ reply: '⚠️ Sorry, the AI Tutor is temporarily unavailable. Please try again.' });
  }
});

// Quiz Generator — powered by Groq
router.post('/quiz', async (req, res) => {
  try {
    const { topic, weakPoints } = req.body;

    const prompt = `Generate exactly 5 multiple-choice quiz questions about "${topic}".${weakPoints ? ` Focus on these weak areas: ${weakPoints}` : ''}

You MUST respond with ONLY a valid JSON object in this exact format, no extra text:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0
    }
  ]
}
The "answer" field is the 0-based index of the correct option.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a strict JSON-outputting quiz generator. Output only valid JSON, no markdown, no extra text.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    const quiz = JSON.parse(content);
    res.json(quiz);
  } catch (err) {
    console.error('Quiz Generation Error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
});

// ML Prediction proxy
router.post('/predict', async (req, res) => {
  try {
    const { last_score, study_duration, total_reviews, last_gap_days } = req.body;
    const response = await axios.post('http://localhost:8000/predict', {
      last_score, study_duration, total_reviews, last_gap_days
    });
    res.json(response.data);
  } catch (err) {
    console.error('ML Prediction Error:', err.message);
    res.json({ days_until_next_revision: 3, note: 'ML service offline, using fallback' });
  }
});

module.exports = router;
