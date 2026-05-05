import React, { useState, useEffect } from 'react';
import API_BASE, { authFetch } from '../config';

const Flashcards = ({ user }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchFlashcards();
    }
  }, [user]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/flashcards`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setFlashcards(data);
      }
    } catch (err) {
      console.error('Failed to fetch flashcards', err);
    }
    setLoading(false);
  };

  const handleReview = async (isCorrect) => {
    const currentCard = flashcards[currentIndex];
    try {
      await authFetch(`${API_BASE}/api/flashcards/${currentCard._id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCorrect })
      });
      
      // Move to next card
      setFlipped(false);
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // Finished all cards, refresh list
          fetchFlashcards();
          setCurrentIndex(0);
        }
      }, 300);
      
    } catch (err) {
      console.error('Error reviewing flashcard', err);
    }
  };

  if (loading) return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading your flashcards...</div>;

  if (flashcards.length === 0) {
    return (
      <div className="glass-card flashcard-container empty-state">
        <div className="fc-icon">📭</div>
        <h3>You're all caught up!</h3>
        <p>You have no pending flashcards to review right now.</p>
        <p className="fc-tip">Hint: Missed questions from your quizzes automatically appear here for spaced-repetition review.</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="glass-card flashcard-container">
      <div className="fc-header">
        <h3>Spaced Repetition Review</h3>
        <span>Card {currentIndex + 1} of {flashcards.length}</span>
      </div>
      
      <div className={`flashcard-scene ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
        <div className="flashcard-inner">
          <div className="flashcard-face flashcard-front">
            <span className="fc-topic-badge">{currentCard.topicName}</span>
            <div className="fc-content">
              <h4>{currentCard.question}</h4>
            </div>
            <span className="fc-hint">Click to reveal answer</span>
          </div>
          
          <div className="flashcard-face flashcard-back">
            <span className="fc-topic-badge">{currentCard.topicName}</span>
            <div className="fc-content">
              <h4 className="correct-answer">{currentCard.answer}</h4>
            </div>
            
            <div className="fc-actions" onClick={e => e.stopPropagation()}>
              <p>Did you remember it?</p>
              <div className="action-btns">
                <button className="btn-danger" onClick={() => handleReview(false)}>No, forgot it</button>
                <button className="btn-success" onClick={() => handleReview(true)}>Yes, got it!</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .flashcard-container {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 480px;
        }
        
        .fc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 560px;
          margin-bottom: 2rem;
        }
        
        .fc-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .fc-header span {
          color: var(--text-secondary);
          font-size: 0.82rem;
          font-weight: 500;
        }
        
        .flashcard-scene {
          width: 100%;
          max-width: 560px;
          height: 320px;
          perspective: 1000px;
          cursor: pointer;
        }
        
        .flashcard-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }
        
        .flashcard-scene.is-flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        
        .flashcard-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        
        .flashcard-back {
          transform: rotateY(180deg);
          background: rgba(129, 140, 248, 0.05);
          border-color: rgba(129, 140, 248, 0.2);
        }
        
        .fc-topic-badge {
          align-self: flex-start;
          background: rgba(255,255,255,0.06);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        
        .fc-content {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        
        .fc-content h4 {
          font-size: 1.3rem;
          line-height: 1.6;
          margin: 0;
          color: var(--text-primary) !important;
          -webkit-text-fill-color: var(--text-primary) !important;
        }
        
        .correct-answer {
          color: var(--accent-tertiary) !important;
          -webkit-text-fill-color: var(--accent-tertiary) !important;
        }
        
        .fc-hint {
          align-self: center;
          font-size: 0.82rem;
          color: var(--text-tertiary);
        }
        
        .fc-actions {
          text-align: center;
          margin-top: 0.75rem;
        }
        
        .fc-actions p {
          margin-bottom: 0.75rem;
          color: var(--text-secondary);
          font-size: 0.88rem;
        }
        
        .action-btns {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
        
        .btn-success {
          background: rgba(52, 211, 153, 0.1);
          color: var(--accent-tertiary);
          border: 1px solid rgba(52, 211, 153, 0.3);
          padding: 0.55rem 1.1rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }
        
        .btn-success:hover {
          background: rgba(52, 211, 153, 0.2);
          transform: translateY(-1px);
        }
        
        .btn-danger {
          background: rgba(251, 113, 133, 0.1);
          color: var(--danger);
          border: 1px solid rgba(251, 113, 133, 0.3);
          padding: 0.55rem 1.1rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: var(--transition-fast);
        }
        
        .btn-danger:hover {
          background: rgba(251, 113, 133, 0.2);
          transform: translateY(-1px);
        }
        
        .flashcard-container.empty-state {
          text-align: center;
          justify-content: center;
        }
        
        .fc-icon {
          font-size: 3.5rem;
          margin-bottom: 1rem;
        }
        
        .fc-tip {
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-tertiary);
          max-width: 360px;
        }
      `}</style>
    </div>
  );
};

export default Flashcards;
