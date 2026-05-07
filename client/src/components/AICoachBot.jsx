import React, { useState, useRef, useEffect } from 'react';
import './AICoachBot.css';
import API_BASE from '../config';

const AICoachBot = ({ user, topics }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.username}! I'm your NeuroLearn AI Coach. Need help with your ${topics.length} topics today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // We'll use the existing chat endpoint or a specific coach one
      const response = await fetch(`${API_BASE}/api/generate/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          message: userMessage,
          context: `User has ${topics.length} topics. Weakest topic is ${topics.sort((a,b) => a.retentionScore - b.retentionScore)[0]?.title}. Act as a supportive NeuroLearn AI Study Coach.`
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Let's try again in a moment!" }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please check your connection!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-bot-wrapper ${isOpen ? 'bot-open' : ''}`}>
      {/* Launcher Button */}
      <button className="bot-launcher" onClick={() => setIsOpen(!isOpen)}>
        <div className="bot-icon">🤖</div>
        {!isOpen && <div className="bot-ping"></div>}
      </button>

      {/* Chat Window */}
      <div className="bot-window glass-card">
        <div className="bot-header">
          <div className="bot-header-info">
            <div className="status-dot"></div>
            <h3>NeuroLearn AI Coach</h3>
          </div>
          <button className="close-bot" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="bot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-bubble loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="bot-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask your coach anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICoachBot;
