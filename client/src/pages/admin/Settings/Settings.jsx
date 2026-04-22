import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import './Settings.css';

export default function Settings() {
  const [profile, setProfile] = useState({ bio: '', email: '', phone: '', location: '', skills: [], social_links: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/profile')
      .then(res => { setProfile(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', profile);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings');
    }
    setSaving(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const key = name.replace('social_', '');
      setProfile({ ...profile, social_links: { ...profile.social_links, [key]: value } });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setProfile({ ...profile, skills });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Update your profile information</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="form-section">
          <h2>Bio</h2>
          <textarea
            name="bio"
            value={profile.bio || ''}
            onChange={handleChange}
            rows="5"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div className="form-section">
          <h2>Contact Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={profile.email || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={profile.phone || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={profile.location || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Skills</h2>
          <input
            type="text"
            value={(profile.skills || []).join(', ')}
            onChange={handleSkillsChange}
            placeholder="JavaScript, React, Node.js, ..."
          />
          <p className="form-hint">Separate skills with commas</p>
        </div>

        <div className="form-section">
          <h2>Social Links</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>GitHub</label>
              <input type="url" name="social_github" value={profile.social_links?.github || ''} onChange={handleChange} placeholder="https://github.com/..." />
            </div>
            <div className="form-group">
              <label>LinkedIn</label>
              <input type="url" name="social_linkedin" value={profile.social_links?.linkedin || ''} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="form-group">
              <label>Twitter</label>
              <input type="url" name="social_twitter" value={profile.social_links?.twitter || ''} onChange={handleChange} placeholder="https://twitter.com/..." />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {message && <span className="message">{message}</span>}
        </div>
      </form>
    </div>
  );
}