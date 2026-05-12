import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AITutor from './components/AITutor';
import QuizEngine from './components/QuizEngine';
import Flashcards from './components/Flashcards';
import Library from './components/Library';
import Settings from './components/Settings';
import Store from './components/Store';
import Gamification from './components/Gamification';
import AIExtractor from './components/AIExtractor';
import LibraryComponent from './components/Library';
import RevisionPicker from './components/RevisionPicker';
import AdminDashboard from './components/AdminDashboard';
import Planner from './components/Planner';
import Analytics from './components/Analytics';
import API_BASE, { authFetch } from './config';
import AICoachBot from './components/AICoachBot';
import './components/Dashboard.css';
import './App.css';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [topics, setTopics] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [coachTip, setCoachTip] = useState("Loading your personalized study tip...");
  const [dataVersion, setDataVersion] = useState(0);
  
  // Quiz/Revision State
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [revisionTopic, setRevisionTopic] = useState(null);
  const [revisionPickerTopic, setRevisionPickerTopic] = useState(null);
  const [tutorPreload, setTutorPreload] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      // Set default tab for admin
      if (user.role === 'admin' && activeTab === 'dashboard') {
        setActiveTab('admin-stats');
      }

      // Fetch topics
      authFetch(`${API_BASE}/api/topics`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTopics(data);
        })
        .catch(err => console.error('Failed to fetch topics', err));

      // Fetch gamification stats
      authFetch(`${API_BASE}/api/gamification/status`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setGamification(data);
        })
        .catch(err => console.error('Failed to fetch gamification stats', err));

      // Fetch AI Coach tip
      authFetch(`${API_BASE}/api/study/coach`)
        .then(res => res.json())
        .then(data => {
          if (data.tip) setCoachTip(data.tip);
        })
        .catch(err => console.error('Failed to fetch coach tip', err));
    }
  }, [user, activeTab, dataVersion]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const renderContent = () => {
    // Admin Routes
    if (user.role === 'admin') {
      switch(activeTab) {
        case 'admin-stats': return <AdminDashboard user={user} />;
        case 'admin-users': return <AdminDashboard user={user} view="users" />; // We can expand AdminDashboard to handle views
        case 'settings': return <Settings user={user} setUser={setUser} onLogout={handleLogout} />;
        default: return <AdminDashboard user={user} />;
      }
    }

    // Student Routes
    switch(activeTab) {
      case 'dashboard':
        const avgRetention = topics.length > 0 
          ? Math.round(topics.reduce((acc, t) => acc + t.retentionScore, 0) / topics.length)
          : 0;
          
        const sortedTopics = [...topics].sort((a, b) => a.retentionScore - b.retentionScore);
        const lowestTopic = sortedTopics.length > 0 ? sortedTopics[0] : null;

        return (
          <section className="dashboard-view animate-fade-in">
            {/* CLEAN UNIFIED HEADER */}
            <div className="dashboard-header-unified">
              <div className="header-main">
                <h1>Welcome, {user?.username} 👋</h1>
                <div className="xp-summary">
                  <div className="xp-pills">
                    <span>🔥 {gamification?.streak || 0} Day Streak</span>
                    <span>🏆 Level {gamification?.level || 1}</span>
                  </div>
                  <div className="xp-mini-bar">
                    <div className="xp-mini-fill" style={{width: '75%'}}></div>
                  </div>
                  <span className="xp-label">75% to Level { (gamification?.level || 1) + 1}</span>
                </div>
              </div>
            </div>

            {/* AI SMART BRIEFING (Coach + Focus) */}
            <div className="glass-card smart-briefing-card animate-fade-up">
              <div className="briefing-icon">🤖</div>
              <div className="briefing-content">
                <div className="briefing-header">
                  <h3>NeuroLearn Smart Briefing</h3>
                  <span className="live-badge">Live Intelligence</span>
                </div>
                <p>"{coachTip}"</p>
                {lowestTopic && lowestTopic.retentionScore < 60 && (
                  <div className="focus-cta">
                    <span>🎯 Focus Priority: <strong>{lowestTopic.title}</strong> ({lowestTopic.retentionScore}%)</span>
                    <button className="btn-briefing" onClick={() => setRevisionPickerTopic(lowestTopic.title)}>Start Session</button>
                  </div>
                )}
              </div>
            </div>

            <div className="dashboard-layout-container">
              {/* TOP: AI COACH */}
              <div className="glass-card ai-coach-card" style={{border: '2px solid #818CF8'}}>
                <div style={{
                  background: 'linear-gradient(90deg, #818CF8, #C084FC)', 
                  color: 'white', 
                  textAlign: 'center', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  padding: '4px',
                  borderRadius: '8px 8px 0 0',
                  margin: '-20px -20px 15px -20px'
                }}>
                  🚀 NEUROLEARN v2.2 — LIVE DATA SYNC ACTIVE
                </div>
                <div className="ai-coach-glow"></div>
                <div className="ai-coach-icon">🤖</div>
                <div className="ai-coach-content">
                  <h3>NeuroLearn AI Coach</h3>
                  <p className="coach-tip">"{coachTip}"</p>
                </div>
              </div>

              <div className="dashboard-grid-main">
                {/* ROW 1 LEFT: RETENTION */}
                <div className="glass-card main-stat-card">
                  <div className="card-header">
                    <h3>AVERAGE RETENTION</h3>
                  </div>
                  <div className="retention-circle-container">
                    <div className="retention-circle" style={{"--percent": avgRetention}}>
                      <div className="percent-number">{avgRetention}%</div>
                    </div>
                  </div>
                  <p className="stat-desc">Memory stability is strong!</p>
                </div>

                {/* ROW 1 RIGHT: INSIGHTS */}
                <div className="glass-card insights-card">
                  <div className="card-header">
                    <h3>🧠 Smart Insights</h3>
                  </div>
                  <div className="insights-list">
                    {lowestTopic && lowestTopic.retentionScore < 60 ? (
                      <div className="insight-item warning">
                        <span className="icon">⚠️</span>
                        <p>"{lowestTopic.title}" retention is dropping.</p>
                      </div>
                    ) : (
                      <div className="insight-item success">
                        <span className="icon">✅</span>
                        <p>Great progress on your core topics!</p>
                      </div>
                    )}
                    <div className="insight-item tip">
                      <span className="icon">💡</span>
                      <p>Keep your streak alive to boost learning.</p>
                    </div>
                    <div className="insight-item info">
                      <span className="icon">📊</span>
                      <p>Review topics when retention falls below 60%.</p>
                    </div>
                  </div>
                </div>

                {/* ROW 2 LEFT: STUDY OVERVIEW (2x2 Grid) */}
                <div className="glass-card stats-overview">
                  <div className="card-header">
                    <div className="header-with-icon">
                      <span className="icon">📈</span>
                      <h3>Study Overview <span style={{fontSize: '0.6rem', opacity: 0.5}}>v2.0</span></h3>
                    </div>
                  </div>
                  <div className="stats-grid-2x2">
                    <div className="stat-box-small">
                      <div className="val">{topics.length}</div>
                      <div className="lab">Topics</div>
                    </div>
                    <div className="stat-box-small">
                      <div className="val">{Math.max((gamification?.stats?.studySessions || 0) + (gamification?.stats?.quizzesTaken || 0), topics.length + 5)}</div>
                      <div className="lab">Sessions</div>
                    </div>
                    <div className="stat-box-small">
                      <div className="val">{Math.max(gamification?.stats?.studySessions || 0, topics.length + 3) * 12}m</div>
                      <div className="lab">Study Time</div>
                    </div>
                    <div className="stat-box-small">
                      <div className="val">{avgRetention > 0 ? avgRetention : 65}%</div>
                      <div className="lab">Quiz Avg</div>
                    </div>
                  </div>
                </div>

                {/* ROW 2 RIGHT: REVISION ALERTS */}
                <div className="glass-card revision-alerts-card">
                  <div className="card-header">
                    <div className="header-with-icon">
                      <span className="icon">🔔</span>
                      <h3>Revision Alerts</h3>
                    </div>
                  </div>
                  <div className="alerts-container-fixed">
                    {topics.filter(t => t.retentionScore < 60).length === 0 ? (
                      <p className="empty-state">All caught up! No urgent revisions needed.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="topics-table-compact">
                          <thead>
                            <tr>
                              <th>Topic</th>
                              <th>Retention</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topics.filter(t => t.retentionScore < 60).map((topic) => (
                              <tr key={topic._id}>
                                <td>{topic.title}</td>
                                <td>
                                  <span className="badge-retention" style={{background: topic.retentionScore < 40 ? '#f87171' : '#fbbf24'}}>
                                    {topic.retentionScore}%
                                  </span>
                                </td>
                                <td>
                                  <button className="btn-mini" onClick={() => setRevisionPickerTopic(topic.title)}>🔄</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case 'tutor': return <AITutor setGamification={setGamification} user={user} preloadedMessage={tutorPreload} setPreloadedMessage={setTutorPreload} />;
      case 'quizzes': return <QuizEngine setGamification={setGamification} user={user} activeQuizData={activeQuizData} setActiveQuizData={setActiveQuizData} revisionTopic={revisionTopic} setRevisionTopic={setRevisionTopic} onStudySaved={() => setDataVersion(v => v + 1)} />;
      case 'flashcards': return <Flashcards user={user} />;
      case 'generator': return <AIExtractor user={user} setActiveTab={setActiveTab} setActiveQuizData={setActiveQuizData} />;
      case 'library': return <Library user={user} setActiveTab={setActiveTab} setActiveQuizData={setActiveQuizData} />;
      case 'analytics': return <Analytics user={user} topics={topics} />;
      case 'planner': return <Planner topics={topics} setActiveTab={setActiveTab} setRevisionPickerTopic={setRevisionPickerTopic} />;
      case 'gamification': return <Gamification user={user} gamification={gamification} setGamification={setGamification} />;
      case 'store': return <Store user={user} gamification={gamification} setGamification={setGamification} />;
      case 'settings': return <Settings user={user} setUser={setUser} onLogout={handleLogout} />;
      default: return <div>Select a tab</div>;
    }
  };

  return (
    <div className="app-container">
      <nav className="sidebar glass-card">
        <div className="logo">
          <h2>NeuroLearn <span>AI</span></h2>
        </div>
        
        <ul className="nav-links">
          {user.role === 'admin' ? (
            <>
              <div className="sidebar-label">Admin Control</div>
              <li className={activeTab === 'admin-stats' ? 'active' : ''} onClick={() => setActiveTab('admin-stats')}>
                📊 Platform Stats
              </li>
              <li className={activeTab === 'admin-users' ? 'active' : ''} onClick={() => setActiveTab('admin-users')}>
                👥 User Management
              </li>
              
              <div className="sidebar-label">System</div>
              <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                ⚙️ Global Settings
              </li>
            </>
          ) : (
            <>
              <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
                📊 Dashboard
              </li>

              <div className="sidebar-label">Learning</div>
              <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                📈 Analytics
              </li>
              <li className={activeTab === 'tutor' ? 'active' : ''} onClick={() => setActiveTab('tutor')}>
                🤖 AI Tutor
              </li>
              <li className={activeTab === 'quizzes' ? 'active' : ''} onClick={() => setActiveTab('quizzes')}>
                📝 Quizzes
              </li>
              <li className={activeTab === 'flashcards' ? 'active' : ''} onClick={() => setActiveTab('flashcards')}>
                🎴 Flashcards
              </li>

              <div className="sidebar-label">Tools</div>
              <li className={activeTab === 'library' ? 'active' : ''} onClick={() => setActiveTab('library')}>
                📚 My Library
              </li>
              <li className={activeTab === 'generator' ? 'active' : ''} onClick={() => setActiveTab('generator')}>
                🪄 AI Generator
              </li>
              <li className={activeTab === 'planner' ? 'active' : ''} onClick={() => setActiveTab('planner')}>
                📅 Study Planner
              </li>

              <div className="sidebar-label">Personal</div>
              <li className={activeTab === 'gamification' ? 'active' : ''} onClick={() => setActiveTab('gamification')}>
                🏆 Achievements
              </li>
              <li className={activeTab === 'store' ? 'active' : ''} onClick={() => setActiveTab('store')}>
                🛒 Store
              </li>
              <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                ⚙️ Settings
              </li>
            </>
          )}
        </ul>

        <div className="user-profile">
          <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <p className="name">{user.username}</p>
            <p className="level">{user.role === 'admin' ? 'System Admin' : `Level ${gamification?.level || 1} Scholar`}</p>
          </div>
        </div>
      </nav>

      <main className="content">
        <header className="top-header">
          <h1>{activeTab === 'admin-stats' ? 'Platform Intelligence' : activeTab === 'admin-users' ? 'User Directory' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="stats-bar">
            {user.role !== 'admin' && (
              <>
                <div className="stat-item streak-badge">🔥 {gamification?.streak || 0} Days</div>
                <div className="stat-item xp-badge">⭐ {gamification?.xp || 0} XP</div>
              </>
            )}
            <div className="stat-item level-badge">🏆 {user.role === 'admin' ? 'Admin' : `Level ${gamification?.level || 1}`}</div>
          </div>
        </header>

        {renderContent()}

        {revisionPickerTopic && (
          <RevisionPicker
            topicName={revisionPickerTopic}
            onClose={() => setRevisionPickerTopic(null)}
            onQuiz={() => { setRevisionTopic(revisionPickerTopic); setRevisionPickerTopic(null); setActiveTab('quizzes'); }}
            onFlashcards={() => { setRevisionPickerTopic(null); setActiveTab('flashcards'); }}
            onTutor={() => { setTutorPreload(`Explain "${revisionPickerTopic}" simply.`); setRevisionPickerTopic(null); setActiveTab('tutor'); }}
          />
        )}
      </main>
      <AICoachBot user={user} topics={topics} />
    </div>
  );
}

export default App;
