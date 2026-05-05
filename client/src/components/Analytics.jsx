import React, { useState, useEffect, useMemo } from 'react';
import API_BASE, { authFetch } from '../config';
import './Analytics.css';

function Analytics({ user, topics }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      authFetch(`${API_BASE}/api/study/history`)
        .then(res => res.json())
        .then(data => {
          setHistory(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch history', err);
          setLoading(false);
        });
    }
  }, [user]);

  // Data processing for charts
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    // 1. Performance over time (Sparkline)
    const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sparklineData = sortedHistory.map(s => s.performanceScore);

    // 2. Score Distribution (Pie/Bar)
    const distribution = { excellent: 0, good: 0, average: 0, poor: 0 };
    history.forEach(s => {
      if (s.performanceScore >= 85) distribution.excellent++;
      else if (s.performanceScore >= 70) distribution.good++;
      else if (s.performanceScore >= 50) distribution.average++;
      else distribution.poor++;
    });

    // 3. Most Studied Topics
    const topicCounts = {};
    history.forEach(s => {
      const name = s.topicId?.title || 'Unknown';
      topicCounts[name] = (topicCounts[name] || 0) + 1;
    });
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { sparklineData, distribution, topTopics };
  }, [history]);

  if (loading) return <div className="loader">Loading Analytics...</div>;

  return (
    <div className="analytics-container animate-fade-in">
      <div className="analytics-grid">
        
        {/* Performance Trend Card */}
        <div className="glass-card chart-card trend-card">
          <div className="card-header">
            <h3>📈 Performance Trend</h3>
            <p>Score progress over last {history.length} sessions</p>
          </div>
          <div className="sparkline-container">
            {stats && stats.sparklineData.length > 1 ? (
              <svg viewBox="0 0 400 100" className="sparkline">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  className="sparkline-area"
                  d={`M 0 100 ${stats.sparklineData.map((s, i) => 
                    `L ${(i / (stats.sparklineData.length - 1)) * 400} ${100 - s}`
                  ).join(' ')} L 400 100 Z`}
                  fill="url(#gradient)"
                />
                <path
                  className="sparkline-path"
                  d={`M 0 ${100 - stats.sparklineData[0]} ${stats.sparklineData.map((s, i) => 
                    `L ${(i / (stats.sparklineData.length - 1)) * 400} ${100 - s}`
                  ).join(' ')}`}
                />
              </svg>
            ) : (
              <div className="empty-chart">Not enough data to show trends</div>
            )}
          </div>
        </div>

        {/* Score Distribution Card */}
        <div className="glass-card chart-card dist-card">
          <div className="card-header">
            <h3>🎯 Score Distribution</h3>
            <p>Accuracy levels across all quizzes</p>
          </div>
          <div className="dist-bars">
            {stats ? Object.entries(stats.distribution).map(([key, val]) => {
              const colors = { excellent: '#10b981', good: '#6366f1', average: '#f59e0b', poor: '#ef4444' };
              const percentage = history.length > 0 ? (val / history.length) * 100 : 0;
              return (
                <div key={key} className="dist-item">
                  <div className="dist-label">
                    <span className="label-text">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="label-val">{Math.round(percentage)}%</span>
                  </div>
                  <div className="dist-track">
                    <div className="dist-fill" style={{ width: `${percentage}%`, background: colors[key] }} />
                  </div>
                </div>
              );
            }) : <p>No history yet</p>}
          </div>
        </div>

        {/* Top Topics Card */}
        <div className="glass-card chart-card topics-card">
          <div className="card-header">
            <h3>🔥 Focus Areas</h3>
            <p>Your most frequently studied topics</p>
          </div>
          <div className="topic-ranks">
            {stats && stats.topTopics.length > 0 ? stats.topTopics.map(([name, count], i) => (
              <div key={i} className="rank-item">
                <span className="rank-num">#{i+1}</span>
                <span className="rank-name">{name}</span>
                <span className="rank-count">{count} sessions</span>
              </div>
            )) : <p>No data</p>}
          </div>
        </div>

        {/* Detailed History Table */}
        <div className="glass-card history-card">
          <div className="card-header">
            <h3>📋 Detailed Log</h3>
            <p>Full history of your study efforts</p>
          </div>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s, i) => (
                  <tr key={i}>
                    <td><strong>{s.topicId?.title || 'Unknown'}</strong></td>
                    <td>{new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    <td>
                      <div className="score-pill" style={{ background: s.performanceScore >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.performanceScore >= 70 ? '#10b981' : '#f87171' }}>
                        {s.performanceScore}%
                      </div>
                    </td>
                    <td>{s.performanceScore >= 80 ? '✅ Proficient' : s.performanceScore >= 50 ? '⚠️ Improving' : '❌ Needs Review'}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No study sessions logged yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;
