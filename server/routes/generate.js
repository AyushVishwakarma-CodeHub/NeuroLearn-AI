const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const { protect } = require('../middleware/authMiddleware');

// Setup multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 1. PDF Generation
router.post('/from-pdf', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let text = '';
    const dataBuffer = req.file.buffer;
    const pdfData = await pdfParse(dataBuffer);
    text = pdfData.text;

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'PDF is too short or unreadable' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI study assistant. Generate a structured JSON study set from the provided text. Return ONLY JSON with keys: "topicName", "flashcards" (array of {question, answer}), and "quizzes" (array of {question, options, answer (index)}).'
        },
        {
          role: 'user',
          content: `Generate a study set from this text: ${text.substring(0, 4000)}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

// 2. Image/OCR Generation (Vision-based)
router.post('/from-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI study assistant. Analyze the uploaded image (notes/textbook) and generate a study set. Return ONLY JSON with keys: "topicName", "flashcards" (array of {question, answer}), and "quizzes" (array of {question, options, answer (index)}).'
        },
        {
          role: 'user',
          content: [
            { type: "text", text: "Generate a comprehensive study set from this image." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      model: 'llama-3.2-90b-vision-preview',
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    console.error('Image Generation Error:', err);
    res.status(500).json({ error: 'Failed to process image. Make sure it contains readable text.' });
  }
});

// 3. AI Coach Chat
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are the NeuroLearn AI Coach. You are supportive, encouraging, and highly intelligent. 
          Your goal is to help students succeed. 
          Current User Context: ${context || 'General student session.'}
          Keep responses concise (max 3-4 sentences unless explaining a concept) and always encourage the user.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error('Chat Error:', err);
    res.status(500).json({ error: 'AI Coach is busy right now. Try again shortly!' });
  }
});

module.exports = router;
