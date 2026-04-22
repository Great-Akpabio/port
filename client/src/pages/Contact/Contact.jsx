import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/messages', formData);
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactEmail = profile?.email || 'your@email.com';
  const contactPhone = profile?.phone || '+1 234 567 8900';
  const contactLocation = profile?.location || 'City, Country';
  const socialLinks = profile?.social_links || {};

  return (
    <section className="contact section">
      <div className="container">
        <h2 className="section-title text-center fade-in">Get In Touch</h2>
        <p className="section-subtitle text-center fade-in">
          Have a question or want to work together? Let's connect.
        </p>
        
        <div className="contact-grid">
          <div className="contact-info fade-in">
            <div className="contact-card">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <h4>Email</h4>
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📱</span>
                <div>
                  <h4>Phone</h4>
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`}>{contactPhone}</a>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>Location</h4>
                  <p>{contactLocation}</p>
                </div>
              </div>
            </div>
            
            <div className="social-links">
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="GitHub">GitHub</a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">LinkedIn</a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">Twitter</a>
              )}
              {!socialLinks.github && !socialLinks.linkedin && !socialLinks.twitter && (
                <>
                  <span className="social-link">GitHub</span>
                  <span className="social-link">LinkedIn</span>
                  <span className="social-link">Twitter</span>
                </>
              )}
            </div>
          </div>
          
          <form className="contact-form fade-in" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">Name</label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input
                type="email"
                id="contact-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows="5"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
            {status === 'success' && <p className="form-message success">Message sent successfully!</p>}
            {status === 'error' && <p className="form-message error">Failed to send message. Please try again.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}