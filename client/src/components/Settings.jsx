import React, { useState } from 'react';
import API_BASE, { authFetch } from '../config';
import './Settings.css';

function Settings({ user, setUser, onLogout }) {
  const [formData, setFormData] = useState({
    avatar: user.avatar || '/avatars/avatar_abstract.png',
    gender: user.gender || 'Prefer not to say',
    qualification: user.qualification || '',
    bio: user.bio || '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  const avatars = [
    '/avatars/avatar_male.png',
    '/avatars/avatar_female.png',
    '/avatars/avatar_robot.png',
    '/avatars/avatar_abstract.png',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatarUrl) => {
    setFormData({ ...formData, avatar: avatarUrl });
    setAvatarModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await authFetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData
        })
      });

      const updatedUser = await response.json();
      
      if (response.ok) {
        // Update local storage and state
        const newUserData = { 
          id: updatedUser._id, 
          username: updatedUser.username, 
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          gender: updatedUser.gender,
          qualification: updatedUser.qualification,
          bio: updatedUser.bio
        };
        
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
        setMessage('🎉 Profile updated successfully!');
      } else {
        setMessage(`❌ Error: ${updatedUser.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Failed to save profile.');
    }
    
    setLoading(false);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="settings-container">
      {message && <div className="settings-toast">{message}</div>}

      <div className="glass-card settings-card">
        <div className="settings-header">
          <h2>Profile Settings</h2>
          <p>Update your personal details and customize your AI Avatar.</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* Avatar Section */}
          <div className="form-section avatar-section">
            <div className="avatar-preview-wrapper">
              <img src={formData.avatar} alt="Profile Avatar" className="avatar-preview-lg" />
              <button 
                type="button" 
                className="btn-edit-avatar"
                onClick={() => setAvatarModalOpen(true)}
              >
                ✏️ Change Avatar
              </button>
            </div>
            
            <div className="account-summary">
              <h3>{user.username}</h3>
              <p>{user.email}</p>
            </div>
          </div>

          <hr className="settings-divider" />

          {/* Details Section */}
          <div className="form-grid">
            <div className="form-group">
              <label>Username (Read Only)</label>
              <input type="text" value={user.username} readOnly className="input-readonly" />
            </div>

            <div className="form-group">
              <label>Email Address (Read Only)</label>
              <input type="email" value={user.email} readOnly className="input-readonly" />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label>Highest Qualification</label>
              <select name="qualification" value={formData.qualification} onChange={handleChange}>
                <option value="">Select Qualification</option>
                <option value="High School">High School</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Professional">Professional</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Short Bio</label>
              <textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us a little about your learning goals..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="btn-danger" onClick={() => {
              localStorage.removeItem('token');
              onLogout();
            }}>
              Logout
            </button>
          </div>
        </form>
      </div>

      {/* Avatar Selection Modal */}
      {avatarModalOpen && (
        <div className="modal-overlay" onClick={() => setAvatarModalOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select your AI Avatar</h3>
              <button className="btn-close" onClick={() => setAvatarModalOpen(false)}>✕</button>
            </div>
            <div className="avatar-grid">
              {avatars.map((av, idx) => (
                <div 
                  key={idx} 
                  className={`avatar-option ${formData.avatar === av ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(av)}
                >
                  <img src={av} alt={`Avatar ${idx}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
