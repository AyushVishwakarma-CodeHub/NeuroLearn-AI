import React, { useState, useEffect } from 'react';
import API_BASE, { authFetch } from '../config';
import './Library.css';

function FlashcardStudyMode({ set, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(new Set());
  const [finished, setFinished] = useState(false);

  const card = set.flashcards[currentIndex];
  const progress = Math.round(((currentIndex) / set.flashcards.length) * 100);

  const handleKnow = () => {
    const newKnown = new Set(known);
    newKnown.add(currentIndex);
    setKnown(newKnown);
    goNext();
  };

  const handleReview = () => goNext();

  const goNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < set.flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setFinished(true);
      }
    }, 300);
  };

  if (finished) {
    const knownCount = known.size;
    const reviewCount = set.flashcards.length - knownCount;
    return (
      <div className="library-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{knownCount === set.flashcards.length ? '🏆' : '📖'}</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Session Complete!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You knew <strong style={{ color: '#4ADE80' }}>{knownCount}</strong> out of {set.flashcards.length} cards.
            {reviewCount > 0 && ` ${reviewCount} card(s) still need review.`}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => { setCurrentIndex(0); setIsFlipped(false); setKnown(new Set()); setFinished(false); }}>Study Again</button>
            <button className="btn-secondary" onClick={onBack}>← Back to Library</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
      <div className="flashcard-study-nav">
        <button className="btn-secondary" onClick={onBack}>← Back</button>
        <h3>{set.topicName}</h3>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{currentIndex + 1} / {set.flashcards.length}</span>
      </div>

      <div className="fc-progress-bar-wrap">
        <div className="fc-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="fc-scene-wrapper">
        <div className={`fc-scene ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
          <div className="fc-card-inner">
            <div className="fc-face fc-front">
              <div className="fc-label">QUESTION</div>
              <p className="fc-text">{card.front}</p>
              <span className="fc-hint-text">Click to reveal answer</span>
            </div>
            <div className="fc-face fc-back">
              <div className="fc-label" style={{ color: '#4ADE80' }}>ANSWER</div>
              <p className="fc-text" style={{ color: '#4ADE80' }}>{card.back}</p>
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div className="fc-action-row" onClick={e => e.stopPropagation()}>
          <button className="fc-btn-review" onClick={handleReview}>🔄 Review Again</button>
          <button className="fc-btn-know" onClick={handleKnow}>✅ I Know This</button>
        </div>
      )}
      {!isFlipped && (
        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '1.5rem', fontSize: '0.9rem' }}>Click the card to reveal the answer</p>
      )}

      <style>{`
        .flashcard-study-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .flashcard-study-nav h3 { margin: 0; font-size: 1.2rem; }
        .fc-progress-bar-wrap { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; margin-bottom: 3rem; }
        .fc-progress-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #c084fc); border-radius: 10px; transition: width 0.5s ease; }
        .fc-scene-wrapper { display: flex; justify-content: center; }
        .fc-scene { width: 100%; max-width: 600px; height: 300px; perspective: 1200px; cursor: pointer; }
        .fc-card-inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1); }
        .fc-scene.flipped .fc-card-inner { transform: rotateY(180deg); }
        .fc-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); padding: 2.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; }
        .fc-front { background: rgba(255,255,255,0.04); }
        .fc-back { background: rgba(74,222,128,0.05); border-color: rgba(74,222,128,0.2); transform: rotateY(180deg); }
        .fc-label { font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; color: var(--text-tertiary); }
        .fc-text { font-size: 1.4rem; font-weight: 600; margin: 0; line-height: 1.5; color: var(--text-primary) !important; -webkit-text-fill-color: inherit !important; }
        .fc-hint-text { font-size: 0.82rem; color: var(--text-tertiary); }
        .fc-action-row { display: flex; justify-content: center; gap: 1.5rem; margin-top: 2rem; }
        .fc-btn-review { padding: 0.9rem 2rem; border-radius: 12px; border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); color: #f87171; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .fc-btn-review:hover { background: rgba(239,68,68,0.2); transform: translateY(-2px); }
        .fc-btn-know { padding: 0.9rem 2rem; border-radius: 12px; border: 1px solid rgba(74,222,128,0.3); background: rgba(74,222,128,0.1); color: #4ADE80; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .fc-btn-know:hover { background: rgba(74,222,128,0.2); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}

function Library({ user, setActiveTab, setActiveQuizData }) {
  const [studySets, setStudySets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSet, setActiveSet] = useState(null);
  const [studyMode, setStudyMode] = useState(null); // 'flashcards' or 'quiz'

  useEffect(() => {
    fetchLibrary();
  }, [user]);

  const fetchLibrary = async () => {
    const userId = user?.id || user?._id;
    if (!userId) return;
    
    try {
      const response = await authFetch(`${API_BASE}/api/library/my-sets`);
      if (!response.ok) throw new Error('Failed to fetch library');
      const data = await response.json();
      setStudySets(data);
    } catch (err) {
      console.error(err);
      setError('Could not load your saved study materials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (setId, e) => {
    e.stopPropagation(); // Prevent opening the set when clicking delete
    if (!window.confirm("Are you sure you want to delete this study set?")) return;

    try {
      const response = await authFetch(`${API_BASE}/api/library/${setId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      // Update UI immediately
      setStudySets(studySets.filter(set => set._id !== setId));
      if (activeSet && activeSet._id === setId) {
        setActiveSet(null);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete study set.');
    }
  };

  const handleOpenSet = (set) => {
    setActiveSet(set);
  };

  if (studyMode === 'flashcards' && activeSet) {
    return <FlashcardStudyMode set={activeSet} onBack={() => setStudyMode(null)} />;
  }

  if (activeSet) {
    return (
      <div className="library-container">
        <div className="results-container animate-fade-in" style={{ marginTop: '2rem' }}>
          <div className="results-header">
            <h2><span className="highlight-text">{activeSet.topicName}</span></h2>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} onClick={() => setStudyMode('flashcards')}>
                🎴 Study Flashcards
              </button>
              <button className="btn-primary" onClick={() => {
                if (setActiveQuizData) setActiveQuizData(activeSet);
                setActiveTab('quizzes');
              }}>
                🎮 Play Quiz Now
              </button>
              <button className="btn-secondary" onClick={() => setActiveSet(null)}>← Back</button>
            </div>
          </div>

          <div className="results-grid">
            {/* Flashcards Preview */}
            <div className="glass-card result-section">
              <div className="section-title">
                <h3>🎴 Flashcards ({activeSet.flashcards?.length || 0})</h3>
              </div>
              <div className="preview-list">
                {activeSet.flashcards?.map((card, idx) => (
                  <div key={idx} className="preview-item">
                    <strong>{card.front}</strong>
                    <p>{card.back}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quizzes Preview */}
            <div className="glass-card result-section">
              <div className="section-title">
                <h3>📝 Practice Quiz ({activeSet.quizzes?.length || 0})</h3>
              </div>
              <div className="preview-list">
                {activeSet.quizzes?.map((quiz, idx) => (
                  <div key={idx} className="preview-item">
                    <strong>Q: {quiz.question}</strong>
                    <ul className="quiz-options-mini">
                      {quiz.options.map((opt, i) => (
                        <li key={i} className={i === quiz.correctAnswer ? 'correct-opt' : ''}>
                          {i === quiz.correctAnswer ? '✓ ' : '○ '}{opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
      <div className="library-header">
        <h1>📚 My Study Library</h1>
        <p>All your AI-generated materials saved in one place.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Loading your materials...</p>
        </div>
      ) : studySets.length === 0 ? (
        <div className="empty-library">
          <div className="empty-icon">📂</div>
          <h2>Your library is empty!</h2>
          <p>Head over to the AI Extractor to generate your first study set from a PDF.</p>
          <button className="btn-primary" onClick={() => setActiveTab('generator')}>
            🪄 Go to AI Generator
          </button>
        </div>
      ) : (
        <div className="library-grid">
          {studySets.map((set) => (
            <div key={set._id} className="library-card glass-card" onClick={() => handleOpenSet(set)}>
              <div className="library-card-header">
                <h3>{set.topicName}</h3>
                <button className="btn-delete-icon" onClick={(e) => handleDelete(set._id, e)} title="Delete Set">
                  🗑️
                </button>
              </div>
              <div className="library-card-stats">
                <div className="stat-badge">
                  <span>🎴</span> {set.flashcards?.length || 0} Cards
                </div>
                <div className="stat-badge">
                  <span>📝</span> {set.quizzes?.length || 0} Quizzes
                </div>
              </div>
              <div className="library-card-footer">
                <span className="date-added">Added {new Date(set.createdAt).toLocaleDateString()}</span>
                <span className="view-link">View Deck →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Library;
