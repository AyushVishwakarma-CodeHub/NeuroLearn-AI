import React, { useState, useEffect } from 'react';
import API_BASE, { authFetch } from '../config';
import './AdminDashboard.css';

function AdminDashboard({ user, view = 'stats' }) {
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (view === 'stats') {
      fetchStats();
    } else if (view === 'users') {
      fetchUsers();
    }
  }, [view]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/api/admin/stats`);
      if (!response.ok) throw new Error('Failed to fetch admin stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE}/api/admin/users`);
      if (!response.ok) throw new Error('Failed to fetch user directory');
      const data = await response.json();
      setAllUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Intelligence Sync in Progress...</div>;
  if (error) return <div className="admin-error">⚠️ Error: {error}</div>;

  // View: USER MANAGEMENT
  if (view === 'users') {
    return (
      <div className="admin-container animate-fade-in">
        <div className="admin-header">
          <h1>👥 Student Directory</h1>
          <p>Detailed overview of every learner registered on NeuroLearn AI.</p>
        </div>

        <div className="admin-table-card glass-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Academic Level</th>
                <th>Total XP</th>
                <th>Last Active</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u, i) => (
                <tr key={i}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="lvl-pill">Lvl {u.level || 1}</span></td>
                  <td>⭐ {u.lifetimeXp || 0}</td>
                  <td>{new Date(u.updatedAt || u.createdAt).toLocaleDateString()}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // View: PLATFORM STATS (Default)
  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1>🛠️ System Administrator Portal</h1>
        <p>Real-time overview of NeuroLearn AI platform performance and user growth.</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card glass-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Students</h3>
            <div className="stat-value">{stats.metrics.totalUsers}</div>
            <div className="stat-label">Active learners</div>
          </div>
        </div>
        <div className="admin-stat-card glass-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>Active Topics</h3>
            <div className="stat-value">{stats.metrics.totalTopics}</div>
            <div className="stat-label">Knowledge base size</div>
          </div>
        </div>
        <div className="admin-stat-card glass-card">
          <div className="stat-icon">🧠</div>
          <div className="stat-info">
            <h3>Study Sessions</h3>
            <div className="stat-value">{stats.metrics.totalSessions}</div>
            <div className="stat-label">Successful predictions</div>
          </div>
        </div>
      </div>

      <div className="admin-tables-grid">
        <div className="admin-table-card glass-card">
          <h3>🆕 Recent Student Onboarding</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Joined</th>
                <th>Lvl</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((u, i) => (
                <tr key={i}>
                  <td><strong>{u.username}</strong></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><span className="lvl-pill">Lvl {u.level || 1}</span></td>
                </tr>
              ))}
              {stats.recentUsers.length === 0 && <tr><td colSpan="3">No recent registrations.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="admin-table-card glass-card">
          <h3>📡 Platform Activity Stream</h3>
          <div className="activity-feed">
            {stats.recentActivities.map((act, i) => (
              <div key={i} className="activity-item">
                <div className="act-dot"></div>
                <div className="act-content">
                  <strong>{act.userId?.username || 'Learner'}</strong> studied 
                  <span> {act.topicId?.title || 'a topic'}</span>
                  <div className="act-time">
                    {new Date(act.date).toLocaleTimeString()} · Performance: {act.performanceScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
