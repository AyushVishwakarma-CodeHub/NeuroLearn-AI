const axios = require('axios');

const generateQuiz = async (topic, weakPoints) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a smart quiz generator. Create 5 challenging multiple-choice questions.' },
        { role: 'user', content: `Generate a quiz for the topic "${topic}". Focus on these weak points: ${weakPoints.join(', ')}.` }
      ],
      response_format: { type: 'json_object' }
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('Quiz Generation Error:', err.message);
    return null;
  }
};

const getTutorResponse = async (topic, question) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are NeuroLearn AI, a helpful tutor. Explain concepts using first principles.' },
        { role: 'user', content: `Topic: ${topic}. Question: ${question}` }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('AI Tutor Error:', err.message);
    return 'I am having trouble connecting to my neural network right now.';
  }
};

module.exports = { generateQuiz, getTutorResponse };
