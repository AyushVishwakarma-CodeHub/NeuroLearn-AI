import React, { useState } from 'react';
import './LoginPage.css';
import API_BASE from '../config';

const LoginPage = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [form, setForm] = useState({ 
    username: '', email: '', password: '',
    avatar: '/avatars/avatar_abstract.png',
    gender: 'Prefer not to say',
    qualification: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const avatars = [
    '/avatars/avatar_male.png',
    '/avatars/avatar_female.png',
    '/avatars/avatar_robot.png',
    '/avatars/avatar_abstract.png',
  ];

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all credential fields.');
      return;
    }
    setError('');
    setRegisterStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister ? form : { email: form.email, password: form.password };
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (isRegister) {
        setIsRegister(false);
        setRegisterStep(1);
        setError('');
        alert('Account created successfully! Please log in.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (err) {
      setError('Server not reachable. Make sure backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="login-split-page">
      {/* Left Side - Hero Image */}
      <div className="login-hero-side">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Accelerate Your Learning</h1>
          <p>Harness the power of AI to study smarter, remember longer, and achieve your true potential.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-side">
        <div className="login-bg-orb orb-1"></div>
        <div className="login-bg-orb orb-2"></div>
        
        <div className={`login-container glass-card ${isRegister && registerStep === 2 ? 'wide-modal' : ''}`}>
          <div className="login-header">
            <h2>NeuroLearn <span>AI</span></h2>
            <p className="tagline">Welcome back. Let's get to work.</p>
          </div>
          
          {isRegister && registerStep === 2 ? (
            <form onSubmit={handleSubmit} className="register-step-2 animate-fade-in">
              <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.1rem' }}>Choose Your AI Avatar</h3>
              
              <div className="avatar-grid">
                {avatars.map((av, idx) => (
                  <div 
                    key={idx} 
                    className={`avatar-option ${form.avatar === av ? 'selected' : ''}`}
                    onClick={() => setForm({...form, avatar: av})}
                  >
                    <img src={av} alt={`Avatar ${idx}`} />
                  </div>
                ))}
              </div>

              <div className="input-group" style={{ marginTop: '1.5rem' }}>
                <label>Gender</label>
                <select 
                  value={form.gender}
                  onChange={(e) => setForm({...form, gender: e.target.value})}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="input-group">
                <label>Highest Qualification</label>
                <select 
                  value={form.qualification}
                  onChange={(e) => setForm({...form, qualification: e.target.value})}
                >
                  <option value="">Select Qualification</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Professional">Professional</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="input-group">
                <label>Short Bio (Optional)</label>
                <textarea 
                  placeholder="What are your learning goals?"
                  value={form.bio}
                  onChange={(e) => setForm({...form, bio: e.target.value})}
                  rows="2"
                />
              </div>

              {error && <p className="error-msg">{error}</p>}
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setRegisterStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Creating...' : 'Complete Profile & Register'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={isRegister ? handleNextStep : handleSubmit} className="animate-fade-in">
              {isRegister && (
                <div className="input-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                    required
                  />
                </div>
              )}
              
              <div className="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required
                />
              </div>

              {error && <p className="error-msg">{error}</p>}
              
              <button type="submit" className="btn-primary login-btn" disabled={loading}>
                {loading ? 'Please wait...' : (isRegister ? 'Next Step: Setup Profile' : 'Sign In')}
              </button>
            </form>
          )}
          
          <p className="toggle-text">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span onClick={() => { setIsRegister(!isRegister); setRegisterStep(1); setError(''); }}>
              {isRegister ? 'Sign In' : 'Create one'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
