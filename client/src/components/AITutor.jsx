import React, { useState, useRef, useEffect } from 'react';
import API_BASE, { authFetch } from '../config';

const AITutor = ({ user, setGamification, preloadedMessage, setPreloadedMessage }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your **NeuroLearn AI Tutor**. 🧠\n\nI can help you understand any topic using first-principles thinking. Just ask me a question!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-send preloaded message from revision picker
  useEffect(() => {
    if (preloadedMessage) {
      if (setPreloadedMessage) setPreloadedMessage(null);
      // Slight delay so component is fully mounted
      setTimeout(() => {
        sendMessage(preloadedMessage);
      }, 400);
    }
  }, []);

  const sendMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    const newMessages = [
      { role: 'assistant', content: 'Hello! I am your **NeuroLearn AI Tutor**. 🧠\n\nI can help you understand any topic using first-principles thinking. Just ask me a question!' },
      userMessage
    ];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/analytics/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not reach the AI server.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await authFetch(`${API_BASE}/api/analytics/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ Could not reach the AI server. Make sure the backend is running on port 5000.' 
      }]);
    }
    setLoading(false);
  };

  // Simple markdown-like rendering
  const renderContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="glass-card tutor-container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === 'assistant' && <div className="msg-avatar">🤖</div>}
            <div 
              className="bubble" 
              dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
            />
            {msg.role === 'user' && <div className="msg-avatar">👤</div>}
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="msg-avatar">🤖</div>
            <div className="bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="chat-input-area">
        <input 
          type="text" 
          placeholder="Ask me anything... (e.g., Explain quantum entanglement)" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <button className="btn-primary" onClick={handleSend} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
      <style>{`
        .tutor-container { height: 75vh; display: flex; flex-direction: column; overflow: hidden; }
        .chat-window { flex-grow: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .message { display: flex; align-items: flex-start; gap: 0.8rem; max-width: 85%; animation: fadeUp 0.3s ease-out; }
        .message.assistant { align-self: flex-start; }
        .message.user { align-self: flex-end; flex-direction: row-reverse; }
        .msg-avatar { font-size: 1.5rem; flex-shrink: 0; margin-top: 4px; }
        .bubble { padding: 1rem 1.2rem; border-radius: 18px; line-height: 1.6; font-size: 0.95rem; }
        .bubble code { background: rgba(99, 102, 241, 0.2); padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; }
        .assistant .bubble { background: var(--bg-card); border: 1px solid var(--glass-border); color: var(--text-primary); border-top-left-radius: 4px; }
        .user .bubble { background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); color: white; border-top-right-radius: 4px; }
        .chat-input-area { padding: 1rem; display: flex; gap: 1rem; border-top: 1px solid var(--glass-border); }
        .chat-input-area input { flex-grow: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 0.9rem 1rem; border-radius: 12px; color: white; outline: none; font-size: 0.95rem; transition: var(--transition); }
        .chat-input-area input:focus { border-color: var(--accent-primary); box-shadow: 0 0 15px rgba(99,102,241,0.2); }
        .chat-input-area input::placeholder { color: rgba(148,163,184,0.5); }
        
        .typing { display: flex; align-items: center; gap: 5px; padding: 1rem 1.5rem !important; }
        .dot { width: 8px; height: 8px; background: var(--text-secondary); border-radius: 50%; animation: bounce 1.4s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AITutor;
