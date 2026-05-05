import React, { useState, useEffect } from 'react';
import API_BASE, { authFetch } from '../config';
import './Gamification.css';

function Gamification({ user, gamification, setGamification }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    authFetch(`${API_BASE}/api/gamification/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeaderboard(data);
      })
      .catch(err => console.error('Failed to load leaderboard', err));
  }, []);

  if (!gamification) {
    return <div className="glass-card" style={{ padding: '2rem' }}>Loading gamification data...</div>;
  }

  const { lifetimeXp, level, achievements, levelThresholds } = gamification;

  const currentLevelMin = levelThresholds[level] || 0;
  const nextLevelMin = levelThresholds[level + 1] || currentLevelMin + 1000;
  
  const progressPercent = Math.min(100, Math.max(0, ((lifetimeXp - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100));

  return (
    <div className="gamification-container">
      {/* Level Progress */}
      <div className="glass-card gami-level-card">
        <div className="level-header">
          <h3>Level {level}</h3>
          <span>{lifetimeXp} / {nextLevelMin} XP to Level {level + 1}</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="gami-grid">
        {/* Achievements */}
        <div className="glass-card gami-achievements">
          <h3>🏆 Achievements</h3>
          {achievements && achievements.length > 0 ? (
            <div className="achievements-list">
              {achievements.map((ach, idx) => (
                <div key={idx} className="achievement-badge">
                  <span className="ach-icon">🌟</span>
                  <div className="ach-details">
                    <strong>{ach.name}</strong>
                    <small>{new Date(ach.unlockedAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">Complete study sessions and quizzes to earn achievements!</p>
          )}
        </div>

        {/* Info card directing to store */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>Rewards Store</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Visit the new dedicated Store tab to spend your XP on digital perks and exclusive NeuroLearn merchandise.</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-card gami-leaderboard">
        <h3>🌍 Global Leaderboard</h3>
        <div style={{ marginTop: '1rem' }}>
          {leaderboard.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Level</th>
                  <th>Total XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((lbUser, idx) => (
                  <tr key={lbUser._id} className={user.username === lbUser.username ? 'highlight-row' : ''}>
                    <td className={`rank rank-${idx + 1}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td style={{ fontWeight: '500' }}>{lbUser.username} {user.username === lbUser.username && <span className="you-badge">(You)</span>}</td>
                    <td><span className="tag medium">Lvl {lbUser.level}</span></td>
                    <td style={{ color: 'var(--accent-primary)' }}>⭐ {lbUser.lifetimeXp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">Loading leaderboard...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Gamification;
