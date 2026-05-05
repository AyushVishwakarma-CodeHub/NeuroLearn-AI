import React from 'react';
import './RevisionPicker.css';

function RevisionPicker({ topicName, onQuiz, onFlashcards, onTutor, onClose }) {
  return (
    <div className="rp-backdrop" onClick={onClose}>
      <div className="rp-modal glass-card" onClick={e => e.stopPropagation()}>
        <button className="rp-close" onClick={onClose}>✕</button>

        <div className="rp-header">
          <div className="rp-badge">📌 Revision Session</div>
          <h2 className="rp-topic">{topicName}</h2>
          <p className="rp-subtitle">Choose how you want to revise this topic</p>
        </div>

        <div className="rp-cards">

          {/* Quiz Card */}
          <div className="rp-card rp-card--quiz" onClick={onQuiz}>
            <div className="rp-card-icon">🎮</div>
            <h3>Take a Quiz</h3>
            <p>AI generates fresh MCQ questions on this topic. Best for testing if you truly remember.</p>
            <div className="rp-card-meta">
              <span>⭐ +15 XP</span>
              <span>~5 mins</span>
            </div>
            <button className="rp-btn rp-btn--quiz">Start Quiz →</button>
          </div>

          {/* Flashcards Card */}
          <div className="rp-card rp-card--flash" onClick={onFlashcards}>
            <div className="rp-card-icon">🎴</div>
            <h3>Flashcard Review</h3>
            <p>Flip through saved flashcards for this topic. Great for quick concept recall.</p>
            <div className="rp-card-meta">
              <span>⭐ +10 XP</span>
              <span>Go at your pace</span>
            </div>
            <button className="rp-btn rp-btn--flash">Review Cards →</button>
          </div>

          {/* AI Tutor Card */}
          <div className="rp-card rp-card--tutor" onClick={onTutor}>
            <div className="rp-card-icon">🤖</div>
            <h3>Ask AI Tutor</h3>
            <p>Let the AI re-explain this topic from scratch. Best when you don't understand it at all.</p>
            <div className="rp-card-meta">
              <span>No XP</span>
              <span>Concept clarity</span>
            </div>
            <button className="rp-btn rp-btn--tutor">Open Tutor →</button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RevisionPicker;
