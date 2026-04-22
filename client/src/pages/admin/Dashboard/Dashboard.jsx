import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, messages: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/projects'),
      api.get('/messages')
    ]).then(([projectsRes, messagesRes]) => {
      setStats({ projects: projectsRes.data.length, messages: messagesRes.data.length });
      setRecentMessages(messagesRes.data.slice(0, 5));
    }).catch(console.error);
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Welcome back, {user?.name || 'Admin'}</h1>
        <p>Here's an overview of your portfolio</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <span className="stat-value">{stats.projects}</span>
            <span className="stat-label">Projects</span>
          </div>
          <Link to="/admin/projects" className="stat-link">Manage →</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <span className="stat-value">{stats.messages}</span>
            <span className="stat-label">Messages</span>
          </div>
          <Link to="/admin/messages" className="stat-link">View →</Link>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Messages</h2>
          <Link to="/admin/messages" className="view-all">View all</Link>
        </div>
        
        {recentMessages.length > 0 ? (
          <div className="messages-list">
            {recentMessages.map(msg => (
              <div key={msg.id} className="message-item">
                <div className="message-info">
                  <h4>{msg.name}</h4>
                  <p>{msg.email}</p>
                </div>
                <p className="message-preview">{msg.message?.length > 60 ? msg.message.substring(0, 60) + '...' : msg.message}</p>
                <span className="message-date">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No messages yet</p>
        )}
      </div>
    </div>
  );
}