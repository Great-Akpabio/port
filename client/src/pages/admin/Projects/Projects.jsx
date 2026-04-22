import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', live_url: '', github_url: '', tech_stack: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    api.get('/projects')
      .then(res => { setProjects(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      const techStackJson = JSON.stringify(
        formData.tech_stack ? formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean) : []
      );
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('live_url', formData.live_url);
      data.append('github_url', formData.github_url);
      data.append('tech_stack', techStackJson);
      if (formData.image?.[0]) data.append('image', formData.image[0]);
      
      if (editProject) {
        await api.putForm(`/projects/${editProject.id}`, data);
      } else {
        await api.postForm('/projects', data);
      }
      setShowModal(false);
      setEditProject(null);
      setFormData({ title: '', description: '', live_url: '', github_url: '', tech_stack: '' });
      loadProjects();
    } catch (err) {
      alert('Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        loadProjects();
      } catch (err) {
        alert('Failed to delete project');
      }
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      live_url: project.live_url || '',
      github_url: project.github_url || '',
      tech_stack: (project.tech_stack || []).join(', ')
    });
    setShowModal(true);
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => { setEditProject(null); setFormData({ title: '', description: '', live_url: '', github_url: '', tech_stack: '' }); setShowModal(true); }}>
          + Add Project
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="projects-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td>
                    <div className="project-thumb">
                      {project.image ? <img src={project.image} alt={project.title} /> : <span>📁</span>}
                    </div>
                  </td>
                  <td>{project.title}</td>
                  <td className="desc-cell">{project.description?.substring(0, 60)}...</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" onClick={() => openEdit(project)}>✏️</button>
                      <button className="btn-icon danger" onClick={() => handleDelete(project.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && <p className="empty">No projects yet</p>}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editProject ? 'Edit Project' : 'Add Project'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" required />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={e => setFormData({...formData, image: e.target.files})} />
                {editProject?.image && <p className="file-info">Current: {editProject.image}</p>}
              </div>
              <div className="form-group">
                <label>Live URL</label>
                <input value={formData.live_url} onChange={e => setFormData({...formData, live_url: e.target.value})} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>GitHub URL</label>
                <input value={formData.github_url} onChange={e => setFormData({...formData, github_url: e.target.value})} placeholder="https://github.com/..." />
              </div>
              <div className="form-group">
                <label>Tech Stack (comma-separated)</label>
                <input value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProject ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}