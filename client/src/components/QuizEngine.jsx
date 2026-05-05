import React, { useState, useEffect } from 'react';
import API_BASE, { authFetch } from '../config';

const QuizEngine = ({ user, setGamification, activeQuizData, setActiveQuizData, revisionTopic, setRevisionTopic, onStudySaved }) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState([]);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [quizError, setQuizError] = useState('');

  useEffect(() => {
    if (activeQuizData) {
      setTopic(activeQuizData.topicName);
      const formattedQuiz = activeQuizData.quizzes.map(q => ({
        question: q.question,
        options: q.options,
        answer: q.correctAnswer !== undefined ? q.correctAnswer : q.answer
      }));
      setQuiz(formattedQuiz);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setScore(0);
      setQuizComplete(false);
      setXpEarned(0);
      setWrongAnswers([]);
      setIsRevisionMode(false);
      if (setActiveQuizData) setActiveQuizData(null);
    }
  }, [activeQuizData, setActiveQuizData]);

  // Auto-start when a revision topic is passed from the dashboard
  useEffect(() => {
    if (revisionTopic) {
      setTopic(revisionTopic);
      setIsRevisionMode(true);
      setQuizStarted(false);
      setQuizComplete(false);
      setScore(0);
      setCurrentQuestion(0);
      setXpEarned(0);
      setWrongAnswers([]);
      if (setRevisionTopic) setRevisionTopic(null);
      // Trigger auto-start
      startQuizForTopic(revisionTopic);
    }
  }, [revisionTopic]);

  const startQuizForTopic = async (topicName) => {
    setLoading(true);
    setQuizError('');
    try {
      const res = await authFetch(`${API_BASE}/api/analytics/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicName })
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuiz(data.questions);
        setQuizStarted(true);
      } else {
        setQuizError('Could not generate quiz for this topic. Please click "Generate Quiz" below to try again.');
      }
    } catch (err) {
      setQuizError('Server error. Make sure the backend is running, then try again.');
    }
    setLoading(false);
  };

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setQuizError('');
    
    try {
      const res = await authFetch(`${API_BASE}/api/analytics/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      
      const data = await res.json();
      
      if (data.questions && data.questions.length > 0) {
        setQuiz(data.questions);
        setQuizStarted(true);
        setCurrentQuestion(0);
        setScore(0);
        setQuizComplete(false);
        setXpEarned(0);
        setWrongAnswers([]);
      } else {
        setQuizError('Could not generate quiz. The AI may be busy — please try again.');
      }
    } catch (err) {
      setQuizError('Server error. Make sure the backend is running on port 5000.');
    }
    setLoading(false);
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);
    
    const isCorrect = index === quiz[currentQuestion].answer;
    if (isCorrect) {
      setScore(score + 1);
    } else {
      setWrongAnswers(prev => [...prev, quiz[currentQuestion]]);
    }

    setTimeout(async () => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
        
        if (user) {
          // 0. Auto-create Flashcards for wrong answers
          const finalWrongAnswers = isCorrect ? wrongAnswers : [...wrongAnswers, quiz[currentQuestion]];
          
          if (finalWrongAnswers.length > 0) {
            finalWrongAnswers.forEach(async (wq) => {
              try {
                await authFetch(`${API_BASE}/api/flashcards`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    topicName: topic,
                    question: wq.question,
                    answer: wq.options[wq.answer]
                  })
                });
              } catch(e) { console.error('Failed saving flashcard', e); }
            });
          }

          // 1. Post to Study Log for ML Tracking
          const finalScore = score + (index === quiz[currentQuestion].answer ? 1 : 0);
          const scorePercent = Math.round((finalScore / quiz.length) * 100);
          try {
            await authFetch(`${API_BASE}/api/study/log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ topicName: topic, score: scorePercent, duration: 5 })
            });
            // Notify App.jsx to refresh dashboard data immediately
            if (onStudySaved) onStudySaved();
          } catch(e) { console.error('Study log failed', e); }

          // 2. Post Gamification XP — use revision_completed if in revision mode
          if (setGamification) {
            try {
              const xpAction = isRevisionMode ? 'revision_completed' : 'quiz_completed';
              const res = await authFetch(`${API_BASE}/api/gamification/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: xpAction })
              });
              const data = await res.json();
              if (data.xpGranted) {
                 setXpEarned(data.xpGranted);
                 setGamification(prev => ({
                   ...prev,
                   xp: data.totalXp,
                   lifetimeXp: data.lifetimeXp,
                   level: data.level,
                   streak: data.streak,
                   achievements: prev ? prev.achievements.concat(data.newAchievements.map(name => ({name, unlockedAt: new Date()}))) : []
                 }));
              }
            } catch(e) { console.error('Gamification hook failed', e); }
          }
        }
      }
    }, 1500);
  };

  const getScoreEmoji = () => {
    const pct = (score / quiz.length) * 100;
    if (pct >= 80) return '🏆';
    if (pct >= 60) return '👍';
    if (pct >= 40) return '📖';
    return '💪';
  };

  return (
    <div className="glass-card quiz-container">
      {!quizStarted ? (
        <div className="quiz-start">
          <div className="quiz-icon">🧠</div>
          {isRevisionMode && topic && (
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '0.3rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                🔄 Revision Mode: {topic}
              </span>
            </div>
          )}
          <h3>AI-Powered Quiz Generator</h3>
          <p>Enter any topic and our AI will create a personalized quiz to test your knowledge.</p>
          {quizError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '0.85rem 1.2rem', borderRadius: '12px', fontSize: '0.88rem', margin: '0.75rem 0', textAlign: 'left' }}>
              ⚠️ {quizError}
            </div>
          )}
          <div className="quiz-input-area">
            <input 
              type="text"
              placeholder="Enter a topic (e.g., Quantum Physics, React Hooks...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && startQuiz()}
            />
            <button className="btn-primary" onClick={startQuiz} disabled={loading || !topic.trim()}>
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
          <div className="quick-topics">
            <span className="quick-label">Quick picks:</span>
            {['Neural Networks', 'Data Structures', 'React Hooks', 'Quantum Physics'].map(t => (
              <button key={t} className="quick-btn" onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
        </div>
      ) : quizComplete ? (
        <div className="quiz-complete">
          <div className="score-emoji">{getScoreEmoji()}</div>
          <h3>Quiz Complete!</h3>
          <div className="final-score">
            <span className="score-num">{score}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{quiz.length}</span>
          </div>
          <p className="score-msg">
            {score === quiz.length ? 'Perfect score! You have mastered this topic!' :
             score >= quiz.length * 0.6 ? 'Great job! You have a solid understanding.' :
             'Keep studying! Review this topic and try again.'}
          </p>
          {xpEarned > 0 && <p className="xp-earned">⭐ +{xpEarned} XP Earned!</p>}
          <div className="quiz-actions">
            <button className="btn-primary" onClick={() => { setQuizStarted(false); setTopic(''); }}>New Quiz</button>
            <button className="btn-secondary" onClick={() => { setCurrentQuestion(0); setScore(0); setQuizComplete(false); setSelectedAnswer(null); setShowResult(false); }}>Retry</button>
          </div>
        </div>
      ) : (
        <div className="quiz-active">
          <div className="quiz-header">
            <div className="progress-info">
              <span>Question {currentQuestion + 1} of {quiz.length}</span>
              <span className="score-live">Score: {score}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}></div>
            </div>
          </div>
          <h4 className="question-text">{quiz[currentQuestion].question}</h4>
          <div className="options-grid">
            {quiz[currentQuestion].options.map((opt, i) => {
              let className = 'option-btn';
              if (showResult) {
                if (i === quiz[currentQuestion].answer) className += ' correct';
                else if (i === selectedAnswer) className += ' wrong';
              }
              return (
                <button key={i} className={className} onClick={() => handleAnswer(i)} disabled={selectedAnswer !== null}>
                  <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span className="opt-text">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <style>{`
        .quiz-container { padding: 2.5rem; min-height: 500px; display: flex; align-items: center; justify-content: center; }
        
        .quiz-start { text-align: center; width: 100%; max-width: 600px; }
        .quiz-icon { font-size: 3rem; margin-bottom: 1rem; }
        .quiz-start h3 { font-size: 1.8rem; margin-bottom: 0.5rem; }
        .quiz-start p { color: var(--text-secondary); margin-bottom: 2rem; }
        .quiz-input-area { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .quiz-input-area input { flex-grow: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 0.9rem 1rem; border-radius: 12px; color: white; outline: none; font-size: 1rem; }
        .quiz-input-area input:focus { border-color: var(--accent-primary); }
        .quiz-input-area input::placeholder { color: rgba(148,163,184,0.5); }
        .quick-topics { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
        .quick-label { color: var(--text-secondary); font-size: 0.85rem; }
        .quick-btn { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.3); color: var(--accent-primary); padding: 0.4rem 0.8rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: var(--transition); }
        .quick-btn:hover { background: rgba(99,102,241,0.2); }
        
        .quiz-active { width: 100%; }
        .quiz-header { margin-bottom: 2rem; }
        .progress-info { display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; }
        .score-live { color: var(--accent-primary); font-weight: 600; }
        .progress-bar { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary)); border-radius: 10px; transition: width 0.5s ease; }
        .question-text { font-size: 1.3rem; margin-bottom: 2rem; color: white !important; -webkit-text-fill-color: white !important; line-height: 1.5; }
        .options-grid { display: grid; grid-template-columns: 1fr; gap: 0.8rem; }
        .option-btn { display: flex; align-items: center; gap: 1rem; padding: 1.2rem; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 14px; color: var(--text-primary); cursor: pointer; font-size: 1rem; text-align: left; transition: var(--transition); }
        .option-btn:hover:not(:disabled) { border-color: var(--accent-primary); background: rgba(99,102,241,0.1); }
        .opt-letter { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: rgba(255,255,255,0.05); font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
        .opt-text { flex-grow: 1; }
        .option-btn.correct { border-color: #22c55e !important; background: rgba(34,197,94,0.15) !important; }
        .option-btn.correct .opt-letter { background: #22c55e; color: white; }
        .option-btn.wrong { border-color: #ef4444 !important; background: rgba(239,68,68,0.15) !important; }
        .option-btn.wrong .opt-letter { background: #ef4444; color: white; }
        
        .quiz-complete { text-align: center; }
        .score-emoji { font-size: 4rem; margin-bottom: 1rem; }
        .quiz-complete h3 { font-size: 2rem; margin-bottom: 1rem; }
        .final-score { font-size: 3rem; font-weight: 800; margin: 1.5rem 0; }
        .score-num { color: var(--accent-primary); }
        .score-divider { color: var(--text-secondary); margin: 0 0.3rem; }
        .score-total { color: var(--text-secondary); }
        .score-msg { color: var(--text-secondary); font-size: 1.1rem; margin-bottom: 1rem; }
        .xp-earned { color: var(--accent-secondary); font-size: 1.5rem; font-weight: bold; margin-bottom: 2rem; animation: slideDown 0.3s ease; }
        .quiz-actions { display: flex; gap: 1rem; justify-content: center; }
      `}</style>
    </div>
  );
};

export default QuizEngine;
