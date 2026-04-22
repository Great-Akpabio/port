import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import './Messages.css';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    api.get('/messages')
      .then(res => { setMessages(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this message?')) {
      try {
        await api.delete(`/messages/${id}`);
        loadMessages();
        setSelectedMessage(null);
      } catch (err) {
        alert('Failed to delete message');
      }
    }
  };

  const handleMarkRead = async (id, readStatus) => {
    try {
      await api.put(`/messages/${id}`, { read_status: !readStatus });
      loadMessages();
    } catch (err) {
      alert('Failed to update message');
    }
  };

  const unreadCount = messages.filter(m => !m.read_status).length;

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>Messages {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : messages.length > 0 ? (
        <div className="messages-container">
          <div className="messages-list">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`message-card ${!msg.read_status ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                onClick={() => setSelectedMessage(msg)}
              >
                <div className="message-header">
                  <h3>{msg.name}</h3>
                  <span className="message-date">{new Date(msg.created_at).toLocaleDateString()}</span>
                </div>
                <p className="message-email">{msg.email}</p>
                <p className="message-preview">{msg.message?.length > 80 ? msg.message.substring(0, 80) + '...' : msg.message}</p>
              </div>
            ))}
          </div>

          {selectedMessage && (
            <div className="message-detail">
              <div className="detail-header">
                <h2>{selectedMessage.name}</h2>
                <div className="detail-actions">
                  <button 
                    className={`btn btn-sm ${selectedMessage.read_status ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleMarkRead(selectedMessage.id, selectedMessage.read_status)}
                  >
                    {selectedMessage.read_status ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(selectedMessage.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <div className="detail-meta">
                <p><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a></p>
                <p><strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div className="detail-content">
                <p>{selectedMessage.message}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="empty-state">No messages yet</p>
      )}
    </div>
  );
}